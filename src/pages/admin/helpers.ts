import { supabase } from '../../lib/supabase'

export interface OrganizationOption {
    id: string
    name: string
    slug: string
}

export interface DomainOption {
    id: string
    organizationId: string
    name: string
    verificationStatus: 'pending' | 'verified' | 'failed'
}

export async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getAccessToken()
    const response = await fetch(path, {
        cache: 'no-store',
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(init.headers || {}),
        },
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

    if (!response.ok) {
        const message =
            typeof payload === 'object' && payload && 'error' in payload
                ? String(payload.error)
                : response.statusText
        throw new Error(message || 'Request failed')
    }

    return payload as T
}

export async function loadOrganizations() {
    const data = await apiFetch<{ organizations: OrganizationOption[] }>('/api/organizations')
    return data.organizations || []
}

export async function loadDomains(organizationId?: string) {
    const params = organizationId ? `?organizationId=${organizationId}` : ''
    const data = await apiFetch<{ domains: DomainOption[] }>(`/api/domains${params}`)
    return data.domains || []
}

export function matchesSearch(value: string, query: string) {
    return value.toLowerCase().includes(query.trim().toLowerCase())
}
