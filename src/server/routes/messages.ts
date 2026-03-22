import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../db'
import { messages, servers, organizationUsers, deliveries, templates } from '../../db/schema'
import { eq, and, desc, like, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { injectTracking, incrementStat, fireWebhooks } from '../lib/tracking'

const router = Router()

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

// Validation schemas
const sendMessageSchema = z.object({
    serverId: z.string().uuid(),
    from: z.string().email(),
    to: z.array(z.string().email()).min(1),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string().min(1).max(998),
    plainBody: z.string().max(5_000_000).optional(),
    htmlBody: z.string().max(5_000_000).optional(),
    headers: z.record(z.string()).optional(),
    attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(), // base64 encoded
        contentType: z.string(),
    })).optional(),
    templateId: z.string().uuid().optional(),
    templateVariables: z.record(z.string()).optional(),
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

        // Template rendering
        let subject = data.subject
        let plainBody = data.plainBody
        let htmlBody = data.htmlBody

        if (data.templateId) {
            const template = await db.query.templates.findFirst({
                where: eq(templates.id, data.templateId),
            })

            if (!template) {
                return res.status(404).json({ error: 'Template not found' })
            }

            if (template.serverId !== data.serverId) {
                return res.status(403).json({ error: 'Template does not belong to this server' })
            }

            const variables = data.templateVariables || {}

            const render = (text: string | null, isHtml: boolean): string | null => {
                if (!text) return text
                return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                    const value = variables[key] ?? `{{${key}}}`
                    return isHtml ? escapeHtml(value) : value
                })
            }

            subject = render(template.subject, false) || subject
            plainBody = render(template.plainBody, false) || plainBody
            htmlBody = render(template.htmlBody, true) || htmlBody
        }

        // Inject open/click tracking into HTML before storing
        const messageToken = uuidv4()

        if (htmlBody && !server.privacyMode && (server.trackOpens || server.trackClicks)) {
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 9001}`
            htmlBody = injectTracking(htmlBody, messageToken, baseUrl, server.trackOpens, server.trackClicks)
        }

        // Create message
        const [message] = await db.insert(messages).values({
            serverId: data.serverId,
            messageId: `<${uuidv4()}@${server.defaultFromAddress?.split('@')[1] || 'mail.local'}>`,
            token: messageToken,
            direction: 'outgoing',
            fromAddress: data.from,
            toAddresses: data.to,
            ccAddresses: data.cc || [],
            bccAddresses: data.bcc || [],
            subject,
            plainBody,
            htmlBody,
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

        // Fire message_sent webhook + update stats (non-blocking)
        Promise.allSettled([
            incrementStat(data.serverId, 'messagesSent'),
            fireWebhooks(data.serverId, 'message_sent', {
                messageId: message.id,
                subject: message.subject,
                from: message.fromAddress,
                to: message.toAddresses,
                recipients: allRecipients.length,
            }),
        ]).catch(() => {})

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
