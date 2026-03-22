import cron from 'node-cron'
import { processQueue } from './processQueue'
import { processHeldMessages } from './processHeld'
import { cleanupOldMessages } from './cleanupMessages'

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

    console.log('[jobs] Scheduled: processQueue (1min), processHeld (5min), cleanup (daily 3am)')
}
