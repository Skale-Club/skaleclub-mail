import React from 'react'
import { Link } from 'wouter'
import { useMailbox, getProviderColor, getProviderIcon, Mailbox } from '../../hooks/useMailbox'
import { useIsMobile } from '../../hooks/useIsMobile'
import { Plus, Check, AlertCircle, ChevronDown, Mail, RefreshCw, Settings } from 'lucide-react'

interface AccountSwitcherProps {
    compact?: boolean
}

export function AccountSwitcher({ compact = false }: AccountSwitcherProps) {
    const { mailboxes, selectedMailbox, setSelectedMailbox, isLoading, refreshMailboxes } = useMailbox()
    const [isOpen, setIsOpen] = React.useState(false)
    const isMobile = useIsMobile()

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                {!compact && <div className="w-24 h-4 bg-muted rounded" />}
            </div>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <Link
                href="/mail/settings"
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Add Account</span>
            </Link>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 rounded-xl transition-colors
                    ${compact 
                        ? 'p-2 hover:bg-accent' 
                        : 'px-3 py-2 bg-accent/50 hover:bg-accent'
                    }
                `}
            >
                {selectedMailbox ? (
                    <>
                        <div className={`w-8 h-8 rounded-full ${getProviderColor(selectedMailbox.provider)} flex items-center justify-center text-white text-sm font-bold`}>
                            {getProviderIcon(selectedMailbox.provider)}
                        </div>
                        {!compact && (
                            <>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                                        {selectedMailbox.displayName || selectedMailbox.email.split('@')[0]}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                                        {selectedMailbox.email}
                                    </span>
                                </div>
                                {selectedMailbox.unreadCount && selectedMailbox.unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                                        {selectedMailbox.unreadCount > 99 ? '99+' : selectedMailbox.unreadCount}
                                    </span>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`
                        absolute z-50 bg-popover border border-border rounded-xl shadow-xl py-2
                        ${isMobile ? 'left-0 right-0 w-screen max-w-[calc(100vw-2rem)] -translate-x-1/2' : 'right-0 w-72'}
                        mt-2
                    `}>
                        <div className="px-3 py-2 border-b border-border">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Email Accounts
                            </p>
                        </div>

                        <div className="max-h-64 overflow-y-auto py-1">
                            {mailboxes.map((mailbox) => (
                                <AccountItem
                                    key={mailbox.id}
                                    mailbox={mailbox}
                                    isSelected={selectedMailbox?.id === mailbox.id}
                                    onSelect={() => {
                                        setSelectedMailbox(mailbox)
                                        setIsOpen(false)
                                    }}
                                />
                            ))}
                        </div>

                        <div className="border-t border-border pt-2 mt-1 px-2 space-y-1">
                            <button
                                onClick={() => {
                                    refreshMailboxes()
                                    setIsOpen(false)
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Accounts
                            </button>
                            <Link
                                href="/mail/settings"
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Manage Accounts
                            </Link>
                            <Link
                                href="/mail/settings"
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Account
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function AccountItem({ 
    mailbox, 
    isSelected, 
    onSelect 
}: { 
    mailbox: Mailbox
    isSelected: boolean
    onSelect: () => void
}) {
    return (
        <button
            onClick={onSelect}
            className={`
                flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors
                ${isSelected 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent/50'
                }
            `}
        >
            <div className={`w-9 h-9 rounded-full ${getProviderColor(mailbox.provider)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {getProviderIcon(mailbox.provider)}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                        {mailbox.displayName || mailbox.email.split('@')[0]}
                    </span>
                    {mailbox.isDefault && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                            Default
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate">
                        {mailbox.email}
                    </span>
                    {mailbox.syncError && (
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {mailbox.unreadCount && mailbox.unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                        {mailbox.unreadCount > 99 ? '99+' : mailbox.unreadCount}
                    </span>
                )}
                {isSelected && (
                    <Check className="w-4 h-4 text-primary" />
                )}
            </div>
        </button>
    )
}

export function CompactAccountSwitcher() {
    return <AccountSwitcher compact />
}
