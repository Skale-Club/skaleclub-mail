import { Router, Request, Response } from 'express'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import Imap from 'imap'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../../db'
import { mailFolders, mailMessages } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { decrypt } from '../../../lib/crypto'
import { checkUserMailboxAccess } from './mailboxes'

const router = Router()

async function appendToSentFolder(
    mailbox: any,
    rawEmail: string
): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
        const imapConfig = {
            user: mailbox.imapUsername,
            password: decrypt(mailbox.imapPasswordEncrypted),
            host: mailbox.imapHost,
            port: mailbox.imapPort,
            tls: mailbox.imapSecure,
            tlsOptions: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
        }

        const imap = new Imap(imapConfig)

        imap.once('ready', () => {
            imap.append(rawEmail, { mailbox: 'Sent' }, (err: any) => {
                imap.end()
                if (err) {
                    resolve({ success: false, error: err.message })
                } else {
                    resolve({ success: true })
                }
            })
        })

        imap.once('error', (err: any) => {
            resolve({ success: false, error: err.message })
        })

        imap.connect()
    })
}

router.post('/:mailboxId/send', async (req: Request, res: Response) => {
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
            to: z.array(z.object({
                address: z.string().email(),
                name: z.string().optional(),
            })).min(1),
            cc: z.array(z.object({
                address: z.string().email(),
                name: z.string().optional(),
            })).optional(),
            bcc: z.array(z.object({
                address: z.string().email(),
                name: z.string().optional(),
            })).optional(),
            subject: z.string().min(1).max(998),
            plainBody: z.string().optional(),
            htmlBody: z.string().optional(),
            inReplyTo: z.string().optional(),
            references: z.string().optional(),
            attachments: z.array(z.object({
                filename: z.string(),
                content: z.string(),
                contentType: z.string().optional(),
            })).optional(),
            saveToSent: z.boolean().default(true),
        })

        const data = schema.parse(req.body)

        if (!data.plainBody && !data.htmlBody) {
            return res.status(400).json({ error: 'Message body is required' })
        }

        const smtpConfig = {
            host: mailbox.smtpHost,
            port: mailbox.smtpPort,
            secure: mailbox.smtpSecure,
            auth: {
                user: mailbox.smtpUsername,
                pass: decrypt(mailbox.smtpPasswordEncrypted),
            },
        }

        const transporter = nodemailer.createTransport(smtpConfig)

        const messageId = `<${uuidv4()}@${mailbox.email.split('@')[1] || 'mail.local'}>`

        const mailOptions: nodemailer.SendMailOptions = {
            from: mailbox.displayName 
                ? `${mailbox.displayName} <${mailbox.email}>`
                : mailbox.email,
            to: data.to.map(t => t.address),
            cc: data.cc?.map(c => c.address),
            bcc: data.bcc?.map(b => b.address),
            subject: data.subject,
            text: data.plainBody,
            html: data.htmlBody,
            messageId,
            inReplyTo: data.inReplyTo,
            references: data.references,
            attachments: data.attachments?.map(att => ({
                filename: att.filename,
                content: Buffer.from(att.content, 'base64'),
                contentType: att.contentType,
            })),
        }

        await transporter.sendMail(mailOptions)

        if (data.saveToSent) {
            const sentFolder = await db.query.mailFolders.findFirst({
                where: and(
                    eq(mailFolders.mailboxId, mailboxId),
                    eq(mailFolders.remoteId, 'Sent')
                ),
            })

            const rawEmail = [
                `From: ${mailbox.displayName ? `${mailbox.displayName} <${mailbox.email}>` : mailbox.email}`,
                `To: ${data.to.map(t => t.name ? `${t.name} <${t.address}>` : t.address).join(', ')}`,
                data.cc ? `Cc: ${data.cc.map(c => c.name ? `${c.name} <${c.address}>` : c.address).join(', ')}` : '',
                `Subject: ${data.subject}`,
                `Date: ${new Date().toUTCString()}`,
                `Message-ID: ${messageId}`,
                data.inReplyTo ? `In-Reply-To: ${data.inReplyTo}` : '',
                data.references ? `References: ${data.references}` : '',
                `MIME-Version: 1.0`,
                `Content-Type: text/plain; charset=UTF-8`,
                '',
                data.plainBody || '',
            ].filter(Boolean).join('\r\n')

            if (sentFolder) {
                await db.insert(mailMessages).values({
                    mailboxId,
                    folderId: sentFolder.id,
                    messageId,
                    inReplyTo: data.inReplyTo,
                    references: data.references,
                    subject: data.subject,
                    fromAddress: mailbox.email,
                    fromName: mailbox.displayName,
                    toAddresses: data.to.map(t => ({ name: t.name || null, address: t.address })),
                    ccAddresses: data.cc?.map(c => ({ name: c.name || null, address: c.address })) || [],
                    plainBody: data.plainBody,
                    htmlBody: data.htmlBody,
                    headers: {},
                    hasAttachments: (data.attachments?.length || 0) > 0,
                    attachments: data.attachments?.map(att => ({
                        filename: att.filename,
                        contentType: att.contentType || 'application/octet-stream',
                        size: Math.ceil(att.content.length * 0.75),
                    })) || [],
                    isRead: true,
                    isDraft: false,
                    remoteDate: new Date(),
                    receivedAt: new Date(),
                })
            }

            const appendResult = await appendToSentFolder(mailbox, rawEmail)
            if (!appendResult.success) {
                console.warn('Failed to append to IMAP Sent folder:', appendResult.error)
            }
        }

        res.json({
            success: true,
            messageId,
            message: 'Email sent successfully',
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error sending email:', error)
        res.status(500).json({ error: 'Failed to send email' })
    }
})

