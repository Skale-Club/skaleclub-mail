import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../db'
import { domains, servers, organizationUsers } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Validation schemas
const createDomainSchema = z.object({
    serverId: z.string().uuid(),
    name: z.string().min(1).max(255),
    verificationMethod: z.enum(['dns', 'email']).default('dns'),
})

// Helper to check access
async function checkDomainAccess(userId: string, serverId: string) {
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

// List domains for server
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

        const { server, membership } = await checkDomainAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const domainsList = await db.query.domains.findMany({
            where: eq(domains.serverId, serverId),
        })

        res.json({ domains: domainsList })
    } catch (error) {
        console.error('Error fetching domains:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get domain by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const domainId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const domain = await db.query.domains.findFirst({
            where: eq(domains.id, domainId),
        })

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' })
        }

        const { server, membership } = await checkDomainAccess(userId, domain.serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        res.json({ domain })
    } catch (error) {
        console.error('Error fetching domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create domain
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const data = createDomainSchema.parse(req.body)

        const { server, membership } = await checkDomainAccess(userId, data.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add domains' })
        }

        // Check if domain already exists
        const existingDomain = await db.query.domains.findFirst({
            where: and(
                eq(domains.serverId, data.serverId),
                eq(domains.name, data.name)
            ),
        })

        if (existingDomain) {
            return res.status(400).json({ error: 'Domain already exists' })
        }

        const [domain] = await db.insert(domains).values({
            serverId: data.serverId,
            name: data.name,
            verificationMethod: data.verificationMethod,
            verificationToken: uuidv4(),
        }).returning()

        res.status(201).json({ domain })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Verify domain
router.post('/:id/verify', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const domainId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const domain = await db.query.domains.findFirst({
            where: eq(domains.id, domainId),
        })

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' })
        }

        const { server, membership } = await checkDomainAccess(userId, domain.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can verify domains' })
        }

        // In a real implementation, this would check DNS records
        // For now, we'll just mark it as verified
        const [updatedDomain] = await db
            .update(domains)
            .set({
                verificationStatus: 'verified',
                verifiedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(domains.id, domainId))
            .returning()

        res.json({ domain: updatedDomain })
    } catch (error) {
        console.error('Error verifying domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete domain
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const domainId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const domain = await db.query.domains.findFirst({
            where: eq(domains.id, domainId),
        })

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' })
        }

        const { server, membership } = await checkDomainAccess(userId, domain.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete domains' })
        }

        await db.delete(domains).where(eq(domains.id, domainId))

        res.json({ message: 'Domain deleted successfully' })
    } catch (error) {
        console.error('Error deleting domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
