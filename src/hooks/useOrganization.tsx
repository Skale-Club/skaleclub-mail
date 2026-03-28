import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiFetch } from '../lib/api-client'

interface Organization {
    id: string
    name: string
    role: string
}

interface OrganizationContextValue {
    organizations: Organization[]
    currentOrganization: Organization | null
    setCurrentOrganization: (org: Organization | null) => void
    isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextValue>({
    organizations: [],
    currentOrganization: null,
    setCurrentOrganization: () => {},
    isLoading: true,
})

const STORAGE_KEY = 'skale_outreach_org'

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void loadOrganizations()
    }, [])

    async function loadOrganizations() {
        try {
            const data = await apiFetch<{ organizations: Organization[] }>('/api/users/organizations')
            const orgs = data.organizations || []
            setOrganizations(orgs)

            // Restore from localStorage
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    const storedOrg = JSON.parse(stored) as Organization
                    // Verify the stored org still exists in the list
                    if (orgs.some(o => o.id === storedOrg.id)) {
                        setCurrentOrganizationState(storedOrg)
                    } else {
                        // Clear invalid stored org
                        localStorage.removeItem(STORAGE_KEY)
                    }
                } catch {
                    localStorage.removeItem(STORAGE_KEY)
                }
            } else if (orgs.length > 0) {
                // Default to first organization
                setCurrentOrganizationState(orgs[0])
            }
        } catch (error) {
            console.error('Error loading organizations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    function setCurrentOrganization(org: Organization | null) {
        setCurrentOrganizationState(org)
        if (org) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(org))
        } else {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    return (
        <OrganizationContext.Provider
            value={{
                organizations,
                currentOrganization,
                setCurrentOrganization,
                isLoading,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    return useContext(OrganizationContext)
}