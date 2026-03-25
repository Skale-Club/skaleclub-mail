import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../../db'
import { signatures } from '../../../db/schema'
import { checkUserMailboxAccess } from './mailboxes'

const router = Router()

router.get('/:mailboxId/signatures', async (req: Request, res: Response) => {
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

        const signatureList = await db.query.signatures.findMany({
            where: eq(signatures.mailboxId, mailboxId),
        })

        res.json({ signatures: signatureList })
    } catch (error) {
        console.error('Error fetching signatures:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/:mailboxId/signatures', async (req: Request, res: Response) => {
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
            name: z.string().min(1).max(100),
            content: z.string().min(1),
            isDefault: z.boolean().default(false),
        })

        const data = schema.parse(req.body)

        if (data.isDefault) {
            await db.update(signatures)
                .set({ isDefault: false })
                .where(eq(signatures.mailboxId, mailboxId))
        }

        const [created] = await db.insert(signatures).values({
            mailboxId,
            name: data.name,
            content: data.content,
            isDefault: data.isDefault,
        }).returning()

        res.status(201).json({ signature: created })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating signature:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.put('/:mailboxId/signatures/:signatureId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const signatureId = req.params.signatureId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        const schema = z.object({
            name: z.string().min(1).max(100).optional(),
            content: z.string().min(1).optional(),
            isDefault: z.boolean().optional(),
        })

        const data = schema.parse(req.body)

        const existing = await db.query.signatures.findFirst({
            where: and(
                eq(signatures.id, signatureId),
                eq(signatures.mailboxId, mailboxId)
            ),
        })

        if (!existing) {
            return res.status(404).json({ error: 'Signature not found' })
        }

        if (data.isDefault) {
            await db.update(signatures)
                .set({ isDefault: false })
                .where(eq(signatures.mailboxId, mailboxId))
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() }
        if (data.name !== undefined) updateData.name = data.name
        if (data.content !== undefined) updateData.content = data.content
        if (data.isDefault !== undefined) updateData.isDefault = data.isDefault

        const [updated] = await db.update(signatures)
            .set(updateData)
            .where(eq(signatures.id, signatureId))
            .returning()

        res.json({ signature: updated })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating signature:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete('/:mailboxId/signatures/:signatureId', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.mailboxId
        const signatureId = req.params.signatureId

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await checkUserMailboxAccess(userId, mailboxId)
        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found' })
        }

        await db.delete(signatures).where(
            and(
                eq(signatures.id, signatureId),
                eq(signatures.mailboxId, mailboxId)
            )
        )

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting signature:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/:mailboxId/signatures/default', async (req: Request, res: Response) => {
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

        const defaultSignature = await db.query.signatures.findFirst({
            where: and(
                eq(signatures.mailboxId, mailboxId),
                eq(signatures.isDefault, true)
            ),
        })

        res.json({ signature: defaultSignature || null })
    } catch (error) {
        console.error('Error fetching default signature:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
