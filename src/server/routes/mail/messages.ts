import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../../db'
import { mailMessages, mailFolders, mailboxes } from '../../../db/schema'
import { checkUserMailboxAccess } from './mailboxes'
import { mailMessageToListItem } from '../../lib/mail'

const router = Router()

router.get('/:mailboxId/folders', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const folders = await db.query.mailFolders.findMany({
            where: eq(mailFolders.mailboxId, mailboxId),
            orderBy: [desc(mailFolders.createdAt)],
        })

        res.json({ folders })
    } catch (error) {
        console.error('Error fetching folders:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/:mailboxId/messages', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const folderId = req.query.folderId as string | undefined
        const page = parseInt(req.query.page as string) || 1
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
        const offset = (page - 1) * limit

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const conditions = [eq(mailMessages.mailboxId, mailboxId)]

        if (folderId) {
            conditions.push(eq(mailMessages.folderId, folderId))
        }

        const messages = await db.query.mailMessages.findMany({
            where: and(...conditions),
            orderBy: [desc(mailMessages.receivedAt)],
            limit,
            offset,
        })

        const [{ count }] = await db
            .select({ count: eq(mailMessages.id, mailMessages.id) })
            .from(mailMessages)
            .where(and(...conditions))

        const items = messages.map(mailMessageToListItem)

        res.json({
            messages: items,
            pagination: {
                page,
                limit,
                total: messages.length,
                totalPages: Math.ceil(messages.length / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/:mailboxId/messages/:messageId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const messageId = req.params.messageId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const message = await db.query.mailMessages.findFirst({
            where: and(
                eq(mailMessages.id, messageId),
                eq(mailMessages.mailboxId, mailboxId)
            ),
        })

        if (!message) {
            return res.status(404).json({ error: 'Message not found' })
        }

        if (!message.isRead) {
            await db.update(mailMessages)
                .set({ isRead: true, updatedAt: new Date() })
                .where(eq(mailMessages.id, messageId))
        }

        res.json({
            message: {
                id: message.id,
                messageId: message.messageId,
                inReplyTo: message.inReplyTo,
                references: message.references,
                subject: message.subject,
                from: { name: message.fromName, address: message.fromAddress },
                to: message.toAddresses,
                cc: message.ccAddresses,
                bcc: message.bccAddresses,
                plainBody: message.plainBody,
                htmlBody: message.htmlBody,
                headers: message.headers,
                attachments: message.attachments,
                hasAttachments: message.hasAttachments,
                isRead: true,
                isStarred: message.isStarred,
                receivedAt: message.receivedAt,
            },
        })
    } catch (error) {
        console.error('Error fetching message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.put('/:mailboxId/messages/:messageId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const messageId = req.params.messageId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const schema = z.object({
            isRead: z.boolean().optional(),
            isStarred: z.boolean().optional(),
        })

        const data = schema.parse(req.body)

        const existing = await db.query.mailMessages.findFirst({
            where: and(
                eq(mailMessages.id, messageId),
                eq(mailMessages.mailboxId, mailboxId)
            ),
        })

        if (!existing) {
            return res.status(404).json({ error: 'Message not found' })
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() }
        if (data.isRead !== undefined) updateData.isRead = data.isRead
        if (data.isStarred !== undefined) updateData.isStarred = data.isStarred

        const [updated] = await db.update(mailMessages)
            .set(updateData)
            .where(eq(mailMessages.id, messageId))
            .returning()

        res.json({
            message: mailMessageToListItem(updated),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete('/:mailboxId/messages/:messageId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const messageId = req.params.messageId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        await db.update(mailMessages)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(mailMessages.id, messageId))

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
