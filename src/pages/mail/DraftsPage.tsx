import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import { useMessages, useDeleteMessage, useBatchUpdate, useSyncMailbox, mapMessageToEmailItem } from '../../hooks/useMail'
import { FileText } from 'lucide-react'

export default function DraftsPage() {
    const isMobile = useIsMobile()
    const [, setLocation] = useLocation()
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())

    const { data, isLoading, isFetching, refetch } = useMessages('drafts', 1, 200)
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
        if (selectedMailbox) {
            deleteMessage.mutate(id)
        }
        toast({ title: 'Draft deleted', variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        if (selectedMailbox) {
            batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
        }
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} drafts deleted`, variant: 'success' })
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
                    <div className="px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Drafts</h1>
                                <p className="text-sm text-muted-foreground">{emails.length} drafts</p>
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
                            onSelect={handleSelectEmail}
                            onDelete={handleDelete}
                            emptyMessage="No drafts"
                        />
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-muted/30">
                        {selectedEmail ? (
                            <EmailDetail email={emails.find(e => e.id === selectedEmail)!} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <FileText className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-foreground">Select a draft to edit</p>
                                    <p className="text-sm mt-1">Click on a draft to continue editing</p>
                                    <Link
                                        href="/mail/compose"
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                                    >
                                        Compose new email
                                    </Link>
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
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-4">{email.subject || '(No subject)'}</h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg flex-shrink-0">
                            Y
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">To: {email.to.map(t => t.name || t.email).join(', ')}</p>
                            <p className="text-sm text-muted-foreground mt-1">Last edited: {email.date.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <div className="text-foreground whitespace-pre-wrap">{email.snippet}</div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                    <Link
                        href={`/mail/compose?draft=${email.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                    >
                        Continue editing
                    </Link>
                </div>
            </div>
        </div>
    )
}
