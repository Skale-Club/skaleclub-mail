import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useDeleteMessage, useBatchUpdate, useSyncMailbox, mapMessageToEmailItem } from '../../hooks/useMail'
import { Trash2 } from 'lucide-react'

export default function TrashPage() {
    const isMobile = useIsMobile()
    const [, setLocation] = useLocation()
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())

    const { data, isLoading, isFetching, refetch } = useMessages('trash', 1, 200)
    const deleteMessage = useDeleteMessage()
    const batchUpdate = useBatchUpdate()
    const syncMailbox = useSyncMailbox()

    const emails = React.useMemo(() => {
        if (!data?.messages) return []
        return data.messages.map(mapMessageToEmailItem)
    }, [data])

    const handleRefresh = async () => {
        if (selectedMailbox) {
            syncMailbox.mutate()
        } else {
            refetch()
        }
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            setLocation(`/mail/trash/${id}`)
            return
        }
        setSelectedEmail(id)
    }

    const handleDelete = (id: string) => {
        if (selectedMailbox) {
            deleteMessage.mutate(id)
        }
        toast({ title: 'Permanently deleted', variant: 'success' })
    }

    const handleRestore = (id: string) => {
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: [id], action: 'move' })
        }
        toast({ title: 'Email restored to inbox', variant: 'success' })
    }

    const handleEmptyTrash = () => {
        if (selectedMailbox && emails.length > 0) {
            batchUpdate.mutate({
                messageIds: emails.map(e => e.id),
                action: 'delete'
            })
        }
        toast({ title: 'Trash emptied', variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} emails permanently deleted`, variant: 'success' })
    }

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading trash..." />
            </MailLayout>
        )
    }

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <Trash2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No Email Accounts Connected</h2>
                        <p className="text-muted-foreground mb-6">Add an email account to view trash.</p>
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
                    <div className="px-5 py-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-6 h-6 text-muted-foreground" />
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">Trash</h1>
                                    <p className="text-sm text-muted-foreground">{emails.length} items</p>
                                </div>
                            </div>
                            {emails.length > 0 && (
                                <button
                                    onClick={handleEmptyTrash}
                                    className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg font-medium transition-colors"
                                >
                                    Empty trash
                                </button>
                            )}
                        </div>
                    </div>

                    <EmailToolbar
                        selectedCount={selectedEmails.size}
                        onMarkRead={() => {}}
                        onMarkUnread={() => {}}
                        onDelete={handleBulkDelete}
                        onArchive={() => {}}
                        onRefresh={handleRefresh}
                        isRefreshing={isFetching || syncMailbox.isPending}
                    />

                    <div className="flex-1 overflow-y-auto">
                        <EmailList
                            emails={emails}
                            selectedId={selectedEmail || undefined}
                            onSelect={handleSelectEmail}
                            onDelete={handleDelete}
                            emptyMessage="No items in trash"
                        />
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-muted/30">
                        {selectedEmail ? (
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="max-w-3xl mx-auto">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-foreground mb-4">
                                            {emails.find(e => e.id === selectedEmail)?.subject}
                                        </h2>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                From: {emails.find(e => e.id === selectedEmail)?.from.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRestore(selectedEmail)}
                                                    className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors"
                                                >
                                                    Restore
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
                                    <p className="text-muted-foreground text-sm">
                                        This email will be permanently deleted after 30 days.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <Trash2 className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-foreground">Select an email from trash</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MailLayout>
    )
}
