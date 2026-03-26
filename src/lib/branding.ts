import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './api-client'

export interface BrandingSettings {
    companyName: string
    applicationName: string
    logoUrl: string
    faviconUrl: string
    mailHost: string
}

export const defaultBranding: BrandingSettings = {
    companyName: '',
    applicationName: 'Mail Platform',
    logoUrl: '/brand-mark.svg',
    faviconUrl: '/favicon.svg',
    mailHost: 'mx.skaleclub.com',
}

function normalizeBranding(payload: Partial<BrandingSettings> | null | undefined): BrandingSettings {
    return {
        companyName: payload?.companyName || defaultBranding.companyName,
        applicationName: payload?.applicationName || defaultBranding.applicationName,
        logoUrl: payload?.logoUrl || defaultBranding.logoUrl,
        faviconUrl: payload?.faviconUrl || defaultBranding.faviconUrl,
        mailHost: payload?.mailHost || defaultBranding.mailHost,
    }
}

export async function fetchBranding(): Promise<BrandingSettings> {
    const payload = await apiFetch<Partial<BrandingSettings>>('/api/system/branding', { auth: false })
    return normalizeBranding(payload)
}

export function useBranding() {
    const query = useQuery({
        queryKey: ['system-branding'],
        queryFn: fetchBranding,
        staleTime: 5 * 60 * 1000,
    })

    return {
        ...query,
        branding: query.data || defaultBranding,
    }
}
