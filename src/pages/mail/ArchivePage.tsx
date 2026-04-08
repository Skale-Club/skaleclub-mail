import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { EmailDetailEmpty, EmailDetailView } from '../../components/mail/EmailDetailView'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useDeleteMessage, useBatchUpdate, useSyncMailbox, useUpdateMessage, useSpamMessage, mapMessageToEmailItem } from '../../hooks/useMail'
import { Archive as ArchiveIcon } from 'lucide-react'
import { ResizablePanels } from '../../components/mail/ResizablePanels'

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
    const updateMessage = useUpdateMessage()
    const spamMessage = useSpamMessage()

    const { emails, unreadCount } = React.useMemo(() => {
        const base = data?.messages ? data.messages.map(mapMessageToEmailItem) : []
        const unread = base.filter(e => !e.read).length
        let filtered = base
        if (filter === 'unread') filtered = base.filter(e => !e.read)
        if (filter === 'starred') filtered = base.filter(e => e.starred)
        if (filter === 'attachments') filtered = base.filter(e => e.hasAttachments)
        return { emails: filtered, unreadCount: unread }
    }, [data, filter])

    const selectedEmailData = React.useMemo(
        () => emails.find((email) => email.id === selectedEmail) || null,
        [emails, selectedEmail]
    )

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
        if (selectedEmail === id) setSelectedEmail(null)
        if (selectedMailbox) deleteMessage.mutate(id)
        setSelectedEmails(prev => { const next = new Set(prev); next.delete(id); return next })
        toast({ title: 'Email moved to trash', variant: 'success' })
    }

    const handleMoveToInbox = (id: string) => {
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: [id], action: 'move' })
        }
        if (selectedEmail === id) setSelectedEmail(null)
        setSelectedEmails((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
        toast({ title: 'Moved to Inbox', variant: 'success' })
    }

    const handleToggleRead = (id: string) => {
        const email = emails.find((item) => item.id === id)
        if (!email || !selectedMailbox) return

        updateMessage.mutate({ messageId: id, data: { read: !email.read } })
        toast({
            title: email.read ? 'Marked as unread' : 'Marked as read',
            variant: 'success',
        })
    }

    const handleStar = (id: string) => {
        const email = emails.find((item) => item.id === id)
        if (!email || !selectedMailbox) return

        updateMessage.mutate({ messageId: id, data: { starred: !email.starred } })
        toast({
            title: email.starred ? 'Removed from favorites' : 'Added to favorites',
            variant: 'success',
        })
    }

    const handleSpam = (id: string) => {
        if (selectedEmail === id) setSelectedEmail(null)
        if (selectedMailbox) {
            spamMessage.mutate({ messageId: id, isSpam: true })
        }
        setSelectedEmails((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
        toast({ title: 'Marked as spam', variant: 'success' })
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
        const count = selectedEmails.size
        if (selectedMailbox) batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
        setSelectedEmails(new Set())
        toast({ title: `${count} email${count > 1 ? 's' : ''} moved to trash`, variant: 'success' })
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
            {isMobile ? (
                <div className="flex h-full flex-col bg-background">
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
                            onToggleRead={handleToggleRead}
                            onStar={handleStar}
                            onDelete={handleDelete}
                            onArchive={handleMoveToInbox}
                            onSpam={handleSpam}
                            emptyMessage={filter === 'unread' ? 'No unread archived messages' : 'No archived messages'}
                        />
                    </div>
                </div>
            ) : (
                <ResizablePanels
                    storageKey="mail-panels-archive"
                    left={
                        <>
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
                                    onToggleRead={handleToggleRead}
                                    onStar={handleStar}
                                    onDelete={handleDelete}
                                    onArchive={handleMoveToInbox}
                                    onSpam={handleSpam}
                                    emptyMessage={filter === 'unread' ? 'No unread archived messages' : 'No archived messages'}
                                />
                            </div>
                        </>
                    }
                    right={
                        <>
                            {selectedEmailData ? (
                                <EmailDetailView
                                    email={selectedEmailData}
                                    onToggleRead={handleToggleRead}
                                    onArchive={handleMoveToInbox}
                                    onSpam={handleSpam}
                                    onDelete={handleDelete}
                                    onStar={handleStar}
                                    archiveTitle="Move to Inbox"
                                    archiveAriaLabel="Move to Inbox"
                                    archiveIcon="inbox"
                                />
                            ) : (
                                <EmailDetailEmpty
                                    icon={<ArchiveIcon className="w-8 h-8 text-muted-foreground" />}
                                    title="Select an archived message"
                                    description="Click on an email from the list to view its contents"
                                />
                            )}
                        </>
                    }
                />
            )}
        </MailLayout>
    )
}
