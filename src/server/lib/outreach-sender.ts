/**
 * Outreach Email Sender
 * Handles sending outreach emails through SMTP or Outlook OAuth
 */

import nodemailer from 'nodemailer'
import { db } from '../../db'
import { campaigns, sequenceSteps, campaignLeads, leads, emailAccounts, outreachEmails } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { decryptSecret } from './crypto'
import { interpolateTemplate, type LeadForTemplate } from './template-variables'
import { injectTracking } from './tracking'
import { sendMessageWithOutlook } from './outlook'
import { generateUnsubscribeLink } from '../routes/outreach/unsubscribe'
import { generateOutreachToken } from './outreach-tokens'

interface SendOutreachEmailParams {
    account: typeof emailAccounts.$inferSelect
    lead: typeof leads.$inferSelect
    campaign: typeof campaigns.$inferSelect
    step: typeof sequenceSteps.$inferSelect
    campaignLeadId: string
    trackOpens?: boolean
    trackClicks?: boolean
    trackingBaseUrl?: string
    abVariant?: 'a' | 'b'
}

interface SendResult {
    success: boolean
    messageId?: string
    error?: string
    finalHtml?: string
    finalText?: string
    trackingToken?: string
}

export function createSmtpTransporter(account: typeof emailAccounts.$inferSelect): nodemailer.Transporter {
    if (!account.smtpHost || !account.smtpPassword || !account.smtpUsername) {
        throw new Error('SMTP account missing required fields')
    }
    
    const decryptedPassword = decryptSecret(account.smtpPassword)

    return nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort || 587,
        secure: account.smtpSecure ?? true,
        auth: {
            user: account.smtpUsername,
            pass: decryptedPassword,
        },
    })
}

export function isWithinSendWindow(campaign: typeof campaigns.$inferSelect, now: Date): boolean {
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (isWeekend && !campaign.sendOnWeekends) {
        return false
    }

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    const parseTime = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + (minutes || 0)
    }

    const startTimeMinutes = parseTime(campaign.sendStartTime)
    const endTimeMinutes = parseTime(campaign.sendEndTime)

    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes
}

export function canSendFromAccount(account: typeof emailAccounts.$inferSelect): boolean {
    if (account.status !== 'verified') {
        return false
    }

    if (account.currentDailySent >= account.dailySendLimit) {
        return false
    }

    return true
}

export function getNextStepForLead(
    campaignLead: typeof campaignLeads.$inferSelect,
    steps: (typeof sequenceSteps.$inferSelect)[]
): (typeof sequenceSteps.$inferSelect) | null {
    const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder)
    const nextStep = sortedSteps.find(step => step.stepOrder > campaignLead.currentStepOrder)
    return nextStep || null
}

export function calculateNextScheduledAt(step: typeof sequenceSteps.$inferSelect): Date {
    const nextDate = new Date()
    nextDate.setHours(nextDate.getHours() + step.delayHours)
    return nextDate
}

