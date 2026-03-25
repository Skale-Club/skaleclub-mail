import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { db } from '../../db'
import { organizations, organizationUsers, users, } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { deleteOrganizationCascade } from '../lib/cascade'
import { isPlatformAdmin } from '../lib/admin'

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const router = Router()
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

        if (await isPlatformAdmin(userId)) {
            const allOrgs = await db.query.organizations.findMany({
                with: {},
            })
            return res.json({ organizations: allOrgs })
        }

        const memberships = await db.query.organizationUsers.findMany({
            where: eq(organizationUsers.userId, userId),
            with: {
                organization: {
                    with: {},
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

        const isAdmin = await isPlatformAdmin(userId)

        if (!isAdmin) {
            const membership = await db.query.organizationUsers.findFirst({
                where: and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, userId)
                ),
            })
            if (!membership) {
                return res.status(404).json({ error: 'Organization not found' })
            }
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
                
            },
        })

        const membership = isAdmin
            ? null
            : await db.query.organizationUsers.findFirst({
                where: and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, userId)
                ),
            })

        res.json({ organization, role: isAdmin ? 'admin' : membership?.role })
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

        const existingOrg = await db.query.organizations.findFirst({
            where: eq(organizations.slug, slug),
        })

        if (existingOrg) {
            return res.status(400).json({ error: 'Organization slug already exists' })
        }

        const isAdmin = await isPlatformAdmin(userId)

        const [organization] = await db.insert(organizations).values({
            name,
            slug,
            timezone: timezone || 'UTC',
            owner_id: userId,
        }).returning()

        // Platform admins are not added as members — they manage orgs externally.
        // Regular users become admin members of the orgs they create.
        if (!isAdmin) {
            await db.insert(organizationUsers).values({
                organizationId: organization.id,
                userId,
                role: 'admin',
            })
        }

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

        if (!await isPlatformAdmin(userId)) {
            const membership = await db.query.organizationUsers.findFirst({
                where: and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, userId)
                ),
            })
            if (!membership || membership.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' })
            }
        }

        const updates = updateOrganizationSchema.parse(req.body)

        const [updatedOrg] = await db
            .update(organizations)
            .set({ ...updates, updatedAt: new Date() })
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

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        })

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' })
        }

        const isAdmin = await isPlatformAdmin(userId)
        if (!isAdmin && organization.owner_id !== userId) {
            return res.status(403).json({ error: 'Only the owner can delete the organization' })
        }

        await deleteOrganizationCascade(organizationId)

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

        if (!await isPlatformAdmin(userId)) {
            const membership = await db.query.organizationUsers.findFirst({
                where: and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, userId)
                ),
            })
            if (!membership || membership.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' })
            }
        }

        const { email, role, password } = addMemberSchema.extend({
            password: z.string().min(6).optional(),
        }).parse(req.body)

        let userToAdd = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        // If user doesn't exist yet, create them via Supabase Admin and sync to DB
        if (!userToAdd) {
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: password ?? undefined,
                email_confirm: true,
            })

            if (authError || !authData.user) {
                return res.status(400).json({ error: authError?.message || 'Failed to create user account' })
            }

            const [created] = await db.insert(users).values({
                id: authData.user.id,
                email,
                firstName: null,
                lastName: null,
            }).returning()

            userToAdd = created
        }

        const existingMembership = await db.query.organizationUsers.findFirst({
            where: and(
                eq(organizationUsers.organizationId, organizationId),
                eq(organizationUsers.userId, userToAdd.id)
            ),
        })

        if (existingMembership) {
            return res.status(400).json({ error: 'User is already a member' })
        }

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

        if (!await isPlatformAdmin(userId)) {
            const membership = await db.query.organizationUsers.findFirst({
                where: and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, userId)
                ),
            })
            if (!membership || membership.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' })
            }
        }

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

        if (!await isPlatformAdmin(userId)) {
            const membership = await db.query.organizationUsers.findFirst({
                where: and(
                    eq(organizationUsers.organizationId, organizationId),
                    eq(organizationUsers.userId, userId)
                ),
            })
            if (!membership || membership.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' })
            }
        }

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        })

        if (organization?.owner_id === targetUserId) {
            return res.status(400).json({ error: "Cannot change the owner's role" })
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
