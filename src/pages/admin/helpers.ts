export { apiFetch } from '../../lib/api'
import { apiFetch } from '../../lib/api'

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
