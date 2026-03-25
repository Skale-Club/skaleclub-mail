/**
 * Process Outreach Email Sequences
 * 
 * This job runs on a cron schedule to process pending outreach emails:
 * - Finds campaign leads with nextScheduledAt <= now
 * - Sends emails through assigned email accounts
 * - Tracks email delivery
 * - Advances leads through sequence steps
 * - Updates campaign stats
 */

import nodemailer from 'nodemailer'
import { db } from '../../db'
import { campaigns, sequenceSteps, campaignLeads, leads, emailAccounts, outreachEmails, suppressions } from '../../db/schema'
import { eq, and, lte, gt, sql, inArray, notInArray } from 'drizzle-orm'
import { decryptSecret } from '../lib/crypto'
import { interpolateTemplate } from '../lib/template-variables'
import { injectTracking } from '../lib/tracking'

type Campaign = typeof campaigns.$inferSelect
type Lead = typeof leads.$inferSelect
type SequenceStep = typeof sequenceSteps.$inferSelect
type EmailAccount = typeof emailAccounts.$inferSelect

function isWithinSendWindow(campaign: Campaign, now: Date): boolean {
    if (!campaign.sendOnWeekends) {
        const day = now.getDay()
        if (day === 0 || day === 6) {
            return false
        }
    }

    const [startHour, startMin] = (campaign.sendStartTime || '09:00').split(':').map(Number)
    const [endHour, endMin] = (campaign.sendEndTime || '17:00').split(':').map(Number)
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = startHour * 60 + (startMin || 0)
    const endMinutes = endHour * 60 + (endMin || 0)
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
}

function canSendFromAccount(account: EmailAccount): boolean {
    return account.currentDailySent < account.dailySendLimit
}

function getNextStep(steps: SequenceStep[], currentStepOrder: number): SequenceStep | null {
    return steps.find(s => s.stepOrder > currentStepOrder) || null
}

function calculateNextScheduledAt(
    delayHours: number,
    timezone: string,
    sendStartTime: string,
    sendEndTime: string,
    sendOnWeekends: boolean
): Date {
    const next = new Date()
    next.setHours(next.getHours() + delayHours)
    
    const [startHour] = (sendStartTime || '09:00').split(':').map(Number)
    const [endHour] = (sendEndTime || '17:00').split(':').map(Number)
    
    const hour = next.getHours()
    if (hour < startHour) {
        next.setHours(startHour, 0, 0, 0)
    } else if (hour >= endHour) {
        next.setDate(next.getDate() + 1)
        next.setHours(startHour, 0, 0, 0)
    }
    
    if (!sendOnWeekends) {
        const day = next.getDay()
        if (day === 0) {
            next.setDate(next.getDate() + 1)
        } else if (day === 6) {
            next.setDate(next.getDate() + 2)
        }
    }
    
    return next
}

async function sendEmail(
    account: EmailAccount,
    to: string,
    fromName: string | null,
    subject: string,
    htmlBody: string | null,
    plainBody: string | null,
    replyTo?: string | null,
    tracking?: { token: string; baseUrl: string; trackOpens: boolean; trackClicks: boolean }
): Promise<{ messageId: string; finalHtml: string | null }> {
    const transporter = nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpSecure,
        auth: {
            user: account.smtpUsername,
            pass: decryptSecret(account.smtpPassword)
        }
    })

    let finalHtml = htmlBody
    if (finalHtml && tracking && (tracking.trackOpens || tracking.trackClicks)) {
        finalHtml = injectTracking(
            finalHtml,
            tracking.token,
            tracking.baseUrl,
            tracking.trackOpens,
            tracking.trackClicks
        )
    }

    const from = fromName ? `${fromName} <${account.email}>` : account.email

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html: finalHtml || undefined,
        text: plainBody || undefined,
        replyTo: replyTo || undefined
    })

    return { messageId: info.messageId, finalHtml }
}

