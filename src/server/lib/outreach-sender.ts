/**
 * Outreach Email Sender
 * Handles sending outreach emails through SMTP accounts
 */

import nodemailer from 'nodemailer'
import { db } from '../../db'
import { campaigns, sequences, sequenceSteps, campaignLeads, leads, emailAccounts, outreachEmails } from '../../db/schema'
import { eq, and, lte, gt, sql } from 'drizzle-orm'
import { decryptSecret } from './crypto'
import { interpolateTemplate, type LeadForTemplate } from './template-variables'
import { injectTracking } from './tracking'

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
}

export function createSmtpTransporter(account: typeof emailAccounts.$inferSelect): nodemailer.Transporter {
    const decryptedPassword = decryptSecret(account.smtpPassword)

    return nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpSecure,
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
        const transporter = createSmtpTransporter(account)

        const subjectTemplate = abVariant === 'b' && step.subjectB ? step.subjectB : step.subject
        const htmlTemplate = abVariant === 'b' && step.htmlBodyB ? step.htmlBodyB : step.htmlBody
        const plainTemplate = abVariant === 'b' && step.plainBodyB ? step.plainBodyB : step.plainBody

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

        const subject = interpolateTemplate(subjectTemplate || '', leadForTemplate)
        let html = htmlTemplate ? interpolateTemplate(htmlTemplate, leadForTemplate) : undefined
        const text = plainTemplate ? interpolateTemplate(plainTemplate, leadForTemplate) : undefined

        if (html && (trackOpens || trackClicks)) {
            const baseUrl = trackingBaseUrl || process.env.FRONTEND_URL || 'http://localhost:9000'
            const trackingToken = campaignLeadId
            html = injectTracking(html, trackingToken, baseUrl, trackOpens ?? false, trackClicks ?? false)
        }

        const fromName = campaign.fromName || account.displayName || ''
        const fromAddress = fromName ? `"${fromName}" <${account.email}>` : account.email

        const mailOptions: nodemailer.SendMailOptions = {
            from: fromAddress,
            to: lead.email,
            subject,
            html,
            text,
            replyTo: campaign.replyToEmail || undefined,
        }

        const info = await transporter.sendMail(mailOptions)

        return {
            success: true,
            messageId: info.messageId,
            finalHtml: html,
            finalText: text,
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
