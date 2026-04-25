import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../../db'
import { mailboxes, mailFolders, users } from '../../../db/schema'
import { encryptSecret } from '../../lib/crypto'
import { authenticateNativeUser, createUserMailbox, deleteMailboxById } from '../../lib/native-mail'

const router = Router()

export async function checkUserMailboxAccess(userId: string, mailboxId: string) {
    const [user, mailbox] = await Promise.all([
        db.query.users.findFirst({
            where: eq(users.id, userId),
        }),
        db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.id, mailboxId),
                eq(mailboxes.userId, userId)
            ),
        }),
    ])

    if (!mailbox || !user) {
        return null
    }

    if (mailbox.isNative && mailbox.email.toLowerCase() !== user.email.toLowerCase()) {
        return null
    }

    return mailbox
}

function isCanonicalNativeMailbox(mailbox: { isNative: boolean; email: string }, userEmail: string) {
    return !mailbox.isNative || mailbox.email.toLowerCase() === userEmail.toLowerCase()
}

function toMailboxResponse(mailbox: {
    id: string
    email: string
    displayName: string | null
    isDefault: boolean
    isActive: boolean
    isNative: boolean
    lastSyncAt: Date | null
    syncError: string | null
}) {
    return {
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.displayName,
        isDefault: mailbox.isDefault,
        isActive: mailbox.isActive,
        isNative: mailbox.isNative,
        lastSyncAt: mailbox.lastSyncAt,
        syncError: mailbox.isNative ? null : mailbox.syncError,
    }
}

