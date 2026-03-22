import { supabase } from '../../lib/supabase'

export interface OrganizationOption {
    id: string
    name: string
    slug: string
}

export interface ServerOption {
    id: string
    name: string
    slug: string
    organizationId: string
    organizationName: string
    sendMode: string
}

export async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getAccessToken()
    const response = await fetch(path, {
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

export async function loadServersForOrganizations(orgs: OrganizationOption[]) {
    const serverLists = await Promise.all(
        orgs.map(async (org) => {
            const data = await apiFetch<{ servers: Array<{
                id: string
                name: string
                slug: string
                organizationId: string
                sendMode: string
            }> }>(`/api/servers?organizationId=${org.id}`)

            return (data.servers || []).map((server) => ({
                ...server,
                organizationName: org.name,
            }))
        })
    )

    return serverLists.flat() satisfies ServerOption[]
}

export function matchesSearch(value: string, query: string) {
    return value.toLowerCase().includes(query.trim().toLowerCase())
}