export async function sendOutreachEmail(params: SendOutreachEmailParams): Promise<SendResult> {
    const { account, lead, campaign, step, campaignLeadId, trackOpens, trackClicks, trackingBaseUrl, abVariant } = params

    try {
        const subjectTemplate = abVariant === 'b' && step.subjectB ? step.subjectB : step.subject
        const htmlTemplate = abVariant === 'b' && step.htmlBodyB ? step.htmlBodyB : step.htmlBody
        const plainTemplate = abVariant === 'b' && step.plainBodyB ? step.plainBodyB : step.plainBody

        const baseUrl = trackingBaseUrl || process.env.FRONTEND_URL || 'http://localhost:9000'
        const unsubscribeUrl = generateUnsubscribeLink(campaignLeadId, campaign.id, baseUrl)
        const trackingToken = generateOutreachToken({ kind: 'track', clid: campaignLeadId, cid: campaign.id })

        const leadForTemplate: LeadForTemplate = {
            email: lead.email,
            firstName: lead.firstName,
            lastName: lead.lastName,
            companyName: lead.companyName,
            companySize: lead.companySize,
            industry: lead.industry,
            title: lead.title,
            website: lead.website,
            linkedinUrl: lead.linkedinUrl,
            phone: lead.phone,
            location: lead.location,
            customFields: lead.customFields as Record<string, any> | null,
        }

        // P0-03: {{unsubscribeUrl}} resolves via the template context (Plan 14-05 added support in template-variables.ts).
        const tplContext = { unsubscribeUrl }
        const subject = interpolateTemplate(subjectTemplate || '', leadForTemplate, tplContext)
        let html = htmlTemplate ? interpolateTemplate(htmlTemplate, leadForTemplate, tplContext) : undefined
        const text = plainTemplate ? interpolateTemplate(plainTemplate, leadForTemplate, tplContext) : undefined

        if (html && (trackOpens || trackClicks)) {
            // Use the signed HMAC tracking token (NOT the raw campaignLeadId) so /t/open/:token
            // and /t/click/:token can lookup outreach_emails.tracking_token (see Plan 14-05 track.ts edit).
            html = injectTracking(html, trackingToken, baseUrl, trackOpens ?? false, trackClicks ?? false)
        }

        // P0-03: Inject List-Unsubscribe headers for Gmail/Yahoo bulk-sender compliance (RFC 8058 one-click).
        // Build the mailto fallback from the campaign's reply-to domain, else fall back to MAIL_DOMAIN env.
        const replyToDomain = campaign.replyToEmail?.split('@')[1] || process.env.MAIL_DOMAIN || 'example.com'
        const headers: Record<string, string> = {
            'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@${replyToDomain}?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        }

        if (account.provider === 'outlook' && account.outlookMailboxId) {
            // NOTE: sendMessageWithOutlook does not currently accept arbitrary headers (Graph API
            // limits header customization). List-Unsubscribe via Outlook is a known P1 limitation
            // documented in deferred ideas (phase 15). For SMTP accounts the headers go through.
            await sendMessageWithOutlook({
                organizationId: account.organizationId,
                mailboxId: account.outlookMailboxId,
                fromAddress: account.email,
                to: [lead.email],
                subject,
                htmlBody: html,
                plainBody: text,
            })

            return {
                success: true,
                finalHtml: html,
                finalText: text,
                trackingToken,
            }
        }

        const transporter = createSmtpTransporter(account)

        const fromName = campaign.fromName || account.displayName || ''
        const fromAddress = fromName ? `"${fromName}" <${account.email}>` : account.email

        const mailOptions: nodemailer.SendMailOptions = {
            from: fromAddress,
            to: lead.email,
            subject,
            html,
            text,
            replyTo: campaign.replyToEmail || undefined,
            headers,
        }

        const info = await transporter.sendMail(mailOptions)

        return {
            success: true,
            messageId: info.messageId,
            finalHtml: html,
            finalText: text,
            trackingToken,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error sending email'
        return {
            success: false,
            error: errorMessage,
        }
    }
}

export async function recordOutreachEmail(params: {
    organizationId: string
    campaignId: string
    campaignLeadId: string
    sequenceStepId: string
    emailAccountId: string
    subject: string
    plainBody: string | null
    htmlBody: string | null
    abVariant: 'a' | 'b' | null
    messageId?: string
    trackingToken: string   // now REQUIRED — passed by processOutreachSequences (Plan 14-06)
}): Promise<typeof outreachEmails.$inferSelect> {
    const [record] = await db.insert(outreachEmails).values({
        organizationId: params.organizationId,
        campaignId: params.campaignId,
        campaignLeadId: params.campaignLeadId,
        sequenceStepId: params.sequenceStepId,
        emailAccountId: params.emailAccountId,
        subject: params.subject,
        plainBody: params.plainBody,
        htmlBody: params.htmlBody,
        abVariant: params.abVariant,
        messageId: params.messageId,
        trackingToken: params.trackingToken,    // Replaces the 14-03 TEMP placeholder.
        status: 'sent',
        sentAt: new Date(),
    }).returning()

    return record
}

export async function updateCampaignLeadProgress(
    campaignLeadId: string,
    nextStep: typeof sequenceSteps.$inferSelect,
    nextScheduledAt: Date
): Promise<void> {
    await db.update(campaignLeads)
        .set({
            currentStepId: nextStep.id,
            currentStepOrder: nextStep.stepOrder,
            nextScheduledAt,
            status: 'contacted',
            lastContactedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(campaignLeads.id, campaignLeadId))
}

export async function updateLeadStatus(
    leadId: string,
    status: typeof leads.$inferSelect['status']
): Promise<void> {
    await db.update(leads)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(eq(leads.id, leadId))
}

export async function incrementAccountStats(
    accountId: string,
    field: 'totalSent' | 'totalOpens' | 'totalClicks' | 'totalReplies' | 'totalBounces' | 'currentDailySent'
): Promise<void> {
    const updateData: Record<string, any> = {
        updatedAt: new Date(),
    }

    if (field === 'currentDailySent') {
        updateData[field] = sql`${emailAccounts[field]} + 1`
        updateData.lastSentAt = new Date()
    } else if (field === 'totalSent') {
        updateData[field] = sql`${emailAccounts[field]} + 1`
        updateData.currentDailySent = sql`${emailAccounts.currentDailySent} + 1`
        updateData.lastSentAt = new Date()
    } else {
        updateData[field] = sql`${emailAccounts[field]} + 1`
    }

    await db.update(emailAccounts)
        .set(updateData)
        .where(eq(emailAccounts.id, accountId))
}

export async function incrementCampaignStats(
    campaignId: string,
    field: 'totalLeads' | 'leadsContacted' | 'totalOpens' | 'totalClicks' | 'totalReplies' | 'totalBounces' | 'totalUnsubscribes'
): Promise<void> {
    await db.update(campaigns)
        .set({
            [field]: sql`${campaigns[field]} + 1`,
            updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId))
}

export type { SendOutreachEmailParams, SendResult }
