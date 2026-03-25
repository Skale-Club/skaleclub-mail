/**
 * Native SMTP Submission Server
 *
 * Listens on SMTP_SUBMISSION_PORT (default 2587 for dev, 587 for prod).
 * Authenticated users can submit email for delivery.
 *
 * Auth: PLAIN/LOGIN against users.passwordHash (bcrypt) — same password as web login.
 */

import { SMTPServer } from 'smtp-server'
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { mailboxes, mailFolders, mailMessages, messages } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { parseRawEmail } from './lib/mail'
import { authenticateNativeUser, findLocalUser } from './lib/native-mail'
import { processInboundEmail, type MatchedRoute } from './lib/route-matcher'
import { incrementStat, fireWebhooks } from './lib/tracking'

// Find the companion mailboxes entry (for folder/message storage)
async function getCompanionMailbox(email: string, userId: string) {
    return db.query.mailboxes.findFirst({
        where: and(
            eq(mailboxes.email, email.toLowerCase()),
            eq(mailboxes.userId, userId)
        ),
    })
}

// Store a message in the given folder type for the mailbox
async function storeMessage(
    mailboxId: string,
    folderType: string,
    parsed: Awaited<ReturnType<typeof parseRawEmail>>,
    isRead = false
) {
    const folder = await db.query.mailFolders.findFirst({
        where: and(
            eq(mailFolders.mailboxId, mailboxId),
            eq(mailFolders.type, folderType)
        ),
    })

    if (!folder) {
        console.error(`[SMTP] Folder type '${folderType}' not found for mailboxId: ${mailboxId}`)
        return
    }

    const messageId = parsed.messageId || `<${uuidv4()}@skaleclub.mail>`

    await db.insert(mailMessages).values({
        mailboxId,
        folderId: folder.id,
        messageId,
        inReplyTo: parsed.inReplyTo,
        references: parsed.references,
        subject: parsed.subject,
        fromAddress: parsed.from.address,
        fromName: parsed.from.name,
        toAddresses: parsed.to as object[],
        ccAddresses: parsed.cc as object[],
        bccAddresses: parsed.bcc as object[],
        plainBody: parsed.plainBody,
        htmlBody: parsed.htmlBody,
        headers: parsed.headers as object,
        hasAttachments: parsed.hasAttachments,
        attachments: parsed.attachments.map(a => ({
            filename: a.filename,
            contentType: a.contentType,
            size: a.size,
        })) as object[],
        isRead,
        isDraft: false,
        remoteDate: parsed.date,
        receivedAt: parsed.date || new Date(),
    }).onConflictDoNothing()
}

// Relay outbound email through configured SMTP relay or direct
async function relayMessage(
    fromAddress: string,
    toAddresses: string[],
    rawEmail: Buffer
): Promise<void> {
    // Use system SMTP relay if configured, otherwise try direct delivery
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        await transporter.sendMail({
            envelope: { from: fromAddress, to: toAddresses },
            raw: rawEmail,
        })
    } else {
        // Direct delivery (requires proper MX setup)
        const transporter = nodemailer.createTransport({
            direct: true,
            name: process.env.MAIL_DOMAIN || 'localhost',
        } as nodemailer.TransportOptions)

        await transporter.sendMail({
            envelope: { from: fromAddress, to: toAddresses },
            raw: rawEmail,
        })
    }
}

// Check if an address is a local (native) user on this server
async function isLocalAddress(email: string): Promise<string | null> {
    const result = await findLocalUser(email)
    return result ? result.userId : null
}

// Deliver email via matched routes
async function deliverViaRoutes(
    recipient: string,
    rawEmail: Buffer,
    matchedRoutes: MatchedRoute[],
    organizationId: string
): Promise<void> {
    for (const { route, endpoint } of matchedRoutes) {
        if (endpoint.type === 'hold') {
            const token = uuidv4()
            await db.insert(messages).values({
                organizationId,
                token,
                direction: 'incoming',
                fromAddress: '',
                toAddresses: [recipient],
                subject: '(held)',
                status: 'held',
                held: true,
                holdExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                heldReason: `Route: ${route.name}`,
            }).onConflictDoNothing()

            await incrementStat(organizationId, 'messagesHeld')
            continue
        }

        if (endpoint.type === 'smtp' && endpoint.config) {
            const cfg = endpoint.config as { hostname: string; port: number; sslMode: string; username?: string; password?: string }
            const transporter = nodemailer.createTransport({
                host: cfg.hostname,
                port: cfg.port,
                secure: cfg.sslMode === 'ssl' || cfg.port === 465,
                auth: cfg.username && cfg.password ? { user: cfg.username, pass: cfg.password } : undefined,
            })

            await transporter.sendMail({
                envelope: { from: '', to: [recipient] },
                raw: rawEmail,
            })
        }

        if (endpoint.type === 'address' && endpoint.config) {
            const cfg = endpoint.config as { emailAddress: string }
            const host = process.env.SMTP_HOST
            if (host) {
                const transporter = nodemailer.createTransport({
                    host,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: false,
                    auth: process.env.SMTP_USER && process.env.SMTP_PASS
                        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                        : undefined,
                })

                await transporter.sendMail({
                    envelope: { from: '', to: [cfg.emailAddress] },
                    raw: rawEmail,
                })
            }
        }

        if (endpoint.type === 'http' && endpoint.config) {
            const cfg = endpoint.config as { url: string; method?: string; headers?: Record<string, string>; includeOriginal?: boolean }
            const body = cfg.includeOriginal
                ? { recipient, raw: rawEmail.toString('base64') }
                : { recipient }

            await fetch(cfg.url, {
                method: cfg.method || 'POST',
                headers: { 'Content-Type': 'application/json', ...(cfg.headers || {}) },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            })
        }
    }
}

