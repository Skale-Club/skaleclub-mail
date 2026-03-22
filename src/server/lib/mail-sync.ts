/* eslint-disable @typescript-eslint/no-explicit-any */
import Imap from 'imap'
import { simpleParser } from 'mailparser'
import { db } from '../../db'
import { mailboxes, mailFolders, mailMessages } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { decrypt } from '../../lib/crypto'

interface SyncResult {
    mailboxId: string
    folderId: string
    newMessages: number
    errors: string[]
}

interface FolderInfo {
    remoteId: string
    name: string
    type: string
}

export async function syncMailbox(mailboxId: string): Promise<SyncResult> {
    const result: SyncResult = {
        mailboxId,
        folderId: '',
        newMessages: 0,
        errors: [],
    }

    try {
        const mailbox = await db.query.mailboxes.findFirst({
            where: eq(mailboxes.id, mailboxId),
        })

        if (!mailbox) {
            throw new Error('Mailbox not found')
        }

        const imapConfig = {
            user: mailbox.imapUsername,
            password: decrypt(mailbox.imapPasswordEncrypted),
            host: mailbox.imapHost,
            port: mailbox.imapPort,
            tls: mailbox.imapSecure,
            tlsOptions: { rejectUnauthorized: false },
        }

        await ensureFoldersExist(mailboxId, imapConfig)
        await syncInboxFolder(mailboxId, imapConfig, result)

        await db.update(mailboxes)
            .set({ 
                lastSyncAt: new Date(),
                syncError: result.errors.length > 0 ? result.errors[0] : null,
            })
            .where(eq(mailboxes.id, mailboxId))

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(message)
        
        await db.update(mailboxes)
            .set({ syncError: message })
            .where(eq(mailboxes.id, mailboxId))
    }

    return result
}

async function ensureFoldersExist(mailboxId: string, imapConfig: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig)

        imap.once('ready', async () => {
            try {
                const existingFolders = await new Promise<FolderInfo[]>((resolveFolders, rejectFolders) => {
                    imap.getBoxes((err: any, boxes: any) => {
                        if (err) {
                            rejectFolders(err)
                            return
                        }

                        const folders: FolderInfo[] = []

                        const processBox = (box: any, path: string) => {
                            const fullPath = path ? `${path}${box.name}` : box.name
                            folders.push({
                                remoteId: fullPath,
                                name: box.name,
                                type: getFolderType(fullPath),
                            })

                            if (box.children) {
                                Object.entries(box.children).forEach(([_name, subBox]: [string, any]) => {
                                    processBox(subBox, fullPath + '/')
                                })
                            }
                        }

                        if (boxes) {
                            Object.entries(boxes).forEach(([_name, box]: [string, any]) => {
                                processBox(box, '')
                            })
                        }

                        resolveFolders(folders)
                    })
                })

                for (const folder of existingFolders) {
                    const existing = await db.query.mailFolders.findFirst({
                        where: and(
                            eq(mailFolders.mailboxId, mailboxId),
                            eq(mailFolders.remoteId, folder.remoteId)
                        ),
                    })

                    if (!existing) {
                        await db.insert(mailFolders).values({
                            mailboxId,
                            remoteId: folder.remoteId,
                            name: folder.name,
                            type: folder.type,
                        })
                    }
                }

                imap.end()
                resolve()
            } catch (error) {
                imap.end()
                reject(error)
            }
        })

        imap.once('error', (err: any) => {
            reject(err)
        })

        imap.connect()
    })
}

function getFolderType(remoteId: string): string {
    const upper = remoteId.toUpperCase()
    if (upper === 'INBOX') return 'inbox'
    if (upper === 'SENT' || upper === 'SENT MAIL' || upper.endsWith('SENT')) return 'sent'
    if (upper === 'DRAFTS' || upper.endsWith('DRAFTS')) return 'drafts'
    if (upper === 'TRASH' || upper === 'DELETED' || upper.endsWith('TRASH') || upper.endsWith('DELETED')) return 'trash'
    if (upper === 'SPAM' || upper === 'JUNK' || upper.endsWith('SPAM') || upper.endsWith('JUNK')) return 'spam'
    return 'custom'
}

