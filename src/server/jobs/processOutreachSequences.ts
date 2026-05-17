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

import { createHash } from 'crypto'
import { db } from '../../db'
import { campaigns, sequenceSteps, campaignLeads, leads, emailAccounts, outreachEmails, suppressions } from '../../db/schema'
import { eq, and, lte, gt, inArray, notInArray, sql } from 'drizzle-orm'
import {
    sendOutreachEmail,
    isWithinSendWindow,
    canSendFromAccount,
    incrementAccountStats,
    incrementCampaignStats,
    applySendJitter,
} from '../lib/outreach-sender'
import { generateOutreachToken } from '../lib/outreach-tokens'

type Campaign = typeof campaigns.$inferSelect
type Lead = typeof leads.$inferSelect
type SequenceStep = typeof sequenceSteps.$inferSelect
type EmailAccount = typeof emailAccounts.$inferSelect

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

function selectAbVariant(step: SequenceStep, leadId: string): 'a' | 'b' {
    if (!step.abTestEnabled) return 'a'
    // Deterministic hash — same lead+step always produces same variant on retry (SEND-04)
    const hash = createHash('md5').update(leadId + step.id).digest('hex')
    const hashInt = parseInt(hash.slice(0, 8), 16)
    const threshold = step.abTestPercentage ?? 50
    return (hashInt % 100) < threshold ? 'a' : 'b'
}

// Phase 16 — standardized skip-reason log shape. Phase 17 will replace this
// with pino structured logging; for now we use JSON.stringify so grep-able log
// search in production gives uniform results. All `reason` values are enumerated
// in CONTEXT.md so ops dashboards can pivot by reason.
type SkipReason =
    | 'rate_limit_per_inbox'
    | 'daily_limit_reached'
    | 'suppression'
    | 'no_active_step'
    | 'outside_send_window'
    | 'claim_conflict'
    | 'unsubscribed'
    | 'campaign_inactive'
    | 'campaign_not_found'
    | 'lead_not_found'
    | 'no_account'
    | 'account_not_verified'
    | 'in_batch_duplicate'

function logSkip(reason: SkipReason, ctx: {
    campaignId?: string
    leadId?: string
    campaignLeadId?: string
    emailAccountId?: string
    extra?: Record<string, unknown>
}): void {
    console.log('[outreach.processor]', JSON.stringify({
        action: 'skip',
        reason,
        ...ctx,
    }))
}

