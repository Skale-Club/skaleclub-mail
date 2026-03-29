import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useCompose } from '../../hooks/useCompose'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useMessage, useUpdateMessage, useDeleteMessage, useArchiveMessage, useBatchUpdate, useSyncMailbox, mapMessageToEmailItem } from '../../hooks/useMail'
import { EmailHtmlViewer } from '../../components/mail/EmailHtmlViewer'
import { EmailMessageHeader } from '../../components/mail/EmailMessageHeader'
import { FileText } from 'lucide-react'

export default function DraftsPage() {
    const isMobile = useIsMobile()
    const [, setLocation] = useLocation()
    const { openCompose } = useCompose()
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

    const { data, isLoading, isFetching, refetch } = useMessages('drafts', 1, 200)
    const updateMessage = useUpdateMessage()
    const deleteMessage = useDeleteMessage()
    const archiveMessage = useArchiveMessage()
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
        toast({ title: 'Drafts refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            setLocation(`/mail/drafts/${id}`)
            return
        }
        setSelectedEmail(id)
    }

    const handleDelete = (id: string) => {
        setConfirmDialog({
            open: true,
            title: 'Move to trash?',
            description: 'This draft will be moved to the Trash folder. You can restore it within 30 days.',
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
                toast({ title: 'Draft moved to trash', variant: 'success' })
            },
        })
    }

    const handleStar = (id: string) => {
        const email = emails.find(e => e.id === id)
        if (selectedMailbox) {
            updateMessage.mutate({ messageId: id, data: { starred: !email?.starred } })
        }
        toast({
            title: email?.starred ? 'Removed from starred' : 'Added to starred',
            variant: 'success',
        })
    }

    const handleToggleRead = (id: string) => {
        const email = emails.find(e => e.id === id)
        if (!email || !selectedMailbox) return

        updateMessage.mutate({ messageId: id, data: { read: !email.read } })
        toast({
            title: email.read ? 'Marked as unread' : 'Marked as read',
            variant: 'success',
        })
    }

    const handleArchive = (id: string) => {
        if (selectedEmail === id) {
            setSelectedEmail(null)
        }
        if (selectedMailbox) {
            archiveMessage.mutate(id)
        }
        toast({ title: 'Draft archived', variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        setConfirmDialog({
            open: true,
            title: `Move ${selectedEmails.size} draft${selectedEmails.size > 1 ? 's' : ''} to trash?`,
            description: 'These drafts will be moved to the Trash folder. You can restore them within 30 days.',
            confirmLabel: 'Move to trash',
            variant: 'danger',
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }))
                if (selectedMailbox) {
                    batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
                }
                setSelectedEmails(new Set())
                toast({ title: `${selectedEmails.size} drafts moved to trash`, variant: 'success' })
            },
        })
    }

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading drafts..." />
            </MailLayout>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No Email Accounts Connected</h2>
                        <p className="text-muted-foreground mb-6">Add an email account to start using drafts.</p>
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
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <h1 className="text-lg font-bold text-foreground">Drafts</h1>
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
                        onMarkRead={() => {}}
                        onMarkUnread={() => {}}
                        onDelete={handleBulkDelete}
                        onArchive={() => {
                            toast({ title: 'Cannot archive drafts', variant: 'destructive' })
                        }}
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
                            emptyMessage="No drafts"
                        />
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-muted/30">
                        {selectedEmailData ? (
                            <EmailDetail
                                email={selectedEmailData}
                                onToggleRead={handleToggleRead}
                                onArchive={handleArchive}
                                onDelete={handleDelete}
                                onStar={handleStar}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <FileText className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-foreground">Select a draft to edit</p>
                                    <p className="text-sm mt-1">Click on a draft to continue editing</p>
                                    <button
                                        onClick={() => openCompose()}
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                                    >
                                        Compose new email
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
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
    onDelete,
    onStar,
}: {
    email: EmailItem
    onToggleRead?: (id: string) => void
    onArchive?: (id: string) => void
    onDelete?: (id: string) => void
    onStar?: (id: string) => void
}) {
    const { data: messageData } = useMessage(email.id)
    const { openCompose } = useCompose()
    const fullMessage = messageData?.message

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
                        onDelete={onDelete ? () => onDelete(email.id) : undefined}
                        onStar={onStar ? () => onStar(email.id) : undefined}
                    />
                    <h2 className="text-sm font-bold text-foreground mb-3">{email.subject || '(No subject)'}</h2>

                    <div className="mt-4">
                        <EmailHtmlViewer
                            html={fullMessage?.bodyHtml || fullMessage?.htmlBody}
                            plainText={fullMessage?.bodyText || fullMessage?.plainBody || email.snippet}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                        <button
                            onClick={() => openCompose({ draftId: email.id })}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                        >
                            Continue editing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
