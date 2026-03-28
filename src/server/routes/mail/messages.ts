import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { eq, and, desc, inArray, sql, ilike, or } from 'drizzle-orm'
import { db } from '../../../db'
import { mailMessages, mailFolders, mailboxes } from '../../../db/schema'
import { checkUserMailboxAccess } from './mailboxes'
import { mailMessageToListItem } from '../../lib/mail'
import { runFiltersOnMessage } from './filters'

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

        const conditions = [
            eq(mailMessages.mailboxId, mailboxId),
            eq(mailMessages.isDeleted, false),
        ]

        if (folderId) {
            conditions.push(eq(mailMessages.folderId, folderId))
        }

        const [messages, countResult] = await Promise.all([
            db.query.mailMessages.findMany({
                where: and(...conditions),
                orderBy: [desc(mailMessages.receivedAt)],
                limit,
                offset,
            }),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(mailMessages)
                .where(and(...conditions)),
        ])

        const total = countResult[0]?.count ?? 0
        const items = messages.map(mailMessageToListItem)

        res.json({
            messages: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
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
                from: { name: message.fromName, email: message.fromAddress },
                to: ((message.toAddresses as any[]) || []).map((a: any) => ({ name: a.name || null, email: a.address || a.email || null })),
                cc: ((message.ccAddresses as any[]) || []).map((a: any) => ({ name: a.name || null, email: a.address || a.email || null })),
                bcc: ((message.bccAddresses as any[]) || []).map((a: any) => ({ name: a.name || null, email: a.address || a.email || null })),
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
            .where(and(eq(mailMessages.id, messageId), eq(mailMessages.mailboxId, mailboxId)))

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/:mailboxId/messages/:messageId/archive', async (req: Request, res: Response) => {
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

        const archiveFolder = await db.query.mailFolders.findFirst({
            where: and(
                eq(mailFolders.mailboxId, mailboxId),
                eq(mailFolders.remoteId, 'Archive')
            ),
        })

        if (archiveFolder) {
            await db.update(mailMessages)
                .set({ folderId: archiveFolder.id, updatedAt: new Date() })
                .where(and(eq(mailMessages.id, messageId), eq(mailMessages.mailboxId, mailboxId)))
        }

        res.json({ success: true })
    } catch (error) {
        console.error('Error archiving message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/:mailboxId/messages/:messageId/spam', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const messageId = req.params.messageId
        const isSpam = req.body.isSpam ?? true

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const spamFolder = await db.query.mailFolders.findFirst({
            where: and(
                eq(mailFolders.mailboxId, mailboxId),
                eq(mailFolders.type, 'spam')
            ),
        })

        if (spamFolder && isSpam) {
            await db.update(mailMessages)
                .set({ folderId: spamFolder.id, updatedAt: new Date() })
                .where(and(eq(mailMessages.id, messageId), eq(mailMessages.mailboxId, mailboxId)))
        } else {
            const inboxFolder = await db.query.mailFolders.findFirst({
                where: and(
                    eq(mailFolders.mailboxId, mailboxId),
                    eq(mailFolders.remoteId, 'INBOX')
                ),
            })
            if (inboxFolder) {
                await db.update(mailMessages)
                    .set({ folderId: inboxFolder.id, updatedAt: new Date() })
                    .where(and(eq(mailMessages.id, messageId), eq(mailMessages.mailboxId, mailboxId)))
            }
        }

        res.json({ success: true })
    } catch (error) {
        console.error('Error marking message as spam:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/:mailboxId/messages/:messageId/move', async (req: Request, res: Response) => {
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
            folderId: z.string().uuid(),
        })

        const data = schema.parse(req.body)

        await db.update(mailMessages)
            .set({ folderId: data.folderId, updatedAt: new Date() })
            .where(and(eq(mailMessages.id, messageId), eq(mailMessages.mailboxId, mailboxId)))

        res.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error moving message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/:mailboxId/messages/batch', async (req: Request, res: Response) => {
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

        const schema = z.object({
            messageIds: z.array(z.string().uuid()).min(1),
            action: z.enum(['archive', 'spam', 'unspam', 'delete', 'read', 'unread', 'star', 'unstar']),
            folderId: z.string().uuid().optional(),
        })

        const data = schema.parse(req.body)

        const updateData: Record<string, unknown> = { updatedAt: new Date() }

        switch (data.action) {
            case 'archive':
                const archiveFolder = await db.query.mailFolders.findFirst({
                    where: and(
                        eq(mailFolders.mailboxId, mailboxId),
                        eq(mailFolders.remoteId, 'Archive')
                    ),
                })
                if (archiveFolder) {
                    updateData.folderId = archiveFolder.id
                }
                break
            case 'spam':
                const spamFolder = await db.query.mailFolders.findFirst({
                    where: and(
                        eq(mailFolders.mailboxId, mailboxId),
                        eq(mailFolders.type, 'spam')
                    ),
                })
                if (spamFolder) {
                    updateData.folderId = spamFolder.id
                }
                break
            case 'unspam':
                const inboxFolder = await db.query.mailFolders.findFirst({
                    where: and(
                        eq(mailFolders.mailboxId, mailboxId),
                        eq(mailFolders.remoteId, 'INBOX')
                    ),
                })
                if (inboxFolder) {
                    updateData.folderId = inboxFolder.id
                }
                break
            case 'delete':
                updateData.isDeleted = true
                break
            case 'read':
                updateData.isRead = true
                break
            case 'unread':
                updateData.isRead = false
                break
            case 'star':
                updateData.isStarred = true
                break
            case 'unstar':
                updateData.isStarred = false
                break
        }

        if (data.folderId && ['archive', 'spam', 'unspam'].includes(data.action)) {
            updateData.folderId = data.folderId
        }

        await db.update(mailMessages)
            .set(updateData)
            .where(and(inArray(mailMessages.id, data.messageIds), eq(mailMessages.mailboxId, mailboxId)))

        for (const messageId of data.messageIds) {
            await runFiltersOnMessage(messageId)
        }

        res.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error batch updating messages:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/:mailboxId/search', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const q = req.query.q as string | undefined
        const folderId = req.query.folderId as string | undefined
        const page = parseInt(req.query.page as string) || 1
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
        const offset = (page - 1) * limit

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!q || q.trim().length < 2) {
            return res.json({ messages: [], pagination: { page, limit, total: 0, totalPages: 0 } })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const conditions = [
            eq(mailMessages.mailboxId, mailboxId),
            eq(mailMessages.isDeleted, false),
            or(
                ilike(mailMessages.subject, `%${q}%`),
                ilike(mailMessages.fromName, `%${q}%`),
                ilike(mailMessages.fromAddress, `%${q}%`),
                ilike(mailMessages.plainBody, `%${q}%`),
            ),
        ]

        if (folderId) {
            conditions.push(eq(mailMessages.folderId, folderId))
        }

        const [messages, countResult] = await Promise.all([
            db.query.mailMessages.findMany({
                where: and(...conditions),
                orderBy: [desc(mailMessages.receivedAt)],
                limit,
                offset,
            }),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(mailMessages)
                .where(and(...conditions)),
        ])

        const total = countResult[0]?.count ?? 0
        const items = messages.map(mailMessageToListItem)

        res.json({
            messages: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error searching messages:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