export async function processOutreachSequences(): Promise<{ processed: number; sent: number; errors: number }> {
    const now = new Date()
    const result = { processed: 0, sent: 0, errors: 0 }
    const PENDING_LEADS_LIMIT = 200

    const pendingLeads = await db.query.campaignLeads.findMany({
        where: and(
            lte(campaignLeads.nextScheduledAt, now),
            notInArray(campaignLeads.status, ['replied', 'bounced', 'unsubscribed'])
        ),
        limit: PENDING_LEADS_LIMIT,
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

    // Batch-load all suppressed emails for involved organizations
    const orgIds = [...new Set(pendingLeads.map(cl => cl.campaign.organizationId))]
    const allSuppressions = await db.query.suppressions.findMany({
        where: inArray(suppressions.organizationId, orgIds),
        columns: { organizationId: true, emailAddress: true },
    })
    const suppressedSet = new Set(allSuppressions.map(s => `${s.organizationId}:${s.emailAddress}`))

    // Batch-load existing outreach emails for idempotency checks
    const allExistingEmails = await db.query.outreachEmails.findMany({
        where: inArray(
            outreachEmails.campaignLeadId,
            pendingLeads.map(cl => cl.id)
        ),
        columns: { campaignLeadId: true, sequenceStepId: true },
    })
    const existingEmailsSet = new Set(
        allExistingEmails.map(e => `${e.campaignLeadId}:${e.sequenceStepId}`)
    )

    for (const campaignLead of pendingLeads) {
        result.processed++

        try {
            const campaign = campaignsMap.get(campaignLead.campaignId)
            if (!campaign) {
                logSkip('campaign_not_found', { campaignId: campaignLead.campaignId, campaignLeadId: campaignLead.id })
                result.errors++
                continue
            }

            if (campaign.status !== 'active') {
                logSkip('campaign_inactive', { campaignId: campaign.id, campaignLeadId: campaignLead.id })
                continue
            }

            const lead = campaignLead.lead
            if (!lead) {
                logSkip('lead_not_found', { campaignId: campaign.id, campaignLeadId: campaignLead.id })
                result.errors++
                continue
            }

            if (lead.unsubscribedAt) {
                logSkip('unsubscribed', { campaignId: campaign.id, leadId: lead.id, campaignLeadId: campaignLead.id })
                await db.update(campaignLeads)
                    .set({ status: 'unsubscribed', nextScheduledAt: null })
                    .where(eq(campaignLeads.id, campaignLead.id))
                continue
            }

            const isSuppressed = suppressedSet.has(`${campaign.organizationId}:${lead.email}`)
            if (isSuppressed) {
                logSkip('suppression', { campaignId: campaign.id, leadId: lead.id, campaignLeadId: campaignLead.id })
                await db.update(campaignLeads)
                    .set({ status: 'bounced', nextScheduledAt: null })
                    .where(eq(campaignLeads.id, campaignLead.id))
                continue
            }

            if (!isWithinSendWindow(campaign, now)) {
                logSkip('outside_send_window', { campaignId: campaign.id, leadId: lead.id, campaignLeadId: campaignLead.id })
                continue
            }

            const emailAccount = campaignLead.assignedEmailAccount
            if (!emailAccount) {
                logSkip('no_account', { campaignId: campaign.id, leadId: lead.id, campaignLeadId: campaignLead.id })
                result.errors++
                continue
            }

            if (emailAccount.status !== 'verified') {
                logSkip('account_not_verified', { campaignId: campaign.id, emailAccountId: emailAccount.id, campaignLeadId: campaignLead.id })
                result.errors++
                continue
            }

            // Phase 16 — INBOX-THROTTLE wire. canSendFromAccount(account, now) was extended
            // in Plan 16-01 to check (lastSentAt + minMinutesBetweenEmails*60s > now).
            // We discriminate the cause to emit the correct skip reason for ops visibility.
            if (!canSendFromAccount(emailAccount, now)) {
                if (emailAccount.currentDailySent >= emailAccount.dailySendLimit) {
                    logSkip('daily_limit_reached', {
                        campaignId: campaign.id,
                        emailAccountId: emailAccount.id,
                        campaignLeadId: campaignLead.id,
                        extra: { currentDailySent: emailAccount.currentDailySent, dailySendLimit: emailAccount.dailySendLimit },
                    })
                } else {
                    // Implied cause: lastSentAt + min*60s > now (the only other branch in canSendFromAccount).
                    logSkip('rate_limit_per_inbox', {
                        campaignId: campaign.id,
                        emailAccountId: emailAccount.id,
                        campaignLeadId: campaignLead.id,
                        extra: {
                            minMinutesBetweenEmails: emailAccount.minMinutesBetweenEmails,
                            lastSentAt: emailAccount.lastSentAt?.toISOString() ?? null,
                        },
                    })
                }
                continue
            }

            const currentStep = campaignLead.currentStep
            if (!currentStep) {
                logSkip('no_active_step', { campaignId: campaign.id, leadId: lead.id, campaignLeadId: campaignLead.id })
                result.errors++
                continue
            }

            // P0-05 idempotency-first: the in-memory guard catches duplicates within the
            // current batch; the ON CONFLICT DO NOTHING below is the DB-level guard that
            // survives process crashes and multi-instance races (in addition to the advisory
            // lock from Task 3 of plan 14-06).
            if (existingEmailsSet.has(`${campaignLead.id}:${currentStep.id}`)) {
                logSkip('in_batch_duplicate', { campaignId: campaign.id, campaignLeadId: campaignLead.id, extra: { sequenceStepId: currentStep.id } })
                continue
            }

            const abVariant = selectAbVariant(currentStep, lead.id)

            // Generate the HMAC tracking token up-front so the placeholder row has the NOT NULL value
            // AND the same token is passed to sendOutreachEmail so the URL-embedded token matches
            // the persisted one. Without this contract, track.ts lookups silently miss (Phase 15.1 fix).
            const trackingToken = generateOutreachToken({ kind: 'track', clid: campaignLead.id, cid: campaign.id })

            // Claim the (campaignLeadId, sequenceStepId) slot. The unique index
            // outreach_emails_campaign_lead_step_unique guarantees that only one INSERT wins.
            // Concurrent workers (or a re-tick after crash) see 0 rows returned → we skip
            // without sending. Status='queued' is used as the claim marker (the enum has no
            // 'sending' value — Plan 14-06 deviation Rule 1: enum does not include 'sending',
            // so we map sending→queued semantically).
            const claim = await db.insert(outreachEmails).values({
                organizationId: campaign.organizationId,
                campaignId: campaign.id,
                campaignLeadId: campaignLead.id,
                sequenceStepId: currentStep.id,
                emailAccountId: emailAccount.id,
                subject: currentStep.subject || '',
                plainBody: currentStep.plainBody ?? null,
                htmlBody: null,     // populated post-send with sendResult.finalHtml
                abVariant,
                trackingToken,
                status: 'queued',
                // sentAt deliberately NULL — set on successful send
            }).onConflictDoNothing({ target: [outreachEmails.campaignLeadId, outreachEmails.sequenceStepId] }).returning({ id: outreachEmails.id })

            if (claim.length === 0) {
                logSkip('claim_conflict', { campaignId: campaign.id, campaignLeadId: campaignLead.id, extra: { sequenceStepId: currentStep.id } })
                continue
            }

            const claimedEmailId = claim[0].id

            const trackingBaseUrl = process.env.FRONTEND_URL || 'http://localhost:9000'
            const sendResult = await sendOutreachEmail({
                account: emailAccount,
                lead,
                campaign,
                step: currentStep,
                campaignLeadId: campaignLead.id,
                trackingToken,
                trackOpens: campaign.trackOpens,
                trackClicks: campaign.trackClicks,
                trackingBaseUrl,
                abVariant,
            })

            if (!sendResult.success) {
                console.error(`[processOutreachSequences] Send failed for campaignLead ${campaignLead.id}: ${sendResult.error}`)
                await db.update(outreachEmails)
                    .set({
                        status: 'failed',
                        bounceReason: (sendResult.error || 'Unknown send error').slice(0, 500),
                        updatedAt: new Date(),
                    })
                    .where(eq(outreachEmails.id, claimedEmailId))
                result.errors++
                continue
            }

            // Update the claimed row to reflect successful send.
            await db.update(outreachEmails)
                .set({
                    status: 'sent',
                    messageId: sendResult.messageId,
                    htmlBody: sendResult.finalHtml ?? null,
                    sentAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(outreachEmails.id, claimedEmailId))

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

            await incrementAccountStats(emailAccount.id, 'totalSent')
            // NOTE: incrementAccountStats('totalSent') increments BOTH totalSent AND currentDailySent in a single UPDATE

            if (isFirstContact) {
                await incrementCampaignStats(campaign.id, 'leadsContacted')
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
    const result = await db.update(emailAccounts)
        .set({ currentDailySent: 0 })
        .where(gt(emailAccounts.currentDailySent, 0))
        .returning({ id: emailAccounts.id })
    console.log(`[resetDailyLimits] Reset daily send counter for ${result.length} accounts`)
}

// P0-06: Postgres advisory lock — prevents two container instances (or a blue-green deploy
// overlap) from running the processor concurrently. Replaces the in-memory mutex previously
// in jobs/index.ts which only protected within a single Node process.
//
// Inspect held locks in production: `SELECT * FROM pg_locks WHERE locktype='advisory';`
// Decoded lockid for this job: 4014 (phase 14, P0-06 mnemonic).
const LOCK_ID_OUTREACH_PROCESSOR = 4014

export async function runOutreachProcessorWithLock(): Promise<{ acquired: boolean; result?: { processed: number; sent: number; errors: number } }> {
    // Try to acquire the advisory lock — returns true if we got it, false if another
    // connection holds it. postgres-js (see src/db/index.ts) returns rows as a plain array;
    // we defensively handle the alternative node-pg `{ rows: [...] }` envelope so a driver
    // swap won't silently break.
    const lockResult = await db.execute(sql`SELECT pg_try_advisory_lock(${LOCK_ID_OUTREACH_PROCESSOR}) AS acquired`)
    const acquired = Array.isArray(lockResult)
        ? (lockResult as unknown as Array<{ acquired: boolean }>)[0]?.acquired === true
        : (lockResult as unknown as { rows: Array<{ acquired: boolean }> }).rows?.[0]?.acquired === true
    if (!acquired) {
        console.log('[processOutreachSequences] advisory lock held by another instance — skipping tick')
        return { acquired: false }
    }
    try {
        const result = await processOutreachSequences()
        return { acquired: true, result }
    } finally {
        await db.execute(sql`SELECT pg_advisory_unlock(${LOCK_ID_OUTREACH_PROCESSOR})`)
    }
}

export async function markCompletedCampaigns(): Promise<void> {
    // Find all active campaigns that have zero incomplete leads
    // Using a NOT EXISTS subquery — single query instead of N queries
    const completedCampaigns = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(
            and(
                eq(campaigns.status, 'active'),
                sql`NOT EXISTS (
                    SELECT 1 FROM campaign_leads
                    WHERE campaign_leads.campaign_id = ${campaigns.id}
                    AND campaign_leads.status NOT IN ('replied', 'bounced', 'unsubscribed')
                )`
            )
        )

    if (completedCampaigns.length === 0) return

    await db.update(campaigns)
        .set({
            status: 'completed',
            completedAt: new Date()
        })
        .where(inArray(campaigns.id, completedCampaigns.map(c => c.id)))

    console.log(`[markCompletedCampaigns] Marked ${completedCampaigns.length} campaigns as completed`)
}
