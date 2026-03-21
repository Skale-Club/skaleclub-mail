import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../db'
import { organizations, organizationUsers, users, servers } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()

// Validation schemas
const createOrganizationSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    timezone: z.string().optional(),
})

const updateOrganizationSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    timezone: z.string().optional(),
})

const addMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'member', 'viewer']).default('member'),
})

// List organizations for current user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const memberships = await db.query.organizationUsers.findMany({
            where: eq(organizationUsers.userId, userId),
            with: {
                organization: {
                    with: {
                        servers: true,
                    },
                },
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

// Get organization by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if user is a member
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership) {
            return res.status(404).json({ error: 'Organization not found' })
        }

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
            with: {
                owner: true,
                members: {
                    with: {
                        user: {
                            columns: {
                                passwordHash: false,
                                twoFactorSecret: false,
                            },
                        },
                    },
                },
                servers: true,
            },
        })

        res.json({ organization, role: membership.role })
    } catch (error) {
        console.error('Error fetching organization:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create organization
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { name, slug, timezone } = createOrganizationSchema.parse(req.body)

        // Check if slug already exists
        const existingOrg = await db.query.organizations.findFirst({
            where: eq(organizations.slug, slug),
        })

        if (existingOrg) {
            return res.status(400).json({ error: 'Organization slug already exists' })
        }

        // Create organization
        const [organization] = await db.insert(organizations).values({
            name,
            slug,
            timezone: timezone || 'UTC',
            owner_id: userId,
        }).returning()

        // Add owner as admin member
        await db.insert(organizationUsers).values({
            organizationId: organization.id,
            userId,
            role: 'admin',
        })

        res.status(201).json({ organization })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating organization:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update organization
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if user is admin
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const updates = updateOrganizationSchema.parse(req.body)

        const [updatedOrg] = await db
            .update(organizations)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, organizationId))
            .returning()

        res.json({ organization: updatedOrg })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating organization:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete organization
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if user is owner
        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        })

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' })
        }

        if (organization.owner_id !== userId) {
            return res.status(403).json({ error: 'Only the owner can delete the organization' })
        }

        // Delete all related data
        await db.delete(organizationUsers).where(eq(organizationUsers.organizationId, organizationId))
        await db.delete(organizations).where(eq(organizations.id, organizationId))

        res.json({ message: 'Organization deleted successfully' })
    } catch (error) {
        console.error('Error deleting organization:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Add member to organization
router.post('/:id/members', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if user is admin
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const { email, role } = addMemberSchema.parse(req.body)

        // Find user by email
        const userToAdd = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check if already a member
        const existingMembership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userToAdd.id)
            ),
        })

        if (existingMembership) {
            return res.status(400).json({ error: 'User is already a member' })
        }

        // Add member
        const [newMembership] = await db.insert(organizationUsers).values({
            organizationId,
            userId: userToAdd.id,
            role,
        }).returning()

        res.status(201).json({ membership: newMembership })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error adding member:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Remove member from organization
router.delete('/:id/members/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.params.id
        const targetUserId = req.params.userId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check if user is admin
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        // Cannot remove owner
        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        })

        if (organization?.owner_id === targetUserId) {
            return res.status(400).json({ error: 'Cannot remove the owner' })
        }

        await db.delete(organizationUsers).where(
            and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, targetUserId)
            )
        )

        res.json({ message: 'Member removed successfully' })
    } catch (error) {
        console.error('Error removing member:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update member role
router.patch('/:id/members/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.params.id
        const targetUserId = req.params.userId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { role } = z.object({
            role: z.enum(['admin', 'member', 'viewer']),
        }).parse(req.body)

        // Check if user is admin
        const membership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userId)
            ),
        })

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        // Cannot change owner's role
        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        })

        if (organization?.owner_id === targetUserId) {
            return res.status(400).json({ error: 'Cannot change the owner\'s role' })
        }

        const [updatedMembership] = await db
            .update(organizationUsers)
            .set({ role })
            .where(
                and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, targetUserId)
                )
            )
            .returning()

        res.json({ membership: updatedMembership })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating member role:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
