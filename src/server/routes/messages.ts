import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../db'
import { messages, servers, organizationUsers, deliveries } from '../../db/schema'
import { eq, and, desc, like, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Validation schemas
const sendMessageSchema = z.object({
    serverId: z.string().uuid(),
    from: z.string().email(),
    to: z.array(z.string().email()).min(1),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string().min(1),
    plainBody: z.string().optional(),
    htmlBody: z.string().optional(),
    headers: z.record(z.string()).optional(),
    attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(), // base64 encoded
        contentType: z.string(),
    })).optional(),
})

const searchMessagesSchema = z.object({
    query: z.string().optional(),
    status: z.enum(['pending', 'queued', 'sent', 'delivered', 'bounced', 'held', 'failed']).optional(),
    direction: z.enum(['incoming', 'outgoing']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
})

// Helper to check access
async function checkMessageAccess(userId: string, serverId: string) {
    const server = await db.query.servers.findFirst({
        where: eq(servers.id, serverId),
    })

    if (!server) return { server: null, membership: null }

    const membership = await db.query.organizationUsers.findFirst({
        where: and(
            eq(organizationUsers.organizationId, server.organizationId),
            eq(organizationUsers.userId, userId)
        ),
    })

    return { server, membership }
}

// List/search messages
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.query.serverId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!serverId) {
            return res.status(400).json({ error: 'Server ID required' })
        }

        const { server, membership } = await checkMessageAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const { query, status, direction, from, to, page, limit } = searchMessagesSchema.parse(req.query)
        const offset = (page - 1) * limit

        // Build where conditions
        const conditions = [eq(messages.serverId, serverId)]

        if (status) {
            conditions.push(eq(messages.status, status))
        }

        if (direction) {
            conditions.push(eq(messages.direction, direction))
        }

        if (from) {
            conditions.push(like(messages.fromAddress, `%${from}%`))
        }

        if (to) {
            conditions.push(sql`${messages.toAddresses}::text like ${'%' + to + '%'}`)
        }

        const messagesList = await db.query.messages.findMany({
            where: and(...conditions),
            orderBy: [desc(messages.createdAt)],
            limit,
            offset,
        })

        // Get total count for pagination
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(and(...conditions))

        res.json({
            messages: messagesList,
            pagination: {
                page,
                limit,
                total: Number(count),
                totalPages: Math.ceil(Number(count) / limit),
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get message by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const messageId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
            with: {
                deliveries: true,
            },
        })

        if (!message) {
            return res.status(404).json({ error: 'Message not found' })
        }

        const { server, membership } = await checkMessageAccess(userId, message.serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        res.json({ message })
    } catch (error) {
        console.error('Error fetching message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Send new message
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const data = sendMessageSchema.parse(req.body)

        const { server, membership } = await checkMessageAccess(userId, data.serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        if (server.suspended) {
            return res.status(400).json({ error: 'Server is suspended' })
        }

        // Create message
        const [message] = await db.insert(messages).values({
            serverId: data.serverId,
            messageId: `<${uuidv4()}@${server.defaultFromAddress?.split('@')[1] || 'mail.local'}>`,
            token: uuidv4(),
            direction: 'outgoing',
            fromAddress: data.from,
            toAddresses: data.to,
            ccAddresses: data.cc || [],
            bccAddresses: data.bcc || [],
            subject: data.subject,
            plainBody: data.plainBody,
            htmlBody: data.htmlBody,
            headers: data.headers || {},
            attachments: data.attachments || [],
            status: 'queued',
        }).returning()

        // Create deliveries for each recipient
        const allRecipients = [...data.to, ...(data.cc || []), ...(data.bcc || [])]

        for (const recipient of allRecipients) {
            await db.insert(deliveries).values({
                messageId: message.id,
                serverId: data.serverId,
                rcptTo: recipient,
                status: 'pending',
            })
        }

        // In a real implementation, this would trigger the email sending process
        // For now, we'll just return the message

        res.status(201).json({
            message,
            recipients: allRecipients.length,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error sending message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Release held message
router.post('/:id/release', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const messageId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        })

        if (!message) {
            return res.status(404).json({ error: 'Message not found' })
        }

        const { server, membership } = await checkMessageAccess(userId, message.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can release held messages' })
        }

        if (!message.held) {
            return res.status(400).json({ error: 'Message is not held' })
        }

        const [updatedMessage] = await db
            .update(messages)
            .set({
                held: false,
                holdExpiry: null,
                heldReason: null,
                status: 'queued',
                updatedAt: new Date(),
            })
            .where(eq(messages.id, messageId))
            .returning()

        res.json({ message: updatedMessage })
    } catch (error) {
        console.error('Error releasing message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete message
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const messageId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
        })

        if (!message) {
            return res.status(404).json({ error: 'Message not found' })
        }

        const { server, membership } = await checkMessageAccess(userId, message.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete messages' })
        }

        // Delete deliveries first
        await db.delete(deliveries).where(eq(deliveries.messageId, messageId))
        // Delete message
        await db.delete(messages).where(eq(messages.id, messageId))

        res.json({ message: 'Message deleted successfully' })
    } catch (error) {
        console.error('Error deleting message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get message attachments
router.get('/:id/attachments', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const messageId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
            columns: {
                id: true,
                serverId: true,
                attachments: true,
            },
        })

        if (!message) {
            return res.status(404).json({ error: 'Message not found' })
        }

        const { server, membership } = await checkMessageAccess(userId, message.serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        res.json({ attachments: message.attachments || [] })
    } catch (error) {
        console.error('Error fetching attachments:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
