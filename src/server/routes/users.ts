import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { db } from '../../db'
import { users, organizationUsers, organizations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()

// Supabase admin client for user creation
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

// Admin: Create new user
router.post('/', async (req: Request, res: Response) => {
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
            return res.status(403).json({ error: 'Forbidden - Admin access required' })
        }

        // Validation schema
        const createUserSchema = z.object({
            email: z.string().email('Invalid email address'),
            password: z.string().min(8, 'Password must be at least 8 characters'),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            isAdmin: z.boolean().default(false),
            sendInvite: z.boolean().default(true), // If true, send password reset email instead of setting password
        })

        const userData = createUserSchema.parse(req.body)

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, userData.email),
        })

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' })
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.sendInvite ? undefined : userData.password,
            email_confirm: true,
            user_metadata: {
                firstName: userData.firstName,
                lastName: userData.lastName,
            },
        })

        if (authError) {
            console.error('Supabase auth error:', authError)
            return res.status(400).json({ error: authError.message })
        }

        if (!authData.user) {
            return res.status(500).json({ error: 'Failed to create user' })
        }

        // Create user profile in database
        const [newUser] = await db.insert(users).values({
            id: authData.user.id,
            email: userData.email,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            isAdmin: userData.isAdmin,
            emailVerified: true,
        }).returning()

        // If sendInvite is true, send password reset email
        if (userData.sendInvite) {
            await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: userData.email,
                options: {
                    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
                },
            })
        }

        res.status(201).json({
            message: userData.sendInvite
                ? 'User created successfully. Invitation email sent.'
                : 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                isAdmin: newUser.isAdmin,
                createdAt: newUser.createdAt,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating user:', error)
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

// Admin: Update user
router.patch('/:id', async (req: Request, res: Response) => {
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

        // Validation schema
        const updateUserSchema = z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            isAdmin: z.boolean().optional(),
            emailVerified: z.boolean().optional(),
        })

        const updates = updateUserSchema.parse(req.body)

        const [updatedUser] = await db
            .update(users)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(users.id, targetUserId))
            .returning()

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                isAdmin: updatedUser.isAdmin,
                emailVerified: updatedUser.emailVerified,
                createdAt: updatedUser.createdAt,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Admin: Resend invitation
router.post('/:id/resend-invite', async (req: Request, res: Response) => {
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

        // Get target user
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
        })

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Send password reset email as invitation
        const { error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: targetUser.email,
            options: {
                redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
            },
        })

        if (error) {
            console.error('Error sending invite:', error)
            return res.status(400).json({ error: error.message })
        }

        res.json({ message: 'Invitation email sent successfully' })
    } catch (error) {
        console.error('Error resending invite:', error)
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

        // Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
        if (authError) {
            console.error('Error deleting user from auth:', authError)
        }

        // Delete from database
        await db.delete(users).where(eq(users.id, targetUserId))

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
