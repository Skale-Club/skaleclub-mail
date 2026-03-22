import { syncAllMailboxes } from './lib/mail-sync'

const SYNC_INTERVAL = 5 * 60 * 1000

export function startSyncWorker() {
    setInterval(async () => {
        try {
            console.log(`[${new Date().toISOString()}] Running mailbox sync...`)
            const results = await syncAllMailboxes()
            console.log(`[${new Date().toISOString()}] Sync completed: ${results.length} mailboxes processed`)
        } catch (error) {
            console.error('Sync worker error:', error)
        }
    }, SYNC_INTERVAL)

    console.log(`Mail sync worker started (interval: ${SYNC_INTERVAL / 1000}s)`)
}

