import { db } from '../../db'
import { messages } from '../../db/schema'
import { eq, and, lt, isNotNull, inArray } from 'drizzle-orm'

let running = false

export async function processHeldMessages(): Promise<void> {
    if (running) return
    running = true

    try {
        const now = new Date()

        const heldMessages = await db.query.messages.findMany({
            where: and(
                eq(messages.held, true),
                isNotNull(messages.holdExpiry),
                lt(messages.holdExpiry, now)
            ),
            limit: 100,
        })

        if (heldMessages.length > 0) {
            await db.update(messages)
                .set({
                    held: false,
                    holdExpiry: null,
                    heldReason: null,
                    status: 'queued',
                    updatedAt: now,
                })
                .where(inArray(messages.id, heldMessages.map(m => m.id)))
        }

        if (heldMessages.length > 0) {
            console.log(`[processHeld] Released ${heldMessages.length} expired held messages`)
        }
    } catch (err) {
        console.error('[processHeld] Error:', err)
    } finally {
        running = false
    }
}
