import cron from 'node-cron'
import { processQueue } from './processQueue'
import { processHeldMessages } from './processHeld'
import { cleanupOldMessages } from './cleanupMessages'
import { processOutreachSequences, resetDailyLimits } from './processOutreachSequences'
import { processReplies } from './processReplies'
import { processBounces } from './processBounces'

let isSequenceProcessing = false

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

    // Process outreach sequences every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        if (isSequenceProcessing) {
            console.log('[jobs] processOutreachSequences already running, skipping tick')
            return
        }
        isSequenceProcessing = true
        processOutreachSequences()
            .catch((err) => console.error('[jobs] processOutreachSequences failed:', err))
            .finally(() => { isSequenceProcessing = false })
    })

    // Reset daily limits at midnight
    cron.schedule('0 0 * * *', () => {
        resetDailyLimits().catch((err) => console.error('[jobs] resetDailyLimits failed:', err))
    })

    // Process replies every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        processReplies().catch((err) => console.error('[jobs] processReplies failed:', err))
    })

    // Process bounces every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        processBounces().catch((err) => console.error('[jobs] processBounces failed:', err))
    })

    console.log('[jobs] Scheduled: processQueue (1min), processHeld (5min), cleanup (daily 3am), outreach (5min), resetLimits (daily midnight), replies (15min), bounces (30min)')
}
