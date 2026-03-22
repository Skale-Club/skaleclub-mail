import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../../db'
import { mailboxes, mailFolders, mailMessages } from '../../../db/schema'
import { encrypt } from '../../../lib/crypto'

const router = Router()

export async function checkUserMailboxAccess(userId: string, mailboxId: string) {
    const mailbox = await db.query.mailboxes.findFirst({
        where: and(
            eq(mailboxes.id, mailboxId),
            eq(mailboxes.userId, userId)
        ),
    })
    return mailbox
}

router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const userMailboxes = await db.query.mailboxes.findMany({
            where: eq(mailboxes.userId, userId),
            orderBy: [desc(mailboxes.createdAt)],
        })

        const safeMailboxes = userMailboxes.map(mb => ({
            id: mb.id,
            email: mb.email,
            displayName: mb.displayName,
            isDefault: mb.isDefault,
            isActive: mb.isActive,
            lastSyncAt: mb.lastSyncAt,
            syncError: mb.syncError,
        }))

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

        const mailbox = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.id, mailboxId),
                eq(mailboxes.userId, userId)
            ),
        })

        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        res.json({
            mailbox: {
                id: mailbox.id,
                email: mailbox.email,
                displayName: mailbox.displayName,
                isDefault: mailbox.isDefault,
                isActive: mailbox.isActive,
                lastSyncAt: mailbox.lastSyncAt,
                syncError: mailbox.syncError,
            },
        })
    } catch (error) {
        console.error('Error fetching mailbox:', error)
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
            smtpPasswordEncrypted: encrypt(data.smtpPassword),
            smtpSecure: data.smtpSecure,
            imapHost: data.imapHost,
            imapPort: data.imapPort,
            imapUsername: data.imapUsername,
            imapPasswordEncrypted: encrypt(data.imapPassword),
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

        const existing = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.id, mailboxId),
                eq(mailboxes.userId, userId)
            ),
        })

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
        if (data.smtpPassword !== undefined) updateData.smtpPasswordEncrypted = encrypt(data.smtpPassword)
        if (data.imapPassword !== undefined) updateData.imapPasswordEncrypted = encrypt(data.imapPassword)
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

        const existing = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.id, mailboxId),
                eq(mailboxes.userId, userId)
            ),
        })

        if (!existing) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        await db.delete(mailMessages).where(eq(mailMessages.mailboxId, mailboxId))
        await db.delete(mailFolders).where(eq(mailFolders.mailboxId, mailboxId))
        await db.delete(mailboxes).where(eq(mailboxes.id, mailboxId))

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
