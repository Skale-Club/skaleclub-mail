import { createTransport } from 'nodemailer'
import { db } from '../../db'
import { deliveries, messages, organizations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { incrementStat, fireWebhooks } from '../lib/tracking'

let running = false

export async function processQueue(): Promise<void> {
    if (running) return
    running = true

    try {
        const pendingDeliveries = await db.query.deliveries.findMany({
            where: eq(deliveries.status, 'pending'),
            limit: 50,
        })

        for (const delivery of pendingDeliveries) {
            await processDelivery(delivery)
        }
    } catch (err) {
        console.error('[processQueue] Error:', err)
    } finally {
        running = false
    }
}

async function processDelivery(delivery: typeof deliveries.$inferSelect): Promise<void> {
    try {
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, delivery.messageId),
        })

        if (!message) {
            await db.update(deliveries)
                .set({ status: 'failed', details: 'Message not found' })
                .where(eq(deliveries.id, delivery.id))
            return
        }

        if (message.held) return // skip held messages

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, message.organizationId),
        })

        if (!organization) {
            await db.update(deliveries)
                .set({ status: 'failed', details: 'Server not available' })
                .where(eq(deliveries.id, delivery.id))
            return
        }

        // Build transporter from env vars (global SMTP config)
        const host = process.env.SMTP_HOST
        const port = parseInt(process.env.SMTP_PORT || '587')
        const user = process.env.SMTP_USER
        const pass = process.env.SMTP_PASS

        if (!host) {
            console.warn('[processQueue] SMTP_HOST not configured, skipping delivery')
            return
        }

        const transporter = createTransport({
            host,
            port,
            secure: port === 465,
            auth: user && pass ? { user, pass } : undefined,
        })

        const fromAddress = message.fromAddress || process.env.SMTP_FROM || ''
        const fromName = message.fromName || ''

        const attachments = (message.attachments as any[] || []).map((att) => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            contentType: att.contentType,
        }))

        const result = await transporter.sendMail({
            from: fromName ? `"${fromName}" <${fromAddress}>` : fromAddress,
            to: delivery.rcptTo,
            subject: message.subject || '',
            text: message.plainBody || undefined,
            html: message.htmlBody || undefined,
            headers: message.headers as Record<string, string> || {},
            attachments: attachments.length > 0 ? attachments : undefined,
            messageId: message.messageId || undefined,
        })

        const now = new Date()

        await db.update(deliveries)
            .set({
                status: 'sent',
                sentAt: now,
                sentWithSsl: port === 465,
                output: result.messageId || null,
            })
            .where(eq(deliveries.id, delivery.id))

        // Check if all deliveries for this message are now sent
        const remaining = await db.query.deliveries.findMany({
            where: and(
                eq(deliveries.messageId, message.id),
                eq(deliveries.status, 'pending')
            ),
        })

        if (remaining.length === 0) {
            await db.update(messages)
                .set({ status: 'sent', sentAt: now, updatedAt: now })
                .where(eq(messages.id, message.id))

            await Promise.allSettled([
                incrementStat(message.organizationId, 'messagesSent'),
                fireWebhooks(message.organizationId, 'message_sent', {
                    messageId: message.id,
                    subject: message.subject,
                    from: message.fromAddress,
                    to: message.toAddresses,
                }),
            ])
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[processQueue] Delivery ${delivery.id} failed:`, errorMsg)

        await db.update(deliveries)
            .set({
                status: 'bounced',
                bouncedAt: new Date(),
                details: errorMsg,
            })
            .where(eq(deliveries.id, delivery.id))
    }
}
