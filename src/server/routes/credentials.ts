import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { credentials, servers, organizationUsers } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Validation schemas
const createCredentialSchema = z.object({
    serverId: z.string().uuid(),
    name: z.string().min(1).max(100),
    type: z.enum(['smtp', 'api']),
    key: z.string().min(1),
    secret: z.string().optional(),
});

const updateCredentialSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    secret: z.string().optional(),
});

// Helper to check access
async function checkCredentialAccess(userId: string, serverId: string) {
    const server = await db.query.servers.findFirst({
        where: eq(servers.id, serverId),
    });

    if (!server) return { server: null, membership: null }

    const membership = await db.query.organizationUsers.findFirst({
        where: and(
            eq(organizationUsers.organizationId, server.organizationId),
            eq(organizationUsers.userId, userId)
        ),
    })

    return { server, membership }
}

// List credentials for server
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

        const { server, membership } = await checkCredentialAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const credentialsList = await db.query.credentials.findMany({
            where: eq(credentials.serverId, serverId),
            orderBy: [desc(credentials.createdAt)],
        })

        res.json({ credentials: credentialsList })
    } catch (error) {
        console.error('Error fetching credentials:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
});

// Create credential
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const data = createCredentialSchema.parse(req.body)

        const { server, membership } = await checkCredentialAccess(userId, data.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create credentials' })
        }

        const key = uuidv4()
        const secret = uuidv4()

        // Hash the secret before inserting
        let hashedSecret: string | null = null
        if (data.secret) {
            hashedSecret = await hashSecret(data.secret)
        }

        const [credential] = await db.insert(credentials).values({
            serverId: data.serverId,
            name: data.name,
            type: data.type,
            key: data.key || key,
            secretHash: hashedSecret,
        }).returning()

        res.status(201).json({ credential })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating credential:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
});

// Regenerate credential key
router.post('/:id/regenerate', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const credentialId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const credential = await db.query.credentials.findFirst({
            where: eq(credentials.id, credentialId),
        })

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' })
        }

        const { server, membership } = await checkCredentialAccess(userId, credential.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can regenerate credentials' })
        }

        const newKey = uuidv4()
        const newSecret = uuidv4()
        const hashedNewSecret = await hashSecret(newSecret)

        const [updatedCredential] = await db
            .update(credentials)
            .set({
                key: newKey,
                secretHash: hashedNewSecret,
                updatedAt: new Date(),
            })
            .where(eq(credentials.id, credentialId))
            .returning()

        res.json({
            credential: updatedCredential,
            newKey,
            newSecret,
        })
    } catch (error) {
        console.error('Error regenerating credential:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
});

// Delete credential
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const credentialId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const credential = await db.query.credentials.findFirst({
            where: eq(credentials.id, credentialId),
        })

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' })
        }

        const { server, membership } = await checkCredentialAccess(userId, credential.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete credentials' })
        }

        await db.delete(credentials).where(eq(credentials.id, credentialId))

        res.json({ message: 'Credential deleted successfully' })
    } catch (error) {
        console.error('Error deleting credential:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
});

// Helper function to hash secret
async function hashSecret(secret: string): Promise<string> {
    const { createHash } = await import('crypto')
    return createHash('sha256').update(secret).digest('hex')
}

export default router
