import { db } from '../../db'
import { messages, deliveries, organizations } from '../../db/schema'
import { eq } from 'drizzle-orm'

let running = false

export async function cleanupOldMessages(): Promise<void> {
    if (running) return
    running = true

    try {
        const allOrganizations = await db.select({ id: organizations.id }).from(organizations)

        let totalDeleted = 0

        for (const org of allOrganizations) {
            const oldMessages = await db
                .select({ id: messages.id })
                .from(messages)
                .where(eq(messages.organizationId, org.id))

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
