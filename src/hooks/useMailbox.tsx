import React from 'react'
import { apiFetch } from '../lib/api-client'
import { useAuth } from './useAuth'

export interface Mailbox {
    id: string
    email: string
    displayName: string | null
    isDefault: boolean
    isActive: boolean
    isNative?: boolean
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
    const { user, isAdmin, isLoading: authLoading } = useAuth()
    const [mailboxes, setMailboxes] = React.useState<Mailbox[]>([])
    const [selectedMailbox, setSelectedMailbox] = React.useState<Mailbox | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    const refreshMailboxes = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ mailboxes: Mailbox[] }>('/api/mail/mailboxes')
            const fetchedMailboxes = data.mailboxes || []

            const savedId = localStorage.getItem('selectedMailboxId')
            const saved = savedId ? fetchedMailboxes.find((m: Mailbox) => m.id === savedId) : null
            const defaultMailbox = fetchedMailboxes.find((m: Mailbox) => m.isDefault)
            const selected = saved || defaultMailbox || fetchedMailboxes[0] || null

            // Batch state updates together to avoid multiple re-renders
            React.startTransition(() => {
                setMailboxes(fetchedMailboxes)
                setSelectedMailbox(selected)
                setIsLoading(false)
            })
        } catch (error) {
            console.error('Error fetching mailboxes:', error)
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        if (authLoading) return
        if (!user || isAdmin !== false) {
            React.startTransition(() => {
                setMailboxes([])
                setSelectedMailbox(null)
                setIsLoading(false)
            })
            return
        }
        refreshMailboxes()
    }, [user, isAdmin, authLoading, refreshMailboxes])

    const handleSetSelectedMailbox = React.useCallback((mailbox: Mailbox | null) => {
        setSelectedMailbox(mailbox)
        if (mailbox) {
            localStorage.setItem('selectedMailboxId', mailbox.id)
        } else {
            localStorage.removeItem('selectedMailboxId')
        }
    }, [])

    const contextValue = React.useMemo(() => ({
        mailboxes,
        selectedMailbox,
        setSelectedMailbox: handleSetSelectedMailbox,
        isLoading,
        refreshMailboxes
    }), [mailboxes, selectedMailbox, handleSetSelectedMailbox, isLoading, refreshMailboxes])

    return (
        <MailboxContext.Provider value={contextValue}>
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