router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Safety net: ensure native mailbox exists (should already exist from user creation)
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        if (user && !user.isAdmin && user.passwordHash) {
            await createUserMailbox(userId, user.email)
        }

        // Clean up stale native mailboxes that belong to an admin's OWN email
        // (admins don't have a native mailbox for themselves, but they may manage
        // other users' native mailboxes connected via POST /connect).
        if (user?.isAdmin) {
            const staleNative = await db.query.mailboxes.findMany({
                where: and(
                    eq(mailboxes.userId, userId),
                    eq(mailboxes.isNative, true),
                    eq(mailboxes.email, user.email),
                ),
            })
            for (const mb of staleNative) {
                await deleteMailboxById(mb.id)
            }
        }

        const userMailboxes = await db.query.mailboxes.findMany({
            where: eq(mailboxes.userId, userId),
            orderBy: [desc(mailboxes.createdAt)],
        })
        const visibleMailboxes = userMailboxes.filter(mb => isCanonicalNativeMailbox(mb, user.email))

        // Clear stale syncError from native mailboxes (they don't use IMAP)
        const nativeWithError = visibleMailboxes.filter(mb => mb.isNative && mb.syncError)
        if (nativeWithError.length > 0) {
            await Promise.all(nativeWithError.map(mb =>
                db.update(mailboxes).set({ syncError: null }).where(eq(mailboxes.id, mb.id))
            ))
        }

        const safeMailboxes = visibleMailboxes.map(toMailboxResponse)

        res.json({ mailboxes: safeMailboxes })
    } catch (error) {
        console.error('Error fetching mailboxes:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)

        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        res.json({ mailbox: toMailboxResponse(mailbox) })
    } catch (error) {
        console.error('Error fetching mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/connect', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(1),
        })

        const { email, password } = schema.parse(req.body)

        const targetUser = await authenticateNativeUser(email, password)
        if (!targetUser) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        const requestingUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        })
        if (!requestingUser) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (targetUser.id !== userId) {
            return res.status(403).json({
                error: 'Local server mailboxes belong to their owner. Sign in as that user instead.',
            })
        }

        const existing = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.userId, userId),
                eq(mailboxes.email, requestingUser.email.toLowerCase()),
                eq(mailboxes.isNative, true)
            ),
        })
        if (existing) {
            return res.json({ mailbox: toMailboxResponse(existing) })
        }

        await createUserMailbox(userId, requestingUser.email)
        const created = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.userId, userId),
                eq(mailboxes.email, requestingUser.email.toLowerCase()),
                eq(mailboxes.isNative, true)
            ),
        })
        if (!created) {
            return res.status(500).json({ error: 'Failed to provision local mailbox' })
        }

        res.status(201).json({
            mailbox: toMailboxResponse(created),
        })
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors })
        console.error('Error connecting mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const schema = z.object({
            email: z.string().email(),
            displayName: z.string().optional(),
            smtpHost: z.string(),
            smtpPort: z.number().int().min(1).max(65535),
            smtpUsername: z.string(),
            smtpPassword: z.string(),
            smtpSecure: z.boolean().default(true),
            imapHost: z.string(),
            imapPort: z.number().int().min(1).max(65535),
            imapUsername: z.string(),
            imapPassword: z.string(),
            imapSecure: z.boolean().default(true),
            isDefault: z.boolean().default(false),
        })

        const data = schema.parse(req.body)

        if (data.isDefault) {
            await db.update(mailboxes)
                .set({ isDefault: false })
                .where(eq(mailboxes.userId, userId))
        }

        const newMailboxValues = {
            userId,
            email: data.email,
            displayName: data.displayName,
            smtpHost: data.smtpHost,
            smtpPort: data.smtpPort,
            smtpUsername: data.smtpUsername,
            smtpPasswordEncrypted: encryptSecret(data.smtpPassword),
            smtpSecure: data.smtpSecure,
            imapHost: data.imapHost,
            imapPort: data.imapPort,
            imapUsername: data.imapUsername,
            imapPasswordEncrypted: encryptSecret(data.imapPassword),
            imapSecure: data.imapSecure,
            isDefault: data.isDefault,
        }

        const insertedMailboxes = await db.insert(mailboxes).values(newMailboxValues).returning()
        const insertedMailbox = insertedMailboxes[0]
        const mailboxId = insertedMailbox.id
        const insertedEmail = insertedMailbox.email
        const insertedDisplayName = insertedMailbox.displayName
        const insertedIsDefault = insertedMailbox.isDefault
        const insertedIsActive = insertedMailbox.isActive

        await db.insert(mailFolders).values([
            { mailboxId: mailboxId, remoteId: 'INBOX', name: 'INBOX', type: 'inbox' },
            { mailboxId: mailboxId, remoteId: 'Sent', name: 'Sent', type: 'sent' },
            { mailboxId: mailboxId, remoteId: 'Drafts', name: 'Drafts', type: 'drafts' },
            { mailboxId: mailboxId, remoteId: 'Archive', name: 'Archive', type: 'archive' },
            { mailboxId: mailboxId, remoteId: 'Trash', name: 'Trash', type: 'trash' },
        ])

        res.status(201).json({
            mailbox: {
                id: mailboxId,
                email: insertedEmail,
                displayName: insertedDisplayName,
                isDefault: insertedIsDefault,
                isActive: insertedIsActive,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const schema = z.object({
            displayName: z.string().optional(),
            smtpPassword: z.string().optional(),
            imapPassword: z.string().optional(),
            isDefault: z.boolean().optional(),
            isActive: z.boolean().optional(),
        })

        const data = schema.parse(req.body)

        const existing = await checkUserMailboxAccess(userId, mailboxId)

        if (!existing) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        if (data.isDefault) {
            await db.update(mailboxes)
                .set({ isDefault: false })
                .where(eq(mailboxes.userId, userId))
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() }
        if (data.displayName !== undefined) updateData.displayName = data.displayName
        if (data.smtpPassword !== undefined) updateData.smtpPasswordEncrypted = encryptSecret(data.smtpPassword)
        if (data.imapPassword !== undefined) updateData.imapPasswordEncrypted = encryptSecret(data.imapPassword)
        if (data.isDefault !== undefined) updateData.isDefault = data.isDefault
        if (data.isActive !== undefined) updateData.isActive = data.isActive

        const [updated] = await db.update(mailboxes)
            .set(updateData)
            .where(eq(mailboxes.id, mailboxId))
            .returning()

        res.json({
            mailbox: {
                id: updated.id,
                email: updated.email,
                displayName: updated.displayName,
                isDefault: updated.isDefault,
                isActive: updated.isActive,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const existing = await checkUserMailboxAccess(userId, mailboxId)

        if (!existing) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        await deleteMailboxById(mailboxId)

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/test-connection', async (req: Request, res: Response) => {
    try {
        const schema = z.object({
            smtpHost: z.string(),
            smtpPort: z.number().int().min(1).max(65535),
            smtpSecure: z.boolean(),
            smtpUsername: z.string(),
            smtpPassword: z.string(),
            imapHost: z.string(),
            imapPort: z.number().int().min(1).max(65535),
            imapSecure: z.boolean(),
            imapUsername: z.string(),
            imapPassword: z.string(),
        })

        const data = schema.parse(req.body)

        const nodemailer = await import('nodemailer')
        
        let smtpSuccess = false
        let imapSuccess = false
        const errors: string[] = []

        try {
            const smtpTransporter = nodemailer.createTransport({
                host: data.smtpHost,
                port: data.smtpPort,
                secure: data.smtpSecure,
                auth: {
                    user: data.smtpUsername,
                    pass: data.smtpPassword,
                },
            })
            await smtpTransporter.verify()
            smtpSuccess = true
        } catch (err) {
            errors.push(`SMTP: ${err instanceof Error ? err.message : String(err)}`)
        }

        try {
            const Imap = (await import('imap')).default
            const imap = new Imap({
                user: data.imapUsername,
                password: data.imapPassword,
                host: data.imapHost,
                port: data.imapPort,
                tls: data.imapSecure,
                tlsOptions: { rejectUnauthorized: false },
            })

            await new Promise<void>((resolve, reject) => {
                imap.once('ready', () => {
                    imap.end()
                    resolve()
                })
                imap.once('error', (err) => {
                    reject(err)
                })
                imap.connect()
            })
            imapSuccess = true
        } catch (err) {
            errors.push(`IMAP: ${err instanceof Error ? err.message : String(err)}`)
        }

        res.json({
            data: {
                smtp: smtpSuccess,
                imap: imapSuccess,
                errors: errors.length > 0 ? errors : undefined,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error testing connection:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
