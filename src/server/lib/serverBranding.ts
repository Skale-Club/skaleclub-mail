import { db } from '../../db'
import { systemBranding } from '../../db/schema'
import { eq } from 'drizzle-orm'

const BRAND_ID = 'default'

interface BrandingData {
    companyName: string
    applicationName: string
    logoStorage: string | null
    faviconStorage: string | null
    mailHost: string
}

export async function readBranding(): Promise<BrandingData> {
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

let _cache: BrandingData | null = null
let _cacheTimer: ReturnType<typeof setTimeout> | null = null

export async function getCachedBranding(): Promise<BrandingData> {
    if (!_cache) {
        const b = await readBranding()
        _cache = b
        _cacheTimer = setTimeout(() => {
            _cache = null
            _cacheTimer = null
        }, 10 * 60 * 1000)
        _cacheTimer.unref()
    }
    return _cache
}

export function clearBrandingCache() {
    _cache = null
    if (_cacheTimer) {
        clearTimeout(_cacheTimer)
        _cacheTimer = null
    }
}
