import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useDeleteMessage, useBatchUpdate, useSyncMailbox, mapMessageToEmailItem } from '../../hooks/useMail'
import { Archive as ArchiveIcon } from 'lucide-react'

export default function ArchivePage() {
    const isMobile = useIsMobile()
    const [, setLocation] = useLocation()
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())
    const [filter, setFilter] = React.useState<'all' | 'unread' | 'starred' | 'attachments'>('all')

    const { data, isLoading, isFetching, refetch } = useMessages('archive', 1, 200)
    const deleteMessage = useDeleteMessage()
    const batchUpdate = useBatchUpdate()
    const syncMailbox = useSyncMailbox()

    const { emails, unreadCount } = React.useMemo(() => {
        const base = data?.messages ? data.messages.map(mapMessageToEmailItem) : []
        const unread = base.filter(e => !e.read).length
        let filtered = base
        if (filter === 'unread') filtered = base.filter(e => !e.read)
        if (filter === 'starred') filtered = base.filter(e => e.starred)
        if (filter === 'attachments') filtered = base.filter(e => e.hasAttachments)
        return { emails: filtered, unreadCount: unread }
    }, [data, filter])

    const handleRefresh = async () => {
        if (selectedMailbox) {
            syncMailbox.mutate()
        } else {
            refetch()
        }
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            setLocation(`/mail/archive/${id}`)
            return
        }
        setSelectedEmail(id)
    }

    const handleDelete = (id: string) => {
        if (selectedMailbox) {
            deleteMessage.mutate(id)
        }
        if (selectedEmail === id) setSelectedEmail(null)
        toast({ title: 'Message permanently deleted', variant: 'success' })
    }

    const handleMoveToInbox = (id: string) => {
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: [id], action: 'move' })
        }
        if (selectedEmail === id) setSelectedEmail(null)
        toast({ title: 'Moved to Inbox', variant: 'success' })
    }

    const handleEmptyArchive = () => {
        if (selectedMailbox && emails.length > 0) {
            batchUpdate.mutate({ messageIds: emails.map(e => e.id), action: 'delete' })
        }
        setSelectedEmail(null)
        toast({ title: 'Archive cleared', variant: 'success' })
    }

    const handleBulkMoveToInbox = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'move' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} messages moved to Inbox`, variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} messages permanently deleted`, variant: 'success' })
    }

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading archive..." />
            </MailLayout>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <ArchiveIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No Email Accounts Connected</h2>
                        <p className="text-muted-foreground mb-6">Add an email account to view archived messages.</p>
                        <Link
                            href="/mail/settings"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
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
                <div className={`w-full ${!isMobile ? 'lg:w-1/2 xl:w-2/5 border-r border-border' : ''} flex flex-col bg-background`}>
                    <div className="px-4 py-2 border-b border-border bg-background">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArchiveIcon className="w-5 h-5 text-muted-foreground" />
                                <h1 className="text-lg font-bold text-foreground">Archive</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                    <button onClick={() => setFilter('all')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
                                    <button onClick={() => setFilter('unread')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
                                    <button onClick={() => setFilter('starred')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'starred' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Starred</button>
                                    <button onClick={() => setFilter('attachments')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'attachments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Attachments</button>
                                </div>
                                {emails.length > 0 && (
                                    <button
                                        onClick={handleEmptyArchive}
                                        className="px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg font-medium transition-colors"
                                    >
                                        Empty archive
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <EmailToolbar
                        selectedCount={selectedEmails.size}
                        onSelectAll={() => {
                            if (selectedEmails.size === emails.length) {
                                setSelectedEmails(new Set())
                            } else {
                                setSelectedEmails(new Set(emails.map(e => e.id)))
                            }
                        }}
                        totalCount={emails.length}
                        onMarkRead={() => {
                            if (selectedEmails.size === 0) return
                            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'read' })
                            setSelectedEmails(new Set())
                        }}
                        onMarkUnread={() => {
                            if (selectedEmails.size === 0) return
                            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'unread' })
                            setSelectedEmails(new Set())
                        }}
                        onDelete={handleBulkDelete}
                        onArchive={handleBulkMoveToInbox}
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
                            onDelete={handleDelete}
                            onArchive={handleMoveToInbox}
                            emptyMessage={filter === 'unread' ? 'No unread archived messages' : 'No archived messages'}
                        />
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-muted/30">
                        {selectedEmail ? (() => {
                            const email = emails.find(e => e.id === selectedEmail)
                            return (
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4">
                                    <div className="max-w-3xl mx-auto">
                                        <div className="flex items-center gap-3 py-2 border-b border-border mb-3">
                                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs flex-shrink-0">
                                                {email?.from.name?.[0]?.toUpperCase() || email?.from.email?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-foreground truncate">{email?.from.name}</p>
                                                    <p className="text-xs text-muted-foreground flex-shrink-0">{email?.date.toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">To: {email?.to.map(t => t.name || t.email).join(', ')}</p>
                                            </div>
                                        </div>
                                        <h2 className="text-sm font-bold text-foreground mb-3">{email?.subject}</h2>
                                        <div className="flex items-center gap-2 mb-4">
                                            <button
                                                onClick={() => handleMoveToInbox(selectedEmail)}
                                                className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors"
                                            >
                                                Move to Inbox
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedEmail)}
                                                className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg font-medium transition-colors"
                                            >
                                                Delete forever
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )
                        })() : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <ArchiveIcon className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-foreground">Select an archived message</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MailLayout>
    )
}
