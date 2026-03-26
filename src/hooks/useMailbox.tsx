import React from 'react'
import { apiFetch } from '../lib/api'

export interface Mailbox {
    id: string
    email: string
    displayName: string | null
    isDefault: boolean
    isActive: boolean
    lastSyncAt: string | null
    syncError: string | null
    provider?: 'gmail' | 'outlook' | 'yahoo' | 'icloud' | 'custom'
    unreadCount?: number
}

interface MailboxContextType {
    mailboxes: Mailbox[]
    selectedMailbox: Mailbox | null
    setSelectedMailbox: (mailbox: Mailbox | null) => void
    isLoading: boolean
    refreshMailboxes: () => Promise<void>
}

const MailboxContext = React.createContext<MailboxContextType | undefined>(undefined)

export function MailboxProvider({ children }: { children: React.ReactNode }) {
    const [mailboxes, setMailboxes] = React.useState<Mailbox[]>([])
    const [selectedMailbox, setSelectedMailbox] = React.useState<Mailbox | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    const refreshMailboxes = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ mailboxes: Mailbox[] }>('/api/mail/mailboxes')
            const fetchedMailboxes = data.mailboxes || []
            setMailboxes(fetchedMailboxes)

            const savedId = localStorage.getItem('selectedMailboxId')
            const saved = savedId ? fetchedMailboxes.find((m: Mailbox) => m.id === savedId) : null
            const defaultMailbox = fetchedMailboxes.find((m: Mailbox) => m.isDefault)

            setSelectedMailbox(saved || defaultMailbox || fetchedMailboxes[0] || null)
        } catch (error) {
            console.error('Error fetching mailboxes:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        refreshMailboxes()
    }, [refreshMailboxes])

    const handleSetSelectedMailbox = React.useCallback((mailbox: Mailbox | null) => {
        setSelectedMailbox(mailbox)
        if (mailbox) {
            localStorage.setItem('selectedMailboxId', mailbox.id)
        } else {
            localStorage.removeItem('selectedMailboxId')
        }
    }, [])

    return (
        <MailboxContext.Provider value={{
            mailboxes,
            selectedMailbox,
            setSelectedMailbox: handleSetSelectedMailbox,
            isLoading,
            refreshMailboxes
        }}>
            {children}
        </MailboxContext.Provider>
    )
}

export function useMailbox() {
    const context = React.useContext(MailboxContext)
    if (context === undefined) {
        throw new Error('useMailbox must be used within a MailboxProvider')
    }
    return context
}

export function getProviderIcon(provider?: string): string {
    switch (provider) {
        case 'gmail':
            return 'G'
        case 'outlook':
            return 'O'
        case 'yahoo':
            return 'Y'
        case 'icloud':
            return 'i'
        default:
            return '@'
    }
}

export function getProviderColor(provider?: string): string {
    switch (provider) {
        case 'gmail':
            return 'bg-red-500'
        case 'outlook':
            return 'bg-blue-500'
        case 'yahoo':
            return 'bg-purple-500'
        case 'icloud':
            return 'bg-gray-500'
        default:
            return 'bg-gray-600'
    }
}
