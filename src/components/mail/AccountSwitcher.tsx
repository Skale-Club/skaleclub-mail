import React from 'react'
import { Link } from 'wouter'
import { useMailbox, getProviderColor, getProviderIcon, Mailbox } from '../../hooks/useMailbox'
import { Plus, Check, AlertCircle, ChevronDown, Mail, RefreshCw, Settings, LogOut, Copy } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface AccountSwitcherProps {
    compact?: boolean
    showSignOut?: boolean
    onSignOut?: () => void
}

export function AccountSwitcher({ compact = false, showSignOut = false, onSignOut }: AccountSwitcherProps) {
    const { user } = useAuth()
    const { mailboxes, selectedMailbox, setSelectedMailbox, isLoading, refreshMailboxes } = useMailbox()
    const [isOpen, setIsOpen] = React.useState(false)

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

    const userInitial = user?.user_metadata?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
    const userName = user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'User'

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 rounded-xl transition-colors
                    ${showSignOut
                        ? 'px-2 sm:px-3 py-2 hover:bg-accent'
                        : compact
                            ? 'p-2 hover:bg-accent w-full'
                            : 'px-3 py-2 bg-accent/50 hover:bg-accent w-full'
                    }
                `}
            >
                {showSignOut ? (
                    <>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                            {userInitial}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-foreground">
                            {userName}
                        </span>
                    </>
                ) : selectedMailbox ? (
                    <>
                        <div className={`w-8 h-8 rounded-full ${getProviderColor(selectedMailbox.provider)} flex items-center justify-center text-white text-sm font-bold`}>
                            {getProviderIcon(selectedMailbox.provider)}
                        </div>
                        {!compact && (
                            <>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                                        {selectedMailbox.displayName || selectedMailbox.email?.split('@')[0]}
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
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''} hidden sm:block`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 z-50 bg-popover border border-border rounded-xl shadow-xl pb-2 mt-2 w-72 overflow-hidden flex flex-col">
                        <div className="max-h-64 overflow-y-auto">
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

                        <div className="border-t border-border pt-2 px-2 space-y-1">
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

                        {showSignOut && onSignOut && (
                            <div className="border-t border-border mt-2 pt-2 px-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        onSignOut()
                                    }}
                                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
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
    const [copied, setCopied] = React.useState(false)

    return (
        <button
            onClick={onSelect}
            className={`
                flex items-center gap-3 w-full px-3 py-2.5 first:pt-4 last:pb-3 text-left transition-colors hover:bg-accent/50
            `}
        >
            <div className={`w-9 h-9 rounded-full ${getProviderColor(mailbox.provider)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {getProviderIcon(mailbox.provider)}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                        {mailbox.displayName || mailbox.email?.split('@')[0]}
                    </span>
                    {mailbox.isDefault && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                            Default
                        </span>
                    )}
                    {mailbox.syncError && (
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation()
                        if (mailbox.email) {
                            navigator.clipboard.writeText(mailbox.email)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                        }
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-copy group w-max"
                    title="Copy email"
                >
                    <span className="truncate">{mailbox.email}</span>
                    {copied ? (
                        <Check className="w-3 h-3 text-green-500 animate-in zoom-in" />
                    ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
