import cron from 'node-cron'
import { processQueue } from './processQueue'
import { processHeldMessages } from './processHeld'
import { cleanupOldMessages } from './cleanupMessages'
import { runOutreachProcessorWithLock, resetDailyLimits } from './processOutreachSequences'
import { processReplies } from './processReplies'
import { processBounces } from './processBounces'

// P0-06: the previous in-memory mutex was removed in plan 14-06. It only protected
// within a single Node process; multi-instance deploys (blue-green overlap, future
// horizontal scale) could still double-send. The DB-level lock now lives inside
// runOutreachProcessorWithLock — see processOutreachSequences.ts.
//
// TODO(phase-15): also wrap processReplies and processBounces in advisory locks
//   (LOCK_ID_REPLY_PROCESSOR = 4016 / LOCK_ID_BOUNCE_PROCESSOR = 4015 — same pattern
//   as outreach). Lower priority because both jobs are already idempotent at the
//   per-message level.

export function startJobs(): void {
    console.log('[jobs] Starting background job scheduler...')

    // Process email queue every minute
    cron.schedule('* * * * *', () => {
        processQueue().catch((err) => console.error('[jobs] processQueue failed:', err))
    })

    // Process expired held messages every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        processHeldMessages().catch((err) => console.error('[jobs] processHeld failed:', err))
    })

    // Cleanup old messages daily at 3 AM
    cron.schedule('0 3 * * *', () => {
        cleanupOldMessages().catch((err) => console.error('[jobs] cleanup failed:', err))
    })

    // Process outreach sequences every 5 minutes (advisory-locked at the DB layer)
    cron.schedule('*/5 * * * *', () => {
        runOutreachProcessorWithLock()
            .catch((err) => console.error('[jobs] processOutreachSequences failed:', err))
    })

    // Phase 16 — INBOX-THROTTLE: reset per-account daily send counter at midnight UTC.
    // Explicit timezone option pins the schedule to UTC independently of container TZ env
    // (today alpine defaults to UTC, but pinning here prevents silent breakage if TZ is
    // set by a future ops change). Pair with processOutreachSequences.resetDailyLimits.
    cron.schedule('0 0 * * *', () => {
        resetDailyLimits().catch((err) => console.error('[jobs] resetDailyLimits failed:', err))
    }, { timezone: 'UTC' })

    // Process replies every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        processReplies().catch((err) => console.error('[jobs] processReplies failed:', err))
    })

    // Process bounces every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        processBounces().catch((err) => console.error('[jobs] processBounces failed:', err))
    })

    console.log('[jobs] Scheduled: processQueue (1min), processHeld (5min), cleanup (daily 3am), outreach (5min), resetLimits (daily midnight UTC), replies (15min), bounces (30min)')
}