async function syncInboxFolder(
    mailboxId: string,
    imapConfig: any,
    result: SyncResult
): Promise<void> {
    const folder = await db.query.mailFolders.findFirst({
        where: and(
            eq(mailFolders.mailboxId, mailboxId),
            eq(mailFolders.remoteId, 'INBOX')
        ),
    })

    if (!folder) {
        result.errors.push('INBOX folder not found in database')
        return
    }

    result.folderId = folder.id

    return new Promise((resolve) => {
        const imap = new Imap(imapConfig)

        imap.once('ready', () => {
            imap.openBox('INBOX', true, async (err: any, box: any) => {
                if (err) {
                    result.errors.push(`Failed to open INBOX: ${err.message}`)
                    imap.end()
                    resolve()
                    return
                }

                try {
                    if (box.messages.total > 0) {
                        const startSeq = Math.max(1, box.messages.total - 100)
                        const messages = await fetchMessages(imap, box, mailboxId, folder.id, startSeq, box.messages.total)
                        result.newMessages += messages
                    }

                    await db.update(mailFolders)
                        .set({ 
                            unreadCount: box.messages.unseen,
                            totalCount: box.messages.total,
                        })
                        .where(eq(mailFolders.id, folder.id))

                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Unknown error'
                    result.errors.push(`Error syncing INBOX: ${msg}`)
                }

                imap.end()
                resolve()
            })
        })

        imap.once('error', (err: any) => {
            result.errors.push(`IMAP error: ${err.message}`)
            resolve()
        })

        imap.connect()
    })
}

async function fetchMessages(
    imap: any,
    box: any,
    mailboxId: string,
    folderId: string,
    startSeq: number,
    endSeq: number
): Promise<number> {
    return new Promise((resolve, reject) => {
        const fetch = imap.fetch(`${startSeq}:${endSeq}`, {
            bodies: '',
            struct: true,
        })

        let newCount = 0
        let completed = 0

        fetch.on('message', (msg: any) => {
            let uid: number | null = null
            let messageId: string | null = null
            let raw = ''

            msg.on('attributes', (attrs: any) => {
                uid = attrs.uid
                const headers = attrs.headers
                if (headers) {
                    const msgIdHeader = headers.find((h: any) => h.key === 'message-id')
                    messageId = msgIdHeader ? msgIdHeader.value : null
                }
            })

            msg.on('body', (stream: any) => {
                stream.on('data', (chunk: any) => {
                    raw += chunk.toString('utf8')
                })
            })

            msg.once('end', async () => {
                completed++

                if (messageId && uid) {
                    try {
                        const existing = await db.query.mailMessages.findFirst({
                            where: and(
                                eq(mailMessages.mailboxId, mailboxId),
                                eq(mailMessages.folderId, folderId),
                                eq(mailMessages.remoteUid, uid)
                            ),
                        })

                        if (!existing) {
                            const parsed = await simpleParser(raw)

                            await db.insert(mailMessages).values({
                                mailboxId,
                                folderId,
                                messageId: parsed.messageId || null,
                                inReplyTo: parsed.inReplyTo || null,
                                references: parsed.references?.join(' ') || null,
                                subject: parsed.subject || null,
                                fromAddress: parsed.from?.value[0]?.address || null,
                                fromName: parsed.from?.value[0]?.name || null,
                                toAddresses: parsed.to?.value.map((v: any) => ({ 
                                    name: v.name, 
                                    address: v.address 
                                })) || [],
                                plainBody: parsed.text || null,
                                htmlBody: parsed.html as string || null,
                                headers: {},
                                hasAttachments: parsed.attachments.length > 0,
                                attachments: parsed.attachments.map((att: any) => ({
                                    filename: att.filename,
                                    contentType: att.contentType,
                                    size: att.size,
                                })),
                                isRead: false,
                                isDraft: false,
                                remoteUid: uid,
                                remoteDate: parsed.date || null,
                                receivedAt: parsed.date || new Date(),
                            })

                            newCount++
                        }
                    } catch (error) {
                        console.error('Error processing message:', error)
                    }
                }

                if (completed >= endSeq - startSeq + 1) {
                    resolve(newCount)
                }
            })
        })

        fetch.once('error', (err: any) => {
            console.error('Fetch error:', err)
            resolve(0)
        })
    })
}

export async function syncAllMailboxes(): Promise<SyncResult[]> {
    const mailboxesToSync = await db.query.mailboxes.findMany({
        where: eq(mailboxes.isActive, true),
    })

    const results: SyncResult[] = []

    for (const mailbox of mailboxesToSync) {
        const result = await syncMailbox(mailbox.id)
        results.push(result)
    }

    return results
}
