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

import { ImapFlow } from 'imapflow'
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
            const replyCount = await processAccountReplies(account)
            result.processed++
            result.replies += replyCount
        } catch (error) {
            result.errors++
            console.error(`[processReplies] Error processing account ${account.email}:`, error)
        }
    }

    return result
}

async function processAccountReplies(account: EmailAccountWithImap): Promise<number> {
    let replyCount = 0
    let client: ImapFlow | null = null

    const password = decryptSecret(account.imapPassword!)

    try {
        client = new ImapFlow({
            host: account.imapHost!,
            port: account.imapPort || 993,
            secure: account.imapSecure !== false,
            auth: {
                user: account.imapUsername!,
                pass: password,
            },
            logger: false,
        })

        await client.connect()

        const lock = await client.getMailboxLock('INBOX')
        try {
            const uids = await client.search({ seen: false }, { uid: true })
            if (!uids || uids.length === 0) {
                return replyCount
            }

            for (const uid of uids) {
                try {
                    const msg = await client.fetchOne(uid.toString(), {
                        headers: ['in-reply-to', 'references'],
                    }, { uid: true })

                    if (!msg || !msg.headers) continue

                    const headerText = msg.headers.toString('utf8')
                    const inReplyToMatch = headerText.match(/^In-Reply-To:\s*(.+)$/im)
                    const referencesMatch = headerText.match(/^References:\s*(.+)$/im)
                    const inReplyTo = inReplyToMatch ? inReplyToMatch[1].trim() : null
                    const references = referencesMatch ? referencesMatch[1].trim() : null

                    const messageId = inReplyTo || extractFirstReference(references)
                    if (!messageId) continue

                    const outreachEmail = await findOutreachEmailByMessageId(messageId)
                    if (!outreachEmail) continue

                    await markAsReplied(
                        outreachEmail.id,
                        outreachEmail.campaignLeadId,
                        outreachEmail.leadId,
                        outreachEmail.campaignId,
                        outreachEmail.emailAccountId
                    )
                    replyCount++

                    try {
                        await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
                    } catch {
                        // Ignore flag errors
                    }
                } catch (error) {
                    console.error(`[processReplies] Error processing message ${uid}:`, error)
                }
            }
        } finally {
            lock.release()
        }
    } finally {
        if (client) {
            try {
                await client.logout()
            } catch {
                // Ignore logout errors
            }
        }
    }

    return replyCount
}

function extractFirstReference(references: string | null): string | null {
    if (!references) return null
    const refs = references.split(/\s+/).filter(Boolean)
    return refs.length > 0 ? refs[0] : null
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