router.post('/:mailboxId/save-draft', async (req: Request, res: Response) => {
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
            to: z.array(z.object({
                address: z.string().email(),
                name: z.string().optional(),
            })).optional(),
            cc: z.array(z.object({
                address: z.string().email(),
                name: z.string().optional(),
            })).optional(),
            bcc: z.array(z.object({
                address: z.string().email(),
                name: z.string().optional(),
            })).optional(),
            subject: z.string().optional(),
            plainBody: z.string().optional(),
            htmlBody: z.string().optional(),
            attachments: z.array(z.object({
                filename: z.string(),
                content: z.string(),
                contentType: z.string().optional(),
            })).optional(),
        })

        const data = schema.parse(req.body)

        const draftsFolder = await db.query.mailFolders.findFirst({
            where: and(
                eq(mailFolders.mailboxId, mailboxId),
                eq(mailFolders.remoteId, 'Drafts')
            ),
        })

        if (!draftsFolder) {
            return res.status(400).json({ error: 'Drafts folder not found' })
        }

        const messageId = `<${uuidv4()}@${mailbox.email.split('@')[1] || 'mail.local'}>`

        const [savedMessage] = await db.insert(mailMessages).values({
            mailboxId,
            folderId: draftsFolder.id,
            messageId,
            subject: data.subject || null,
            fromAddress: mailbox.email,
            fromName: mailbox.displayName,
            toAddresses: data.to?.map(t => ({ name: t.name || null, address: t.address })) || [],
            ccAddresses: data.cc?.map(c => ({ name: c.name || null, address: c.address })) || [],
            bccAddresses: data.bcc?.map(b => ({ name: b.name || null, address: b.address })) || [],
            plainBody: data.plainBody,
            htmlBody: data.htmlBody,
            headers: {},
            hasAttachments: (data.attachments?.length || 0) > 0,
            attachments: data.attachments?.map(att => ({
                filename: att.filename,
                contentType: att.contentType || 'application/octet-stream',
                size: Math.ceil(att.content.length * 0.75),
            })) || [],
            isDraft: true,
            remoteDate: new Date(),
            receivedAt: new Date(),
        }).returning()

        res.json({
            success: true,
            messageId,
            draftId: savedMessage.id,
            message: 'Draft saved',
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error saving draft:', error)
        res.status(500).json({ error: 'Failed to save draft' })
    }
})

export default router
