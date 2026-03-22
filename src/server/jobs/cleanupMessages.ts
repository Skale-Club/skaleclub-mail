import { db } from '../../db'
import { messages, deliveries, servers } from '../../db/schema'
import { eq, lt, and, isNotNull } from 'drizzle-orm'

let running = false

export async function cleanupOldMessages(): Promise<void> {
    if (running) return
    running = true

    try {
        const allServers = await db.query.servers.findMany({
            columns: {
                id: true,
                retentionDays: true,
            },
        })

        let totalDeleted = 0

        for (const server of allServers) {
            const retentionDays = server.retentionDays ?? 30
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - retentionDays)

            // Delete deliveries for old messages first
            const oldMessages = await db.query.messages.findMany({
                where: and(
                    eq(messages.serverId, server.id),
                    lt(messages.createdAt, cutoff)
                ),
                columns: { id: true },
                limit: 500,
            })

            if (oldMessages.length === 0) continue

            const messageIds = oldMessages.map((m) => m.id)

            for (const msgId of messageIds) {
                await db.delete(deliveries).where(eq(deliveries.messageId, msgId))
            }

            for (const msgId of messageIds) {
                await db.delete(messages).where(eq(messages.id, msgId))
            }

            totalDeleted += oldMessages.length
        }

        if (totalDeleted > 0) {
            console.log(`[cleanup] Deleted ${totalDeleted} old messages`)
        }
    } catch (err) {
        console.error('[cleanup] Error:', err)
    } finally {
        running = false
    }
}