export async function processOutreachSequences(): Promise<{ processed: number; sent: number; errors: number }> {
    const now = new Date()
    const result = { processed: 0, sent: 0, errors: 0 }

    const pendingLeads = await db.query.campaignLeads.findMany({
        where: and(
            lte(campaignLeads.nextScheduledAt, now),
            notInArray(campaignLeads.status, ['replied', 'bounced', 'unsubscribed'])
        ),
        with: {
            campaign: true,
            lead: true,
            currentStep: true,
            assignedEmailAccount: true
        }
    })

    if (pendingLeads.length === 0) {
        return result
    }

    const campaignIds = [...new Set(pendingLeads.map(cl => cl.campaignId))]
    const campaignsMap = new Map(
        (await db.query.campaigns.findMany({
            where: inArray(campaigns.id, campaignIds)
        })).map(c => [c.id, c])
    )

    const sequenceIds = [...new Set(
        pendingLeads
            .filter(cl => cl.currentStep?.sequenceId)
            .map(cl => cl.currentStep!.sequenceId)
    )]

    const allSteps = await db.query.sequenceSteps.findMany({
        where: inArray(sequenceSteps.sequenceId, sequenceIds),
        orderBy: (steps, { asc }) => [asc(steps.stepOrder)]
    })
    const stepsBySequence = new Map<string, typeof allSteps>()
    for (const step of allSteps) {
        if (!stepsBySequence.has(step.sequenceId)) {
            stepsBySequence.set(step.sequenceId, [])
        }
        stepsBySequence.get(step.sequenceId)!.push(step)
    }

    for (const campaignLead of pendingLeads) {
        result.processed++

        try {
            const campaign = campaignsMap.get(campaignLead.campaignId)
            if (!campaign) {
                console.error(`Campaign ${campaignLead.campaignId} not found`)
                result.errors++
                continue
            }

            if (campaign.status !== 'active') {
                continue
            }

            const lead = campaignLead.lead
            if (!lead) {
                console.error(`Lead not found for campaign lead ${campaignLead.id}`)
                result.errors++
                continue
            }

            if (lead.unsubscribedAt) {
                await db.update(campaignLeads)
                    .set({ status: 'unsubscribed', nextScheduledAt: null })
                    .where(eq(campaignLeads.id, campaignLead.id))
                continue
            }

            const isSuppressed = await db.query.suppressions.findFirst({
                where: and(
                    eq(suppressions.organizationId, campaign.organizationId),
                    eq(suppressions.emailAddress, lead.email)
                ),
            })
            if (isSuppressed) {
                await db.update(campaignLeads)
                    .set({ status: 'bounced', nextScheduledAt: null })
                    .where(eq(campaignLeads.id, campaignLead.id))
                continue
            }

            if (!isWithinSendWindow(campaign, now)) {
                continue
            }

            const emailAccount = campaignLead.assignedEmailAccount
            if (!emailAccount) {
                console.error(`No email account assigned for campaign lead ${campaignLead.id}`)
                result.errors++
                continue
            }

            if (emailAccount.status !== 'verified') {
                console.error(`Email account ${emailAccount.id} is not verified`)
                result.errors++
                continue
            }

            if (!canSendFromAccount(emailAccount)) {
                console.log(`Email account ${emailAccount.id} has reached daily limit`)
                continue
            }

            const currentStep = campaignLead.currentStep
            if (!currentStep) {
                console.error(`No current step for campaign lead ${campaignLead.id}`)
                result.errors++
                continue
            }

            const subject = interpolateTemplate(currentStep.subject || '', lead as any)
            const htmlBody = currentStep.htmlBody ? interpolateTemplate(currentStep.htmlBody, lead as any) : null
            const plainBody = currentStep.plainBody ? interpolateTemplate(currentStep.plainBody, lead as any) : null

            const trackingBaseUrl = process.env.FRONTEND_URL || 'http://localhost:9000'
            const { messageId, finalHtml } = await sendEmail(
                emailAccount,
                lead.email,
                campaign.fromName,
                subject,
                htmlBody,
                plainBody,
                campaign.replyToEmail,
                {
                    token: campaignLead.id,
                    baseUrl: trackingBaseUrl,
                    trackOpens: campaign.trackOpens,
                    trackClicks: campaign.trackClicks,
                }
            )

            await db.insert(outreachEmails).values({
                organizationId: campaign.organizationId,
                campaignId: campaign.id,
                campaignLeadId: campaignLead.id,
                sequenceStepId: currentStep.id,
                emailAccountId: emailAccount.id,
                messageId,
                subject,
                plainBody,
                htmlBody: finalHtml,
                abVariant: null,
                status: 'sent',
                sentAt: new Date()
            })

            const isFirstContact = !campaignLead.firstContactedAt
            await db.update(campaignLeads)
                .set({
                    status: 'contacted',
                    firstContactedAt: campaignLead.firstContactedAt || new Date(),
                    lastContactedAt: new Date(),
                    currentStepId: currentStep.id,
                    currentStepOrder: currentStep.stepOrder
                })
                .where(eq(campaignLeads.id, campaignLead.id))

            if (lead.status === 'new') {
                await db.update(leads)
                    .set({ status: 'contacted', lastContactedAt: new Date() })
                    .where(eq(leads.id, lead.id))
            }

            await db.update(emailAccounts)
                .set({
                    currentDailySent: sql`${emailAccounts.currentDailySent} + 1`,
                    totalSent: sql`${emailAccounts.totalSent} + 1`
                })
                .where(eq(emailAccounts.id, emailAccount.id))

            if (isFirstContact) {
                await db.update(campaigns)
                    .set({
                        leadsContacted: sql`${campaigns.leadsContacted} + 1`
                    })
                    .where(eq(campaigns.id, campaign.id))
            }

            const steps = stepsBySequence.get(currentStep.sequenceId) || []
            const nextStep = getNextStep(steps, currentStep.stepOrder)

            if (nextStep) {
                const nextScheduledAt = calculateNextScheduledAt(
                    nextStep.delayHours,
                    campaign.timezone,
                    campaign.sendStartTime,
                    campaign.sendEndTime,
                    campaign.sendOnWeekends
                )

                await db.update(campaignLeads)
                    .set({
                        currentStepId: nextStep.id,
                        currentStepOrder: nextStep.stepOrder,
                        nextScheduledAt
                    })
                    .where(eq(campaignLeads.id, campaignLead.id))
            } else {
                await db.update(campaignLeads)
                    .set({
                        completedAt: new Date(),
                        nextScheduledAt: null
                    })
                    .where(eq(campaignLeads.id, campaignLead.id))
            }

            result.sent++
        } catch (error) {
            console.error(`Error processing campaign lead ${campaignLead.id}:`, error)
            result.errors++
        }
    }

    return result
}

export async function resetDailyLimits(): Promise<void> {
    await db.update(emailAccounts)
        .set({ currentDailySent: 0 })
        .where(gt(emailAccounts.currentDailySent, 0))
}

export async function markCompletedCampaigns(): Promise<void> {
    const activeCampaigns = await db.query.campaigns.findMany({
        where: eq(campaigns.status, 'active')
    })

    for (const campaign of activeCampaigns) {
        const incompleteLeads = await db.query.campaignLeads.findMany({
            where: and(
                eq(campaignLeads.campaignId, campaign.id),
                notInArray(campaignLeads.status, ['replied', 'bounced', 'unsubscribed']),
            ),
            limit: 1
        })

        if (incompleteLeads.length === 0) {
            await db.update(campaigns)
                .set({
                    status: 'completed',
                    completedAt: new Date()
                })
                .where(eq(campaigns.id, campaign.id))
        }
    }
}
