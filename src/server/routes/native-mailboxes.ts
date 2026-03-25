import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { nativeMailboxes, mailboxes, mailFolders, mailMessages } from '../../db/schema'
import { encryptSecret as encrypt } from '../lib/crypto'

const router = Router()
const BCRYPT_ROUNDS = 12

// GET /api/native-mailboxes — list user's native mailboxes
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const accounts = await db.query.nativeMailboxes.findMany({
            where: eq(nativeMailboxes.organizationId, userId),
            columns: {
                id: true,
                email: true,
                isActive: true,
                quotaBytes: true,
                usedBytes: true,
                createdAt: true,
                // passwordHash intentionally excluded
            },
        })

        res.json({ accounts })
    } catch (error) {
        console.error('Error fetching native mailboxes:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/native-mailboxes — create a new native mailbox
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const schema = z.object({
            email: z.string().email('Invalid email address'),
            password: z.string().min(8, 'Password must be at least 8 characters'),
            displayName: z.string().optional(),
            isDefault: z.boolean().default(false),
        })

        const data = schema.parse(req.body)

        // Check email uniqueness
        const existing = await db.query.nativeMailboxes.findFirst({
            where: eq(nativeMailboxes.email, data.email),
        })
        if (existing) {
            return res.status(409).json({ error: 'This email address is already in use' })
        }

        const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

        // If marking as default, unset other defaults first
        if (data.isDefault) {
            await db.update(nativeMailboxes)
                .set({ updatedAt: new Date() })
                .where(eq(nativeMailboxes.organizationId, userId))
        }

        const [account] = await db.insert(nativeMailboxes).values({
            organizationId: userId,
            email: data.email,
            username: data.email.split('@')[0],
            passwordHash,
        }).returning()

        // Create a companion mailboxes entry so the existing mail API
        // (folders, messages, etc.) works out-of-the-box.
        // Point SMTP/IMAP to localhost (our own servers).
        const smtpHost = process.env.MAIL_HOST || 'localhost'
        const smtpPort = parseInt(process.env.SMTP_SUBMISSION_PORT || '2587')
        const imapHost = process.env.MAIL_HOST || 'localhost'
        const imapPort = parseInt(process.env.IMAP_PORT || '2993')

        // We store a placeholder encrypted password; the real auth is via nativeMailboxes.passwordHash
        // The companion mailbox is used only for folder/message storage, not for IMAP sync.
        const encryptedPlaceholder = encrypt('__NATIVE__')
        const [companion] = await db.insert(mailboxes).values({
            userId,
            email: data.email,
            displayName: data.displayName,
            smtpHost,
            smtpPort,
            smtpUsername: data.email,
            smtpPasswordEncrypted: encryptedPlaceholder,
            smtpSecure: false,
            imapHost,
            imapPort,
            imapUsername: data.email,
            imapPasswordEncrypted: encryptedPlaceholder,
            imapSecure: false,
            isDefault: data.isDefault,
        }).returning()

        // Create default folders
        await db.insert(mailFolders).values([
            { mailboxId: companion.id, remoteId: 'INBOX', name: 'Inbox', type: 'inbox' },
            { mailboxId: companion.id, remoteId: 'Sent', name: 'Sent', type: 'sent' },
            { mailboxId: companion.id, remoteId: 'Drafts', name: 'Drafts', type: 'drafts' },
            { mailboxId: companion.id, remoteId: 'Trash', name: 'Trash', type: 'trash' },
            { mailboxId: companion.id, remoteId: 'Spam', name: 'Spam', type: 'spam' },
        ])

        res.status(201).json({
            account: {
                id: account.id,
                mailboxId: companion.id, // companion ID for the mail API
                email: account.email,
                isActive: account.isActive,
                quotaBytes: account.quotaBytes,
                smtpHost,
                smtpPort,
                imapHost,
                imapPort,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating native mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/native-mailboxes/:id/password — change password
router.put('/:id/password', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const schema = z.object({
            currentPassword: z.string(),
            newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        })

        const data = schema.parse(req.body)

        const account = await db.query.nativeMailboxes.findFirst({
            where: and(
                eq(nativeMailboxes.id, accountId),
                eq(nativeMailboxes.organizationId, userId)
            ),
        })

        if (!account) return res.status(404).json({ error: 'Account not found' })

        const valid = await bcrypt.compare(data.currentPassword, account.passwordHash)
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

        const newHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS)

        await db.update(nativeMailboxes)
            .set({ passwordHash: newHash, updatedAt: new Date() })
            .where(eq(nativeMailboxes.id, accountId))

        res.json({ success: true, message: 'Password updated successfully' })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating password:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/native-mailboxes/:id — update display name / isDefault / isActive
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const schema = z.object({
            displayName: z.string().optional(),
            isDefault: z.boolean().optional(),
            isActive: z.boolean().optional(),
        })

        const data = schema.parse(req.body)

        const account = await db.query.nativeMailboxes.findFirst({
            where: and(
                eq(nativeMailboxes.id, accountId),
                eq(nativeMailboxes.organizationId, userId)
            ),
        })

        if (!account) return res.status(404).json({ error: 'Account not found' })

        if (data.isDefault) {
            await db.update(nativeMailboxes)
                .set({ updatedAt: new Date() })
                .where(eq(nativeMailboxes.organizationId, userId))
        }

        const [updated] = await db.update(nativeMailboxes)
            .set({
                ...(data.displayName !== undefined && { displayName: data.displayName }),
                ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                updatedAt: new Date(),
            })
            .where(eq(nativeMailboxes.id, accountId))
            .returning()

        res.json({
            account: {
                id: updated.id,
                email: updated.email,
                isActive: updated.isActive,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating native mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// DELETE /api/native-mailboxes/:id — delete account and all its messages
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const accountId = req.params.id
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const account = await db.query.nativeMailboxes.findFirst({
            where: and(
                eq(nativeMailboxes.id, accountId),
                eq(nativeMailboxes.organizationId, userId)
            ),
        })

        if (!account) return res.status(404).json({ error: 'Account not found' })

        // Find companion mailbox
        const companion = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.userId, userId),
                eq(mailboxes.email, account.email)
            ),
        })

        if (companion) {
            await db.delete(mailMessages).where(eq(mailMessages.mailboxId, companion.id))
            await db.delete(mailFolders).where(eq(mailFolders.mailboxId, companion.id))
            await db.delete(mailboxes).where(eq(mailboxes.id, companion.id))
        }

        await db.delete(nativeMailboxes).where(eq(nativeMailboxes.id, accountId))

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting native mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// GET /api/native-mailboxes/server-info — returns SMTP/IMAP server connection info
router.get('/server-info', async (_req: Request, res: Response) => {
    const mailHost = process.env.MAIL_HOST || 'localhost'
    const smtpPort = parseInt(process.env.SMTP_SUBMISSION_PORT || '2587')
    const imapPort = parseInt(process.env.IMAP_PORT || '2993')

    res.json({
        smtp: {
            host: mailHost,
            port: smtpPort,
            security: 'STARTTLS',
            auth: 'PLAIN/LOGIN',
            description: 'Use your native mailbox email and password to authenticate',
        },
        imap: {
            host: mailHost,
            port: imapPort,
            security: 'SSL/TLS',
            auth: 'PLAIN',
            description: 'Use your native mailbox email and password to authenticate',
        },
    })
})

export default router
