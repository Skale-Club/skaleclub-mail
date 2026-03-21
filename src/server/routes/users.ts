import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../db'
import { users, organizationUsers, organizations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                passwordHash: false,
                twoFactorSecret: false,
            },
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user })
    } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update current user profile
router.patch('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const updateSchema = z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            avatarUrl: z.string().url().optional(),
        })

        const updates = updateSchema.parse(req.body)

        const [updatedUser] = await db
            .update(users)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning()

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user: updatedUser })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get user's organizations
router.get('/organizations', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const memberships = await db.query.organizationUsers.findMany({
            where: eq(organizationUsers.userId, userId),
            with: {
                organization: true,
            },
        })

        const organizationsList = memberships.map((m) => ({
            ...m.organization,
            role: m.role,
        }))

        res.json({ organizations: organizationsList })
    } catch (error) {
        console.error('Error fetching organizations:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Admin: List all users
router.get('/', async (req: Request, res: Response) => {
    try {
        const requestingUserId = req.headers['x-user-id'] as string

        if (!requestingUserId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if requesting user is admin
        const requestingUser = await db.query.users.findFirst({
            where: eq(users.id, requestingUserId),
        })

        if (!requestingUser?.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const allUsers = await db.query.users.findMany({
            columns: {
                passwordHash: false,
                twoFactorSecret: false,
            },
        })

        res.json({ users: allUsers })
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Admin: Delete user
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const requestingUserId = req.headers['x-user-id'] as string
        const targetUserId = req.params.id

        if (!requestingUserId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if requesting user is admin
        const requestingUser = await db.query.users.findFirst({
            where: eq(users.id, requestingUserId),
        })

        if (!requestingUser?.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        // Prevent self-deletion
        if (requestingUserId === targetUserId) {
            return res.status(400).json({ error: 'Cannot delete yourself' })
        }

        await db.delete(users).where(eq(users.id, targetUserId))

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