export function createSMTPServer() {
    const port = parseInt(process.env.SMTP_SUBMISSION_PORT || '2587')

    const server = new SMTPServer({
        name: process.env.MAIL_DOMAIN || 'skaleclub.mail',
        // Allow unencrypted auth in dev; in prod, set up TLS certs
        secure: false,
        allowInsecureAuth: true,
        // authOptional defaults to false = require auth (no open relay)
        authOptional: false,

        onAuth(auth, _session, callback) {
            const username = auth.username?.toLowerCase()
            const password = auth.password

            if (!username || !password) {
                return callback(new Error('Username and password required'))
            }

            authenticateNativeUser(username, password)
                .then(account => {
                    if (!account) {
                        return callback(new Error('Invalid credentials'))
                    }
                    console.log(`[SMTP] Auth success: ${username}`)
                    // Return user object; this becomes session.user
                    callback(null, { user: JSON.stringify({ email: account.email, userId: account.id }) })
                })
                .catch(err => {
                    console.error('[SMTP] Auth error:', err)
                    callback(new Error('Authentication failed'))
                })
        },

        onData(stream, session, callback) {
            const chunks: Buffer[] = []

            stream.on('data', (chunk: Buffer) => chunks.push(chunk))

            stream.on('end', async () => {
                const raw = Buffer.concat(chunks)
                const userStr = session.user as string | undefined

                if (!userStr) {
                    return callback(new Error('Unauthenticated'))
                }

                const user = JSON.parse(userStr) as { email: string; userId: string }
                try {
                    const parsed = await parseRawEmail(raw)
                    const senderEmail = user.email

                    // Get sender's companion mailbox for Sent storage
                    const senderMailbox = await getCompanionMailbox(senderEmail, user.userId)
                    if (senderMailbox) {
                        await storeMessage(senderMailbox.id, 'sent', parsed, true)
                        console.log(`[SMTP] Saved to Sent: ${senderEmail} → ${parsed.to.map(t => t.address).join(', ')}`)
                    }

                    // Determine recipient list from envelope
                    const rcptAddresses = session.envelope.rcptTo.map(r => r.address)

                    // Separate local vs external recipients
                    const localRecipients: Array<{ email: string; userId: string }> = []
                    const externalRecipients: string[] = []

                    for (const addr of rcptAddresses) {
                        const recipientUserId = await isLocalAddress(addr)
                        if (recipientUserId) {
                            localRecipients.push({ email: addr, userId: recipientUserId })
                        } else {
                            externalRecipients.push(addr)
                        }
                    }

                    // Deliver to local recipients (store directly in DB)
                    for (const { email: recipientEmail, userId: recipientUserId } of localRecipients) {
                        const recipientMailbox = await getCompanionMailbox(recipientEmail, recipientUserId)
                        if (recipientMailbox) {
                            await storeMessage(recipientMailbox.id, 'inbox', parsed, false)
                            console.log(`[SMTP] Local delivery: ${senderEmail} → ${recipientEmail}`)
                        }
                    }

                    // Relay external recipients
                    if (externalRecipients.length > 0) {
                        try {
                            // Check for route-based delivery for each external recipient
                            const routedRecipients: string[] = []
                            const directRelayRecipients: string[] = []

                            for (const addr of externalRecipients) {
                                const routing = await processInboundEmail(addr)
                                if (routing.action === 'reject') {
                                    console.log(`[SMTP] Rejected by route: ${addr}`)
                                    continue
                                }
                                if (routing.action !== 'none' && routing.routes.length > 0) {
                                    routedRecipients.push(addr)
                                    await deliverViaRoutes(addr, raw, routing.routes, routing.organizationId!)
                                } else {
                                    directRelayRecipients.push(addr)
                                }
                            }

                            if (directRelayRecipients.length > 0) {
                                await relayMessage(senderEmail, directRelayRecipients, raw)
                                console.log(`[SMTP] Relayed: ${senderEmail} → ${directRelayRecipients.join(', ')}`)
                            }

                            if (routedRecipients.length > 0) {
                                console.log(`[SMTP] Route-delivered: ${senderEmail} → ${routedRecipients.join(', ')}`)
                            }
                        } catch (relayErr) {
                            console.error('[SMTP] Relay error:', relayErr)
                            // Don't fail the whole transaction if relay fails
                        }
                    }

                    callback()
                } catch (error) {
                    console.error('[SMTP] Processing error:', error)
                    callback(new Error('Failed to process message'))
                }
            })

            stream.on('error', (err: Error) => {
                console.error('[SMTP] Stream error:', err)
                callback(err)
            })
        },
    })

    server.on('error', (err: Error) => {
        console.error('[SMTP] Server error:', err.message)
    })

    return {
        start() {
            server.listen(port, '0.0.0.0', () => {
                console.log(`[SMTP] Submission server listening on port ${port}`)
                console.log(`[SMTP] Configure Thunderbird: SMTP → mail.skale.club:${port} (STARTTLS)`)
            })
        },
        close() {
            server.close()
        },
    }
}
