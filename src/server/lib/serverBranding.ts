import { db } from '../../db'
import { systemBranding } from '../../db/schema'
import { eq } from 'drizzle-orm'

const BRAND_ID = 'default'

export async function readBranding() {
    const row = await db.query.systemBranding.findFirst({
        where: eq(systemBranding.id, BRAND_ID),
    })
    return {
        companyName: row?.companyName ?? process.env.APP_COMPANY_NAME ?? '',
        applicationName: row?.applicationName ?? process.env.APP_APPLICATION_NAME ?? '',
        logoStorage: row?.logoStorage ?? null,
        faviconStorage: row?.faviconStorage ?? null,
        mailHost: row?.mailHost ?? process.env.MAIL_HOST ?? 'mx.skaleclub.com',
    }
}

// In-memory cache used by long-running server processes (e.g. IMAP greeting)
let _cache: { companyName: string; applicationName: string } | null = null

export async function getCachedBranding() {
    if (!_cache) {
        const b = await readBranding()
        _cache = { companyName: b.companyName, applicationName: b.applicationName }
        setTimeout(() => { _cache = null }, 10 * 60 * 1000).unref()
    }
    return _cache
}

export function clearBrandingCache() {
    _cache = null
}
