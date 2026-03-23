/**
 * Process Replies to Outreach Emails
 *
 * This job checks IMAP inboxes for replies to outreach emails:
 * - Connects to each email account's IMAP server
 * - Checks for new messages in INBOX
 * - Matches replies to sent outreach emails via Message-ID or In-Reply-To headers
 * - Updates outreach_emails.repliedAt
 * - Updates campaign_leads.status to 'replied' (stops sequence)
 * - Updates leads.status and leads.lastRepliedAt
 * - Increments campaign and account reply stats
 */

import Imap from 'imap'
import { db } from '../../db'
import { emailAccounts, outreachEmails, campaignLeads, leads, campaigns } from '../../db/schema'
import { eq, and, isNotNull, sql } from 'drizzle-orm'
import { decryptSecret } from '../lib/crypto'

interface ProcessRepliesResult {
    processed: number
    replies: number
    errors: number
}

interface EmailAccountWithImap {
    id: string
    email: string
    imapHost: string | null
    imapPort: number | null
    imapUsername: string | null
    imapPassword: string | null
    imapSecure: boolean | null
}

interface OutreachEmailWithRelations {
    id: string
    campaignLeadId: string
    campaignId: string
    emailAccountId: string
    leadId: string
}

export async function processReplies(): Promise<ProcessRepliesResult> {
    const result: ProcessRepliesResult = {
        processed: 0,
        replies: 0,
        errors: 0,
    }

    const accounts = await db
        .select({
            id: emailAccounts.id,
            email: emailAccounts.email,
            imapHost: emailAccounts.imapHost,
            imapPort: emailAccounts.imapPort,
            imapUsername: emailAccounts.imapUsername,
            imapPassword: emailAccounts.imapPassword,
            imapSecure: emailAccounts.imapSecure,
        })
        .from(emailAccounts)
        .where(
            and(
                eq(emailAccounts.status, 'verified'),
                isNotNull(emailAccounts.imapHost),
                isNotNull(emailAccounts.imapUsername),
                isNotNull(emailAccounts.imapPassword)
            )
        )

    for (const account of accounts) {
        try {
            const replyCount = await processAccountInbox(account)
            result.processed++
            result.replies += replyCount
        } catch (error) {
            result.errors++
            console.error(`[processReplies] Error processing account ${account.email}:`, error)
        }
    }

    return result
}

async function processAccountInbox(account: EmailAccountWithImap): Promise<number> {
    return new Promise((resolve, reject) => {
        let replyCount = 0
        let imap: Imap | null = null

        const password = decryptSecret(account.imapPassword!)

        imap = new Imap({
            user: account.imapUsername!,
            password: password,
            host: account.imapHost!,
            port: account.imapPort || 993,
            tls: account.imapSecure !== false,
            tlsOptions: { rejectUnauthorized: false },
        })

        imap.once('error', (err: Error) => {
            reject(err)
        })

        imap.once('end', () => {
            resolve(replyCount)
        })

        imap.once('ready', () => {
            imap!.openBox('INBOX', false, (openErr, box) => {
                if (openErr) {
                    imap!.end()
                    reject(openErr)
                    return
                }

                imap!.search(['UNSEEN'], (searchErr, results) => {
                    if (searchErr) {
                        imap!.end()
                        reject(searchErr)
                        return
                    }

                    if (!results || results.length === 0) {
                        imap!.end()
                        return
                    }

                    const fetch = imap!.fetch(results, {
                        bodies: 'HEADER.FIELDS (IN-REPLY-TO REFERENCES)',
                        struct: false,
                    })

                    const messages: { uid: number; inReplyTo: string | null; references: string | null }[] = []

                    fetch.on('message', (msg, seqno) => {
                        let inReplyTo: string | null = null
                        let references: string | null = null
                        let uid: number = 0

                        msg.on('body', (stream) => {
                            let buffer = ''
                            stream.on('data', (chunk: Buffer) => {
                                buffer += chunk.toString('utf8')
                            })
                            stream.once('end', () => {
                                const inReplyToMatch = buffer.match(/^In-Reply-To:\s*(.+)$/im)
                                const referencesMatch = buffer.match(/^References:\s*(.+)$/im)
                                inReplyTo = inReplyToMatch ? inReplyToMatch[1].trim() : null
                                references = referencesMatch ? referencesMatch[1].trim() : null
                            })
                        })

                        msg.once('attributes', (attrs) => {
                            uid = (attrs as { uid: number }).uid
                        })

                        msg.once('end', () => {
                            messages.push({ uid, inReplyTo, references })
                        })
                    })

                    fetch.once('error', (fetchErr: Error) => {
                        imap!.end()
                        reject(fetchErr)
                    })

                    fetch.once('end', async () => {
                        for (const msg of messages) {
                            const messageId = msg.inReplyTo || extractFirstReference(msg.references)
                            if (!messageId) continue

                            const outreachEmail = await findOutreachEmailByMessageId(messageId)
                            if (!outreachEmail) continue

                            try {
                                await markAsReplied(
                                    outreachEmail.id,
                                    outreachEmail.campaignLeadId,
                                    outreachEmail.leadId,
                                    outreachEmail.campaignId,
                                    outreachEmail.emailAccountId
                                )
                                replyCount++
                            } catch (markErr) {
                                console.error(`[processReplies] Error marking email as replied:`, markErr)
                            }
                        }

                        imap!.end()
                    })
                })
            })
        })

        imap.connect()
    })
}

