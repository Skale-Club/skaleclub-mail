import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../db'
import { servers, organizationUsers, messages } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

const router = Router()

// Validation schemas
const createServerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    organizationId: z.string().uuid(),
    mode: z.enum(['live', 'development']).default('live'),
    sendMode: z.enum(['smtp', 'api']).default('smtp'),
    description: z.string().optional(),
    defaultFromAddress: z.string().email().optional(),
    defaultFromName: z.string().optional(),
})

const updateServerSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    mode: z.enum(['live', 'development']).optional(),
    sendMode: z.enum(['smtp', 'api']).optional(),
    description: z.string().optional(),
    defaultFromAddress: z.string().email().optional(),
    defaultFromName: z.string().optional(),
    sendLimit: z.number().int().min(0).optional(),
    trackOpens: z.boolean().optional(),
    trackClicks: z.boolean().optional(),
    retentionDays: z.number().int().min(1).max(365).optional(),
    suspended: z.boolean().optional(),
    suspendedReason: z.string().optional(),
})

// Helper to check server access
async function checkServerAccess(userId: string, serverId: string) {
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

// List servers for organization
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.query.organizationId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!organizationId) {
            return res.status(400).json({ error: 'Organization ID required' })
        }

        // Check membership
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const serversList = await db.query.servers.findMany({
            where: eq(servers.organizationId, organizationId),
            orderBy: [desc(servers.createdAt)],
        })

        res.json({ servers: serversList })
    } catch (error) {
        console.error('Error fetching servers:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get server by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { server, membership } = await checkServerAccess(userId, serverId)

        if (!server) {
            return res.status(404).json({ error: 'Server not found' })
        }

        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        res.json({ server, role: membership.role })
    } catch (error) {
        console.error('Error fetching server:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create server
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const data = createServerSchema.parse(req.body)

        // Check membership
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, data.organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create servers' })
        }

        const [server] = await db.insert(servers).values({
            ...data,
            organizationId: data.organizationId,
        }).returning()

        res.status(201).json({ server })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating server:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update server
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const updates = updateServerSchema.parse(req.body)

        const { server, membership } = await checkServerAccess(userId, serverId)

        if (!server) {
            return res.status(404).json({ error: 'Server not found' })
        }

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update servers' })
        }

        const [updatedServer] = await db
            .update(servers)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(servers.id, serverId))
            .returning()

        res.json({ server: updatedServer })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating server:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete server
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { server, membership } = await checkServerAccess(userId, serverId)

        if (!server) {
            return res.status(404).json({ error: 'Server not found' })
        }

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete servers' })
        }

        await db.delete(servers).where(eq(servers.id, serverId))

        res.json({ message: 'Server deleted successfully' })
    } catch (error) {
        console.error('Error deleting server:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get server statistics
router.get('/:id/statistics', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.params.id
        const days = parseInt(req.query.days as string) || 30

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { server, membership } = await checkServerAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(404).json({ error: 'Server not found' })
        }

        // Get message counts
        const stats = await db
            .select({
                status: messages.status,
                count: sql<number>`count(*)`.as('count'),
            })
            .from(messages)
            .where(eq(messages.serverId, serverId))
            .groupBy(messages.status)

        // Get recent activity
        const recentMessages = await db.query.messages.findMany({
            where: eq(messages.serverId, serverId),
            orderBy: [desc(messages.createdAt)],
            limit: 10,
        })

        res.json({
            statistics: stats,
            recentMessages,
        })
    } catch (error) {
        console.error('Error fetching statistics:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get held messages queue
router.get('/:id/queue', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { server, membership } = await checkServerAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(404).json({ error: 'Server not found' })
        }

        const heldMessages = await db.query.messages.findMany({
            where: and(
                eq(messages.serverId, serverId),
                eq(messages.held, true)
            ),
            orderBy: [desc(messages.createdAt)],
            limit: 100,
        })

        res.json({ messages: heldMessages })
    } catch (error) {
        console.error('Error fetching queue:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
