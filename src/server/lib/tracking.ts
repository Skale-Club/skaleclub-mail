import { createHmac } from 'crypto'
import { db } from '../../db'
import { webhooks, webhookRequests, statistics } from '../../db/schema'
import { eq, and, sql } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// HTML injection
// ---------------------------------------------------------------------------

/**
 * Rewrites an HTML email body to add open-tracking pixel and/or click-tracking
 * redirects. Safe to call even if both flags are false.
 */
export function injectTracking(
    html: string,
    token: string,
    baseUrl: string,
    trackOpens: boolean,
    trackClicks: boolean
): string {
    let result = html

    if (trackClicks) {
        // Rewrite every href="http(s)://..." to go through the click endpoint.
        // We base64url-encode the original URL so no DB lookup is needed on click.
        result = result.replace(
            /href="(https?:\/\/[^"#][^"]*?)"/gi,
            (_, url: string) => {
                const encoded = Buffer.from(url).toString('base64url')
                return `href="${baseUrl}/t/click/${token}?u=${encoded}"`
            }
        )
    }

    if (trackOpens) {
        const pixel =
            `<img src="${baseUrl}/t/open/${token}" ` +
            `width="1" height="1" alt="" ` +
            `style="display:none!important;width:1px!important;height:1px!important" />`

        if (/<\/body>/i.test(result)) {
            result = result.replace(/<\/body>/i, `${pixel}</body>`)
        } else {
            result += pixel
        }
    }

    return result
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

const STAT_COLUMNS = {
    messagesOpened:    'messages_opened',
    linksClicked:      'links_clicked',
    messagesSent:      'messages_sent',
    messagesDelivered: 'messages_delivered',
    messagesBounced:   'messages_bounced',
    messagesHeld:      'messages_held',
    messagesIncoming:  'messages_incoming',
} as const

export type StatField = keyof typeof STAT_COLUMNS

/**
 * Upserts one row per (server_id, today) and increments the given counter.
 * Failures are swallowed — stats are best-effort.
 */
export async function incrementStat(serverId: string, field: StatField): Promise<void> {
    const col = STAT_COLUMNS[field]
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
        await db.execute(sql`
            INSERT INTO statistics (id, server_id, date, ${sql.raw(col)})
            VALUES (gen_random_uuid(), ${serverId}, ${today}, 1)
            ON CONFLICT (server_id, date)
            DO UPDATE SET ${sql.raw(col)} = statistics.${sql.raw(col)} + 1
        `)
    } catch (err) {
        console.error('incrementStat error:', err)
    }
}

// ---------------------------------------------------------------------------
// Webhook dispatcher
// ---------------------------------------------------------------------------

type WebhookEvent =
    | 'message_sent'
    | 'message_delivered'
    | 'message_bounced'
    | 'message_held'
    | 'message_opened'
    | 'link_clicked'
    | 'domain_verified'
    | 'spam_alert'

/**
 * Fires all active webhooks subscribed to the given event for a server.
 * Signs the payload with HMAC-SHA256 when a secret is configured.
 * Logs every attempt to webhook_requests.
 * Errors are swallowed so tracking never blocks the response.
 */
export async function fireWebhooks(
    serverId: string,
    event: WebhookEvent,
    data: Record<string, unknown>
): Promise<void> {
    try {
        const allWebhooks = await db.query.webhooks.findMany({
            where: and(
                eq(webhooks.serverId, serverId),
                eq(webhooks.active, true)
            ),
        })

        const matching = allWebhooks.filter((wh) =>
            (wh.events as string[]).includes(event)
        )

        if (matching.length === 0) return

        const payload = {
            event,
            timestamp: new Date().toISOString(),
            serverId,
            data,
        }

        await Promise.allSettled(
            matching.map(async (wh) => {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'X-Webhook-Event': event,
                }

                if (wh.secret) {
                    const sig = createHmac('sha256', wh.secret)
                        .update(JSON.stringify(payload))
                        .digest('hex')
                    headers['X-Webhook-Signature'] = `sha256=${sig}`
                }

                try {
                    const response = await fetch(wh.url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(payload),
                        signal: AbortSignal.timeout(10_000),
                    })

                    const body = await response.text()

                    await db.insert(webhookRequests).values({
                        webhookId: wh.id,
                        event: event as any,
                        payload,
                        responseCode: response.status,
                        responseBody: body.substring(0, 5000),
                        success: response.ok,
                    })
                } catch (err) {
                    await db.insert(webhookRequests).values({
                        webhookId: wh.id,
                        event: event as any,
                        payload,
                        success: false,
                        error: err instanceof Error ? err.message : 'Request failed',
                    })
                }
            })
        )
    } catch (err) {
        console.error('fireWebhooks error:', err)
    }
}
