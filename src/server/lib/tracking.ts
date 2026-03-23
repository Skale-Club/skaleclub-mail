import { createHmac } from 'crypto'
import { db } from '../../db'
import { webhooks, webhookRequests, statistics } from '../../db/schema'
import { eq, and, sql } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// HTML injection
// ---------------------------------------------------------------------------

const SKIP_PROTOCOLS = ['javascript:', 'mailto:', 'tel:', 'data:']

function shouldSkipUrl(url: string): boolean {
    const lower = url.toLowerCase().trim()

    if (SKIP_PROTOCOLS.some((p) => lower.startsWith(p))) return true
    if (lower.startsWith('#')) return true
    if (/\{\{.*?\}\}/.test(url)) return true

    return false
}

function encodeTrackingUrl(url: string, baseUrl: string, token: string): string {
    const encoded = Buffer.from(url).toString('base64url')
    return `${baseUrl}/t/click/${token}?u=${encoded}`
}

export function rewriteLinks(html: string, baseUrl: string, token: string): string {
    const hrefRegex = /href\s*=\s*(["'])([^"']*?)\1|href\s*=\s*([^\s>]+)/gi

    return html.replace(hrefRegex, (match, quote: string | undefined, quotedUrl: string | undefined, unquotedUrl: string | undefined) => {
        const url = quotedUrl ?? unquotedUrl

        if (!url) return match

        if (shouldSkipUrl(url)) return match

        const trimmed = url.trim()
        if (!/^https?:\/\//i.test(trimmed)) return match

        const trackingUrl = encodeTrackingUrl(trimmed, baseUrl, token)

        if (quote) {
            return `href=${quote}${trackingUrl}${quote}`
        }
        return `href="${trackingUrl}"`
    })
}

export function injectTrackingPixel(html: string, token: string, baseUrl: string): string {
    const pixel =
        `<img src="${baseUrl}/t/open/${token}" ` +
        `width="1" height="1" alt="" ` +
        `style="display:none!important;width:1px!important;height:1px!important" />`

    if (/<\/body>/i.test(html)) {
        return html.replace(/<\/body>/i, `${pixel}</body>`)
    }
    return html + pixel
}

export function injectTracking(
    html: string,
    token: string,
    baseUrl: string,
    trackOpens: boolean,
    trackClicks: boolean
): string {
    let result = html

    if (trackClicks) {
        result = rewriteLinks(result, baseUrl, token)
    }

    if (trackOpens) {
        result = injectTrackingPixel(result, token, baseUrl)
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
    | 'test'

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
