import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useCompose } from '../../hooks/useCompose'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useMessage, useUpdateMessage, useDeleteMessage, useArchiveMessage, useBatchUpdate, useSpamMessage, useSyncMailbox, mapMessageToEmailItem } from '../../hooks/useMail'
import { EmailHtmlViewer } from '../../components/mail/EmailHtmlViewer'
import { EmailMessageHeader } from '../../components/mail/EmailMessageHeader'
import { Star } from 'lucide-react'
import { ResizablePanels } from '../../components/mail/ResizablePanels'

export default function StarredPage() {
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

    const { data, isLoading, isFetching, refetch } = useMessages('inbox', 1, 200)
    const updateMessage = useUpdateMessage()
    const deleteMessage = useDeleteMessage()
    const archiveMessage = useArchiveMessage()
    const batchUpdate = useBatchUpdate()
    const spamMessage = useSpamMessage()
    const syncMailbox = useSyncMailbox()

    const { emails, unreadCount } = React.useMemo(() => {
        const base = data?.messages ? data.messages.map(mapMessageToEmailItem).filter(e => e.starred) : []
        const unread = base.filter(e => !e.read).length
        let filtered = base
        if (filter === 'unread') filtered = base.filter(e => !e.read)
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
        toast({ title: 'Starred emails refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            setLocation(`/mail/inbox/${id}`)
            return
        }
        setSelectedEmail(id)
    }

    const handleStar = (id: string) => {
        if (selectedEmail === id) {
            setSelectedEmail(null)
        }
        if (selectedMailbox) {
            const email = emails.find(e => e.id === id)
            updateMessage.mutate({ messageId: id, data: { starred: !email?.starred } })
        }
        toast({
            title: emails.find(e => e.id === id)?.starred ? 'Removed from starred' : 'Added to starred',
            variant: 'success'
        })
    }

    const handleToggleRead = (id: string) => {
        const email = emails.find(e => e.id === id)
        if (!email || !selectedMailbox) return

        updateMessage.mutate({ messageId: id, data: { read: !email.read } })
        toast({
            title: email.read ? 'Marked as unread' : 'Marked as read',
            variant: 'success'
        })
    }

    const handleDelete = (id: string) => {
        setConfirmDialog({
            open: true,
            title: 'Move to trash?',
            description: 'This email will be moved to the Trash folder. You can restore it within 30 days.',
            confirmLabel: 'Move to trash',
            variant: 'danger',
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }))
                if (selectedEmail === id) {
                    setSelectedEmail(null)
                }
                if (selectedMailbox) {
                    deleteMessage.mutate(id)
                }
                setSelectedEmails(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(id)
                    return newSet
                })
                toast({ title: 'Email moved to trash', variant: 'success' })
            },
        })
    }

    const handleArchive = (id: string) => {
        if (selectedEmail === id) {
            setSelectedEmail(null)
        }
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

    const handleSpam = (id: string) => {
        if (selectedEmail === id) {
            setSelectedEmail(null)
        }
        if (selectedMailbox) {
            spamMessage.mutate({ messageId: id, isSpam: true })
        }
        setSelectedEmails(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        toast({ title: 'Marked as spam', variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        setConfirmDialog({
            open: true,
            title: `Move ${selectedEmails.size} email${selectedEmails.size > 1 ? 's' : ''} to trash?`,
            description: 'These emails will be moved to the Trash folder. You can restore them within 30 days.',
            confirmLabel: 'Move to trash',
            variant: 'danger',
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }))
                if (selectedMailbox) {
                    batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
                }
                setSelectedEmails(new Set())
                toast({ title: `${selectedEmails.size} emails moved to trash`, variant: 'success' })
            },
        })
    }

    const handleBulkArchive = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'archive' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} emails archived`, variant: 'success' })
    }

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading starred emails..." />
            </MailLayout>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <Star className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No Email Accounts Connected</h2>
                        <p className="text-muted-foreground mb-6">Add an email account to start using starred emails.</p>
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
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <h1 className="text-lg font-bold text-foreground">Starred</h1>
                            </div>
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                <button onClick={() => setFilter('all')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
                                <button onClick={() => setFilter('unread')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
                                <button onClick={() => setFilter('starred')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'starred' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Starred</button>
                                <button onClick={() => setFilter('attachments')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'attachments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Attachments</button>
                            </div>
                        </div>
                    </div>

                    <EmailToolbar
                        selectedCount={selectedEmails.size}
                        onMarkRead={() => {
                            if (selectedMailbox) {
                                batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'read' })
                            }
                            setSelectedEmails(new Set())
                        }}
                        onMarkUnread={() => {
                            if (selectedMailbox) {
                                batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'unread' })
                            }
                            setSelectedEmails(new Set())
                        }}
                        onDelete={handleBulkDelete}
                        onArchive={handleBulkArchive}
                        onRefresh={handleRefresh}
                        isRefreshing={isFetching || syncMailbox.isPending}
                    />

                    <div className="flex-1 overflow-y-auto">
                        <EmailList
                            emails={emails}
                            selectedId={selectedEmail || undefined}
                            onSelect={handleSelectEmail}
                            onToggleRead={handleToggleRead}
                            onStar={handleStar}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            onSpam={handleSpam}
                            emptyMessage="No starred emails"
                        />
                    </div>
                </div>
            ) : (
                <ResizablePanels
                    storageKey="mail-panels-starred"
                    left={
                        <>
                            <div className="px-4 py-2 border-b border-border bg-background">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        <h1 className="text-lg font-bold text-foreground">Starred</h1>
                                    </div>
                                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                        <button onClick={() => setFilter('all')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
                                        <button onClick={() => setFilter('unread')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
                                        <button onClick={() => setFilter('starred')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'starred' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Starred</button>
                                        <button onClick={() => setFilter('attachments')} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'attachments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Attachments</button>
                                    </div>
                                </div>
                            </div>

                            <EmailToolbar
                                selectedCount={selectedEmails.size}
                                onMarkRead={() => {
                                    if (selectedMailbox) {
                                        batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'read' })
                                    }
                                    setSelectedEmails(new Set())
                                }}
                                onMarkUnread={() => {
                                    if (selectedMailbox) {
                                        batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'unread' })
                                    }
                                    setSelectedEmails(new Set())
                                }}
                                onDelete={handleBulkDelete}
                                onArchive={handleBulkArchive}
                                onRefresh={handleRefresh}
                                isRefreshing={isFetching || syncMailbox.isPending}
                            />

                            <div className="flex-1 overflow-y-auto">
                                <EmailList
                                    emails={emails}
                                    selectedId={selectedEmail || undefined}
                                    onSelect={handleSelectEmail}
                                    onToggleRead={handleToggleRead}
                                    onStar={handleStar}
                                    onDelete={handleDelete}
                                    onArchive={handleArchive}
                                    onSpam={handleSpam}
                                    emptyMessage="No starred emails"
                                />
                            </div>
                        </>
                    }
                    right={
                        <>
                            {selectedEmailData ? (
                                <EmailDetail
                                    email={selectedEmailData}
                                    onToggleRead={handleToggleRead}
                                    onArchive={handleArchive}
                                    onSpam={handleSpam}
                                    onDelete={handleDelete}
                                    onStar={handleStar}
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                            <Star className="w-10 h-10 text-yellow-500" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">Select a starred email</p>
                                        <p className="text-sm mt-1">Click on an email from the list to view its contents</p>
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
    onToggleRead,
    onArchive,
    onSpam,
    onDelete,
    onStar,
}: {
    email: EmailItem
    onToggleRead?: (id: string) => void
    onArchive?: (id: string) => void
    onSpam?: (id: string) => void
    onDelete?: (id: string) => void
    onStar?: (id: string) => void
}) {
    const { data: messageData } = useMessage(email.id)
    const { openCompose } = useCompose()
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
                        onToggleRead={onToggleRead ? () => onToggleRead(email.id) : undefined}
                        onArchive={onArchive ? () => onArchive(email.id) : undefined}
                        onSpam={onSpam ? () => onSpam(email.id) : undefined}
                        onDelete={onDelete ? () => onDelete(email.id) : undefined}
                        onStar={onStar ? () => onStar(email.id) : undefined}
                        emailDarkMode={emailDarkMode}
                        onToggleEmailDarkMode={() => setEmailDarkMode(!emailDarkMode)}
                    />
                    <h2 className="text-sm font-bold text-foreground mb-3">{email.subject}</h2>

                    {email.labels && email.labels.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            {email.labels.map(label => (
                                <span key={label} className="px-2.5 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground font-medium">
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-4">
                        <EmailHtmlViewer
                            html={fullMessage?.bodyHtml || fullMessage?.htmlBody}
                            plainText={fullMessage?.bodyText || fullMessage?.plainBody || email.snippet}
                            emailDarkMode={emailDarkMode}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex items-center gap-3">
                            <button onClick={() => openCompose({ replyToId: email.id })} className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">Reply</button>
                            <button onClick={() => openCompose({ replyToId: email.id, replyAll: true })} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-colors">Reply All</button>
                            <button onClick={() => openCompose({ forwardId: email.id })} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-colors">Forward</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
