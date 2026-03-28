/**
 * SMTP Inbound Server (Port 25)
 *
 * Receives emails from external mail servers (Gmail, Outlook, etc.)
 * No authentication required — this is how MX delivery works.
 *
 * Flow:
 *   1. External server connects to port 25
 *   2. We validate the recipient domain is ours (verified in DB)
 *   3. We validate the recipient user exists locally
 *   4. We store the message in the recipient's inbox
 *   5. If no local user, check route-based delivery
 */

import { SMTPServer } from 'smtp-server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { mailboxes, mailFolders, mailMessages } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { parseRawEmail } from './lib/mail'
import { findLocalUser } from './lib/native-mail'
import { processInboundEmail, deliverViaRoutes } from './lib/route-matcher'
import { findOrganizationForDomain } from './lib/route-matcher'

async function getMailbox(email: string, userId: string) {
    return db.query.mailboxes.findFirst({
        where: and(
            eq(mailboxes.email, email.toLowerCase()),
            eq(mailboxes.userId, userId)
        ),
    })
}

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
        console.error(`[SMTP-IN] Folder type '${folderType}' not found for mailboxId: ${mailboxId}`)
        return false
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
        receivedAt: new Date(),
    }).onConflictDoNothing()

    return true
}

export function createInboundSMTPServer() {
    const port = parseInt(process.env.SMTP_INBOUND_PORT || '25')

    const server = new SMTPServer({
        name: process.env.MAIL_DOMAIN || 'skale.club',
        secure: false,
        // Hide STARTTLS — we don't have a TLS cert for port 25 yet.
        // Gmail/Outlook will fall back to plaintext delivery which is fine.
        hideSTARTTLS: true,
        // No auth required — external servers don't authenticate
        authOptional: true,
        disabledCommands: ['AUTH'],
        // Size limit: 25MB
        size: 25 * 1024 * 1024,

        // Validate recipient — only accept emails for our domains
        onRcptTo(address, _session, callback) {
            const rcptEmail = address.address.toLowerCase()
            const domain = rcptEmail.split('@')[1]

            if (!domain) {
                console.log(`[SMTP-IN] REJECT rcptTo: ${rcptEmail} (no domain)`)
                return callback(new Error('Invalid recipient'))
            }

            // Check if domain belongs to us
            findOrganizationForDomain(domain)
                .then(orgId => {
                    if (!orgId) {
                        console.log(`[SMTP-IN] REJECT rcptTo: ${rcptEmail} (domain "${domain}" not registered)`)
                        return callback(new Error(`Relay access denied for domain ${domain}`))
                    }
                    console.log(`[SMTP-IN] ACCEPT rcptTo: ${rcptEmail} (orgId=${orgId})`)
                    callback()
                })
                .catch(err => {
                    console.error(`[SMTP-IN] rcptTo error:`, err)
                    callback(new Error('Internal error'))
                })
        },

        onData(stream, session, callback) {
            const chunks: Buffer[] = []

            stream.on('data', (chunk: Buffer) => chunks.push(chunk))

            stream.on('end', async () => {
                const raw = Buffer.concat(chunks)
                const rcptAddresses = session.envelope.rcptTo.map(r => r.address.toLowerCase())
                const mailFrom = session.envelope.mailFrom
                    ? (typeof session.envelope.mailFrom === 'object' ? session.envelope.mailFrom.address : session.envelope.mailFrom)
                    : '<>'

                console.log(`[SMTP-IN] Incoming email from=${mailFrom} to=[${rcptAddresses.join(', ')}] size=${raw.length}`)

                try {
                    const parsed = await parseRawEmail(raw)
                    console.log(`[SMTP-IN] Parsed: subject="${parsed.subject}" from=${parsed.from.address}`)

                    let deliveredCount = 0
                    let routedCount = 0
                    let failedCount = 0

                    for (const rcptEmail of rcptAddresses) {
                        // 1. Try local user delivery
                        const localUser = await findLocalUser(rcptEmail)
                        if (localUser) {
                            const mailbox = await getMailbox(rcptEmail, localUser.userId)
                            if (mailbox) {
                                const stored = await storeMessage(mailbox.id, 'inbox', parsed, false)
                                if (stored) {
                                    deliveredCount++
                                    console.log(`[SMTP-IN] LOCAL DELIVERY: ${rcptEmail} → inbox (mailboxId=${mailbox.id})`)
                                    continue
                                }
                            } else {
                                console.warn(`[SMTP-IN] User ${rcptEmail} exists but has NO mailbox`)
                            }
                        }

                        // 2. Try route-based delivery
                        const routing = await processInboundEmail(rcptEmail)
                        if (routing.action === 'reject') {
                            console.log(`[SMTP-IN] REJECTED by route: ${rcptEmail}`)
                            failedCount++
                            continue
                        }
                        if (routing.action === 'deliver' && routing.routes.length > 0) {
                            await deliverViaRoutes(rcptEmail, raw, routing.routes, routing.organizationId!)
                            routedCount++
                            console.log(`[SMTP-IN] ROUTED: ${rcptEmail} → ${routing.routes.length} route(s)`)
                            continue
                        }
                        if (routing.action === 'hold') {
                            await deliverViaRoutes(rcptEmail, raw, routing.routes, routing.organizationId!)
                            console.log(`[SMTP-IN] HELD: ${rcptEmail}`)
                            continue
                        }

                        // 3. No local user, no routes — reject
                        console.warn(`[SMTP-IN] NO DELIVERY TARGET for ${rcptEmail} — no local user and no routes`)
                        failedCount++
                    }

                    console.log(`[SMTP-IN] Complete: delivered=${deliveredCount} routed=${routedCount} failed=${failedCount}`)
                    callback()

                } catch (error) {
                    console.error('[SMTP-IN] Processing error:', error)
                    callback(new Error('Failed to process message'))
                }
            })

            stream.on('error', (err: Error) => {
                console.error('[SMTP-IN] Stream error:', err)
                callback(err)
            })
        },

        onConnect(session, callback) {
            console.log(`[SMTP-IN] Connection from ${session.remoteAddress}`)
            callback()
        },
    })

    server.on('error', (err: Error) => {
        console.error('[SMTP-IN] Server error:', err.message)
    })

    return {
        start() {
            server.listen(port, '0.0.0.0', () => {
                console.log(`[SMTP-IN] Inbound server listening on port ${port}`)
                console.log(`[SMTP-IN] Ready to receive emails for verified domains`)
            })
        },
        close() {
            server.close()
        },
    }
}
