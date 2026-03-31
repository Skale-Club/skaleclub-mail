import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useMessage, useDeleteMessage, useBatchUpdate, useSpamMessage, useSyncMailbox, mapMessageToEmailItem } from '../../hooks/useMail'
import { EmailHtmlViewer } from '../../components/mail/EmailHtmlViewer'
import { EmailMessageHeader } from '../../components/mail/EmailMessageHeader'
import { ShieldAlert, Trash2 } from 'lucide-react'
import { ResizablePanels } from '../../components/mail/ResizablePanels'

export default function SpamPage() {
    const isMobile = useIsMobile()
    const [, setLocation] = useLocation()
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())
    const [filter, setFilter] = React.useState<'all' | 'unread' | 'starred' | 'attachments'>('all')
    const [confirmDialog, setConfirmDialog] = React.useState<{
        open: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'default'
        onConfirm: () => void
    }>({ open: false, title: '', description: '', confirmLabel: 'Confirm', variant: 'default', onConfirm: () => {} })

    const { data, isLoading, isFetching, refetch } = useMessages('spam', 1, 200)
    const deleteMessage = useDeleteMessage()
    const batchUpdate = useBatchUpdate()
    const spamMessage = useSpamMessage()
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
            setLocation(`/mail/spam/${id}`)
            return
        }
        setSelectedEmail(id)
    }

    const handleDelete = (id: string) => {
        setConfirmDialog({
            open: true,
            title: 'Delete permanently?',
            description: 'This spam message will be permanently deleted. This action cannot be undone.',
            confirmLabel: 'Delete forever',
            variant: 'danger',
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }))
                if (selectedMailbox) {
                    deleteMessage.mutate(id)
                }
                if (selectedEmail === id) setSelectedEmail(null)
                toast({ title: 'Message permanently deleted', variant: 'success' })
            },
        })
    }

    const handleNotSpam = (id: string) => {
        if (selectedMailbox) {
            spamMessage.mutate({ messageId: id, isSpam: false })
        }
        if (selectedEmail === id) setSelectedEmail(null)
        toast({ title: 'Message moved to Inbox', variant: 'success' })
    }

    const handleEmptySpam = () => {
        if (emails.length === 0) return
        setConfirmDialog({
            open: true,
            title: 'Delete all spam?',
            description: `All ${emails.length} spam message${emails.length > 1 ? 's' : ''} will be permanently deleted. This action cannot be undone.`,
            confirmLabel: 'Delete all',
            variant: 'danger',
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }))
                if (selectedMailbox && emails.length > 0) {
                    batchUpdate.mutate({ messageIds: emails.map(e => e.id), action: 'delete' })
                }
                setSelectedEmail(null)
                toast({ title: 'Spam folder emptied', variant: 'success' })
            },
        })
    }

    const handleBulkNotSpam = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'unspam' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} messages moved to Inbox`, variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        setConfirmDialog({
            open: true,
            title: `Permanently delete ${selectedEmails.size} message${selectedEmails.size > 1 ? 's' : ''}?`,
            description: 'These messages will be permanently deleted. This action cannot be undone.',
            confirmLabel: 'Delete forever',
            variant: 'danger',
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }))
                if (selectedMailbox) {
                    batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
                }
                setSelectedEmails(new Set())
                toast({ title: `${selectedEmails.size} messages permanently deleted`, variant: 'success' })
            },
        })
    }

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading spam..." />
            </MailLayout>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No Email Accounts Connected</h2>
                        <p className="text-muted-foreground mb-6">Add an email account to view spam.</p>
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
                                <ShieldAlert className="w-5 h-5 text-amber-500" />
                                <h1 className="text-lg font-bold text-foreground">Spam</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                    <button onClick={() => setFilter('all')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
                                    <button onClick={() => setFilter('unread')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
                                    <button onClick={() => setFilter('starred')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'starred' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Starred</button>
                                    <button onClick={() => setFilter('attachments')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'attachments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Attachments</button>
                                </div>
                                {emails.length > 0 && (
                                    <div className="relative group">
                                        <button
                                            onClick={handleEmptySpam}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
                                            aria-label="Delete all spam"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100">
                                            Delete all
                                        </div>
                                    </div>
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
                        onArchive={() => {}}
                        onSpam={handleBulkNotSpam}
                        spamLabel="Not Spam"
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
                            emptyMessage="No spam messages"
                        />
                    </div>
                </div>
            ) : (
                <ResizablePanels
                    storageKey="mail-panels-spam"
                    left={
                        <>
                            <div className="px-4 py-2 border-b border-border bg-background">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                                        <h1 className="text-lg font-bold text-foreground">Spam</h1>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                            <button onClick={() => setFilter('all')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
                                            <button onClick={() => setFilter('unread')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
                                            <button onClick={() => setFilter('starred')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'starred' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Starred</button>
                                            <button onClick={() => setFilter('attachments')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'attachments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Attachments</button>
                                        </div>
                                        {emails.length > 0 && (
                                            <div className="relative group">
                                                <button
                                                    onClick={handleEmptySpam}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
                                                    aria-label="Delete all spam"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100">
                                                    Delete all
                                                </div>
                                            </div>
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
                                onArchive={() => {}}
                                onSpam={handleBulkNotSpam}
                                spamLabel="Not Spam"
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
                                    emptyMessage="No spam messages"
                                />
                            </div>
                        </>
                    }
                    right={
                        <>
                            {selectedEmailData ? (
                                <EmailDetail
                                    email={selectedEmailData}
                                    onNotSpam={handleNotSpam}
                                    onDelete={handleDelete}
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                            <ShieldAlert className="w-10 h-10 text-amber-500" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">Select a spam message</p>
                                    </div>
                                </div>
                            )}
                        </>
                    }
                />
            )}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmLabel={confirmDialog.confirmLabel}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
            />
        </MailLayout>
    )
}

function EmailDetail({
    email,
    onNotSpam,
    onDelete,
}: {
    email: EmailItem
    onNotSpam: (id: string) => void
    onDelete: (id: string) => void
}) {
    const { data: messageData } = useMessage(email.id)
    const fullMessage = messageData?.message
    const [emailDarkMode, setEmailDarkMode] = useState(false)

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4">
                <div className="max-w-3xl mx-auto">
                    <EmailMessageHeader
                        from={email.from}
                        to={email.to}
                        date={email.date}
                        read={email.read}
                        starred={email.starred}
                        isSpam
                        onSpam={() => onNotSpam(email.id)}
                        onDelete={() => onDelete(email.id)}
                        emailDarkMode={emailDarkMode}
                        onToggleEmailDarkMode={() => setEmailDarkMode(!emailDarkMode)}
                    />
                    <h2 className="text-sm font-bold text-foreground mb-3">{email.subject}</h2>

                    <div className="mt-4">
                        <EmailHtmlViewer
                            html={fullMessage?.bodyHtml || fullMessage?.htmlBody}
                            plainText={fullMessage?.bodyText || fullMessage?.plainBody || email.snippet}
                            emailDarkMode={emailDarkMode}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-muted-foreground text-xs">Messages in Spam are automatically deleted after 30 days.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
