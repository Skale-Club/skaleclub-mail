import React from 'react'
import { Link, useLocation } from 'wouter'
import { useBranding } from '../../lib/branding'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import {
    useMessages,
    useUpdateMessage,
    useDeleteMessage,
    useArchiveMessage,
    useBatchUpdate,
    useSyncMailbox,
    mapMessageToEmailItem
} from '../../hooks/useMail'
import { createMockInboxEmails } from '../../lib/mock-data'
import { Inbox as InboxIcon, AlertCircle } from 'lucide-react'

export default function InboxPage() {
    const { branding } = useBranding()
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()
    const isMobile = useIsMobile()
    const [, navigate] = useLocation()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())

    const { data, isLoading, isFetching, refetch } = useMessages('inbox', 1, 50)
    const updateMessage = useUpdateMessage()
    const deleteMessage = useDeleteMessage()
    const archiveMessage = useArchiveMessage()
    const batchUpdate = useBatchUpdate()
    const syncMailbox = useSyncMailbox()

    const mockEmails = React.useMemo(
        () => createMockInboxEmails(branding.applicationName, branding.companyName),
        [branding.applicationName, branding.companyName]
    )

    const emails = React.useMemo(() => {
        if (!selectedMailbox || !data?.messages) {
            return mockEmails
        }
        return data.messages.map(mapMessageToEmailItem)
    }, [selectedMailbox, data, mockEmails])

    const unreadCount = React.useMemo(() => emails.filter(email => !email.read).length, [emails])

    const currentIndex = React.useMemo(() => {
        if (!selectedEmail) return -1
        return emails.findIndex(email => email.id === selectedEmail)
    }, [emails, selectedEmail])

    const handleRefresh = async () => {
        if (selectedMailbox) {
            syncMailbox.mutate()
        } else {
            refetch()
        }
        toast({ title: 'Inbox refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            window.location.href = `/mail/inbox/${id}`
            return
        }
        setSelectedEmail(id)

        if (selectedMailbox) {
            const email = emails.find(email => email.id === id)
            if (email && !email.read) {
                updateMessage.mutate({ messageId: id, data: { read: true } })
            }
        }
    }

    const handleNavigate = (direction: 'up' | 'down') => {
        if (emails.length === 0) return
        
        let newIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1
        newIndex = Math.max(0, Math.min(emails.length - 1, newIndex))
        
        if (emails[newIndex]) {
            handleSelectEmail(emails[newIndex].id)
        }
    }

    const handleStar = (id: string) => {
        if (selectedMailbox) {
            const email = emails.find(email => email.id === id)
            updateMessage.mutate({ messageId: id, data: { starred: !email?.starred } })
        }
        toast({
            title: emails.find(email => email.id === id)?.starred ? 'Removed from starred' : 'Added to starred',
            variant: 'success'
        })
    }

    const handleStarSelected = () => {
        if (selectedEmail) {
            handleStar(selectedEmail)
        }
    }

    const handleDelete = (id: string) => {
        if (selectedMailbox) {
            deleteMessage.mutate(id)
        }
        setSelectedEmails(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        toast({ title: 'Email moved to trash', variant: 'success' })
    }

    const handleDeleteSelected = () => {
        if (selectedEmails.size > 0) {
            handleBulkDelete()
        } else if (selectedEmail) {
            handleDelete(selectedEmail)
            const nextIndex = Math.min(currentIndex, emails.length - 2)
            if (nextIndex >= 0 && emails[nextIndex]) {
                setSelectedEmail(emails[nextIndex].id)
            }
        }
    }

    const handleArchive = (id: string) => {
        if (selectedMailbox) {
            archiveMessage.mutate(id)
        }
        setSelectedEmails(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        toast({ title: 'Email archived', variant: 'success' })
    }

    const handleArchiveSelected = () => {
        if (selectedEmails.size > 0) {
            handleBulkArchive()
        } else if (selectedEmail) {
            handleArchive(selectedEmail)
            const nextIndex = Math.min(currentIndex, emails.length - 2)
            if (nextIndex >= 0 && emails[nextIndex]) {
                setSelectedEmail(emails[nextIndex].id)
            }
        }
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} emails deleted`, variant: 'success' })
    }

    const handleBulkArchive = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'archive' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} emails archived`, variant: 'success' })
    }

    const handleBulkRead = (read: boolean) => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: read ? 'read' : 'unread' })
        }
        setSelectedEmails(new Set())
    }

    const handleMarkReadSelected = () => {
        if (selectedEmails.size > 0) {
            handleBulkRead(true)
        } else if (selectedEmail) {
            const email = emails.find(e => e.id === selectedEmail)
            if (email && !email.read) {
                updateMessage.mutate({ messageId: selectedEmail, data: { read: true } })
            }
        }
    }

    const handleToggleSelect = () => {
        if (selectedEmail) {
            setSelectedEmails(prev => {
                const newSet = new Set(prev)
                if (newSet.has(selectedEmail)) {
                    newSet.delete(selectedEmail)
                } else {
                    newSet.add(selectedEmail)
                }
                return newSet
            })
        }
    }

    useKeyboardShortcuts({
        enabled: true,
        onNavigate: handleNavigate,
        onReply: () => selectedEmail && navigate(`/mail/compose?reply=${selectedEmail}`),
        onReplyAll: () => selectedEmail && navigate(`/mail/compose?reply=${selectedEmail}&replyAll=true`),
        onForward: () => selectedEmail && navigate(`/mail/compose?forward=${selectedEmail}`),
        onArchive: handleArchiveSelected,
        onDelete: handleDeleteSelected,
        onStar: handleStarSelected,
        onMarkRead: handleMarkReadSelected,
        onRefresh: handleRefresh,
        onCompose: () => navigate('/mail/compose'),
        onSelect: handleToggleSelect,
        onSelectAll: () => setSelectedEmails(new Set(emails.map(email => email.id))),
        onDeselectAll: () => setSelectedEmails(new Set()),
        onEscape: () => {
            setSelectedEmail(null)
            setSelectedEmails(new Set())
        }
    })

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading inbox..." />
            </MailLayout>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No Email Accounts Connected
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Add an email account to start sending and receiving emails.
                        </p>
                        <Link
                            href="/mail/settings"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Add Email Account
                        </Link>
                    </div>
                </div>
            </MailLayout>
        )
    }

    return (
        <MailLayout>
            <div className="flex h-full">
                <div className={`w-full ${!isMobile ? 'lg:w-1/2 xl:w-2/5 border-r border-gray-200 dark:border-gray-800' : ''} flex flex-col bg-white dark:bg-slate-900`}>
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <InboxIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700">?</kbd>
                                <span>shortcuts</span>
                            </div>
                        </div>
                    </div>

                    <EmailToolbar
                        selectedCount={selectedEmails.size}
                        totalCount={data?.total}
                        onSelectAll={() => {
                            if (selectedEmails.size === emails.length) {
                                setSelectedEmails(new Set())
                            } else {
                                setSelectedEmails(new Set(emails.map(email => email.id)))
                            }
                        }}
                        onMarkRead={() => handleBulkRead(true)}
                        onMarkUnread={() => handleBulkRead(false)}
                        onDelete={handleBulkDelete}
                        onArchive={handleBulkArchive}
                        onRefresh={handleRefresh}
                        isRefreshing={isFetching || syncMailbox.isPending}
                    />

                    <div className="flex-1 overflow-y-auto">
                        <EmailList
                            emails={emails}
                            selectedId={selectedEmail || undefined}
                            selectedEmails={selectedEmails}
                            onSelect={handleSelectEmail}
                            onSelectMultiple={(ids) => setSelectedEmails(new Set(ids))}
                            onStar={handleStar}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            emptyMessage="No emails in inbox"
                        />
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                        {selectedEmail ? (
                            <EmailDetail email={emails.find(email => email.id === selectedEmail)!} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                        <InboxIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium">Select an email to read</p>
                                    <p className="text-sm mt-1">Click on an email from the list to view its contents</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MailLayout>
    )
}

function EmailDetail({ email }: { email: EmailItem }) {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {email.subject}
                    </h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {email.from.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {email.from.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {email.from.email}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {email.date.toLocaleString()}
                                </p>
                            </div>
                            <div className="mt-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    To: {email.to.map(t => t.name || t.email).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {email.labels && email.labels.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 mb-6">
                            {email.labels.map(label => (
                                <span
                                    key={label}
                                    className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none mt-6">
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {email.snippet}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/mail/compose?reply=${email.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Reply
                            </Link>
                            <Link
                                href={`/mail/compose?reply=${email.id}&replyAll=true`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Reply All
                            </Link>
                            <Link
                                href={`/mail/compose?forward=${email.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Forward
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
