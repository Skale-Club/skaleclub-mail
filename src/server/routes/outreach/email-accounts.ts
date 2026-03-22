import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../../db'
import { emailAccounts, organizationUsers } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'

const router = Router()

// Validation schemas
const createEmailAccountSchema = z.object({
    email: z.string().email('Invalid email address'),
    displayName: z.string().optional(),
    smtpHost: z.string().min(1, 'SMTP host is required'),
    smtpPort: z.number().int().min(1).max(65535).default(587),
    smtpUsername: z.string().min(1, 'SMTP username is required'),
    smtpPassword: z.string().min(1, 'SMTP password is required'),
    smtpSecure: z.boolean().default(true),
    imapHost: z.string().optional(),
    imapPort: z.number().int().min(1).max(65535).default(993),
    imapUsername: z.string().optional(),
    imapPassword: z.string().optional(),
    imapSecure: z.boolean().default(true),
    dailySendLimit: z.number().int().min(1).max(10000).default(50),
    minMinutesBetweenEmails: z.number().int().min(1).default(5),
    maxMinutesBetweenEmails: z.number().int().min(1).default(30),
    warmupEnabled: z.boolean().default(true),
    warmupDays: z.number().int().min(1).max(60).default(14),
})

const updateEmailAccountSchema = z.object({
    displayName: z.string().optional(),
    smtpHost: z.string().min(1).optional(),
    smtpPort: z.number().int().min(1).max(65535).optional(),
    smtpUsername: z.string().min(1).optional(),
    smtpPassword: z.string().min(1).optional(),
    smtpSecure: z.boolean().optional(),
    imapHost: z.string().optional(),
    imapPort: z.number().int().min(1).max(65535).optional(),
    imapUsername: z.string().optional(),
    imapPassword: z.string().optional(),
    imapSecure: z.boolean().optional(),
    dailySendLimit: z.number().int().min(1).max(10000).optional(),
    minMinutesBetweenEmails: z.number().int().min(1).optional(),
    maxMinutesBetweenEmails: z.number().int().min(1).optional(),
    warmupEnabled: z.boolean().optional(),
    warmupDays: z.number().int().min(1).max(60).optional(),
    status: z.enum(['pending', 'verified', 'failed', 'paused']).optional(),
})

// Helper to check org membership
async function checkOrgMembership(userId: string, organizationId: string) {
    const membership = await db.query.organizationUsers.findFirst({
        where: and(
            eq(organizationUsers.organizationId, organizationId),
            eq(organizationUsers.userId, userId)
        ),
    })
    return membership
}

// List email accounts for organization
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.query.organizationId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!organizationId) {
            return res.status(400).json({ error: 'organizationId is required' })
        }

        const membership = await checkOrgMembership(userId, organizationId)
        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const accounts = await db.query.emailAccounts.findMany({
            where: eq(emailAccounts.organizationId, organizationId),
            orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
        })

        // Remove sensitive data
        const safeAccounts = accounts.map((account) => ({
            ...account,
            smtpPassword: undefined,
            imapPassword: undefined,
        }))

        res.json({ emailAccounts: safeAccounts })
    } catch (error) {
        console.error('Error fetching email accounts:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get email account by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const account = await db.query.emailAccounts.findFirst({
            where: eq(emailAccounts.id, accountId),
        })

        if (!account) {
            return res.status(404).json({ error: 'Email account not found' })
        }

        const membership = await checkOrgMembership(userId, account.organizationId)
        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        res.json({
            emailAccount: {
                ...account,
                smtpPassword: undefined,
                imapPassword: undefined,
            },
        })
    } catch (error) {
        console.error('Error fetching email account:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create email account
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.query.organizationId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!organizationId) {
            return res.status(400).json({ error: 'organizationId is required' })
        }

        const membership = await checkOrgMembership(userId, organizationId)
        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const validatedData = createEmailAccountSchema.parse(req.body)

        // Check for duplicate email
        const existing = await db.query.emailAccounts.findFirst({
            where: and(
                eq(emailAccounts.organizationId, organizationId),
                eq(emailAccounts.email, validatedData.email)
            ),
        })

        if (existing) {
            return res.status(400).json({ error: 'Email account already exists' })
        }

        const [newAccount] = await db.insert(emailAccounts).values({
            organizationId,
            ...validatedData,
            status: 'pending',
        }).returning()

        res.status(201).json({
            emailAccount: {
                ...newAccount,
                smtpPassword: undefined,
                imapPassword: undefined,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors })
        }
        console.error('Error creating email account:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update email account
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const account = await db.query.emailAccounts.findFirst({
            where: eq(emailAccounts.id, accountId),
        })

        if (!account) {
            return res.status(404).json({ error: 'Email account not found' })
        }

        const membership = await checkOrgMembership(userId, account.organizationId)
        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const validatedData = updateEmailAccountSchema.parse(req.body)

        const [updatedAccount] = await db.update(emailAccounts)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(emailAccounts.id, accountId))
            .returning()

        res.json({
            emailAccount: {
                ...updatedAccount,
                smtpPassword: undefined,
                imapPassword: undefined,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors })
        }
        console.error('Error updating email account:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete email account
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const account = await db.query.emailAccounts.findFirst({
            where: eq(emailAccounts.id, accountId),
        })

        if (!account) {
            return res.status(404).json({ error: 'Email account not found' })
        }

        const membership = await checkOrgMembership(userId, account.organizationId)
        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        await db.delete(emailAccounts).where(eq(emailAccounts.id, accountId))

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting email account:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Verify email account (test connection)
router.post('/:id/verify', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const account = await db.query.emailAccounts.findFirst({
            where: eq(emailAccounts.id, accountId),
        })

        if (!account) {
            return res.status(404).json({ error: 'Email account not found' })
        }

        const membership = await checkOrgMembership(userId, account.organizationId)
        if (!membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        // TODO: Implement actual SMTP/IMAP connection test
        // For now, just mark as verified
        const [updatedAccount] = await db.update(emailAccounts)
            .set({
                status: 'verified',
                verifiedAt: new Date(),
                lastError: null,
                updatedAt: new Date(),
            })
            .where(eq(emailAccounts.id, accountId))
            .returning()

        res.json({
            emailAccount: {
                ...updatedAccount,
                smtpPassword: undefined,
                imapPassword: undefined,
            },
            verified: true,
        })
    } catch (error) {
        console.error('Error verifying email account:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
