import { syncMailbox } from './lib/mail-sync'

const SYNC_INTERVAL = 5 * 60 * 1000

export function startSyncWorker() {
    setInterval(async () => {
        try {
            console.log(`[${new Date().toISOString()}] Running mailbox sync...`)
            await syncAllMailboxes()
            console.log(`[${new Date().toISOString()}] Sync completed`)
        } catch (error) {
            console.error('Sync worker error:', error)
        }
    }, SYNC_INTERVAL)

    console.log(`Mail sync worker started (interval: ${SYNC_INTERVAL / 1000}s)`)
}

async function syncAllMailboxes() {
    const { db } = await import('../db')
    const { mailboxes } = await import('../db/schema')

    const allMailboxes = await db.select().from(mailboxes)

    const results = await Promise.allSettled(
        allMailboxes.map(mailbox => syncMailbox(mailbox.id))
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`Synced ${succeeded}/${allMailboxes.length} mailboxes (failed: ${failed})`)

    if (failed > 0) {
        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`Mailbox ${allMailboxes[i].id} sync failed:`, r.reason)
            }
        })
    }
}

startSyncWorker()