function extractFirstReference(references: string | null): string | null {
    if (!references) return null
    const refs = references.split(/\s+/).filter(Boolean)
    return refs.length > 0 ? refs[0] : null
}

export async function connectImap(account: EmailAccountWithImap): Promise<Imap> {
    return new Promise((resolve, reject) => {
        const password = decryptSecret(account.imapPassword!)

        const imap = new Imap({
            user: account.imapUsername!,
            password: password,
            host: account.imapHost!,
            port: account.imapPort || 993,
            tls: account.imapSecure !== false,
            tlsOptions: { rejectUnauthorized: false },
        })

        imap.once('error', (err: Error) => {
            reject(err)
        })

        imap.once('ready', () => {
            resolve(imap)
        })

        imap.connect()
    })
}

export async function findOutreachEmailByMessageId(messageId: string): Promise<OutreachEmailWithRelations | null> {
    const cleanMessageId = messageId.replace(/[<>]/g, '').trim()

    const result = await db
        .select({
            id: outreachEmails.id,
            campaignLeadId: outreachEmails.campaignLeadId,
            campaignId: outreachEmails.campaignId,
            emailAccountId: outreachEmails.emailAccountId,
            leadId: campaignLeads.leadId,
        })
        .from(outreachEmails)
        .innerJoin(campaignLeads, eq(outreachEmails.campaignLeadId, campaignLeads.id))
        .where(eq(outreachEmails.messageId, cleanMessageId))
        .limit(1)

    return result[0] || null
}

export async function markAsReplied(
    outreachEmailId: string,
    campaignLeadId: string,
    leadId: string,
    campaignId: string,
    accountId: string
): Promise<void> {
    const now = new Date()

    await Promise.all([
        db.update(outreachEmails).set({ repliedAt: now }).where(eq(outreachEmails.id, outreachEmailId)),

        db
            .update(campaignLeads)
            .set({
                status: 'replied',
                lastRepliedAt: now,
                totalReplies: sql`${campaignLeads.totalReplies} + 1`,
            })
            .where(eq(campaignLeads.id, campaignLeadId)),

        db
            .update(leads)
            .set({
                status: sql`CASE WHEN ${leads.status} IN ('replied', 'interested', 'not_interested') THEN ${leads.status} ELSE 'replied' END`,
                lastRepliedAt: now,
                totalReplies: sql`${leads.totalReplies} + 1`,
            })
            .where(eq(leads.id, leadId)),

        db
            .update(campaigns)
            .set({
                totalReplies: sql`${campaigns.totalReplies} + 1`,
            })
            .where(eq(campaigns.id, campaignId)),

        db
            .update(emailAccounts)
            .set({
                totalReplies: sql`${emailAccounts.totalReplies} + 1`,
            })
            .where(eq(emailAccounts.id, accountId)),
    ])
}
