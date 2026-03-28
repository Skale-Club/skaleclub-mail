import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import {
    useMessages,
    useMessage,
    useDeleteMessage,
    useArchiveMessage,
    useBatchUpdate,
    useSyncMailbox,
    mapMessageToEmailItem
} from '../../hooks/useMail'
import { EmailHtmlViewer } from '../../components/mail/EmailHtmlViewer'
import { Send, AlertCircle } from 'lucide-react'

export default function SentPage() {
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()
    const isMobile = useIsMobile()
    const [, navigate] = useLocation()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())
    const [filter, setFilter] = React.useState<'all' | 'unread' | 'starred' | 'attachments'>('all')

    const { data, isLoading, isFetching, refetch } = useMessages('sent', 1, 50)
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

    const handleRefresh = async () => {
        if (selectedMailbox) {
            syncMailbox.mutate()
        } else {
            refetch()
        }
        toast({ title: 'Sent folder refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            navigate(`/mail/sent/${id}`)
            return
        }
        setSelectedEmail(id)
    }

    const handleStar = (id: string) => {
        toast({
            title: emails.find(email => email.id === id)?.starred ? 'Removed from starred' : 'Added to starred',
            variant: 'success'
        })
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
        toast({ title: 'Email deleted', variant: 'success' })
    }

    const handleArchive = (id: string) => {
        if (selectedMailbox) {
            archiveMessage.mutate(id)
        }
        toast({ title: 'Email archived', variant: 'success' })
    }

    if (mailboxesLoading || isLoading) {
        return (
            <MailLayout>
                <LoadingState message="Loading sent items..." />
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
                                <Send className="w-5 h-5 text-muted-foreground" />
                                <h1 className="text-lg font-bold text-foreground">Sent</h1>
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
                        totalCount={data?.total}
                        onSelectAll={() => {
                            if (selectedEmails.size === emails.length) {
                                setSelectedEmails(new Set())
                            } else {
                                setSelectedEmails(new Set(emails.map(email => email.id)))
                            }
                        }}
                        onMarkRead={() => {
                            setSelectedEmails(new Set())
                        }}
                        onMarkUnread={() => {
                            setSelectedEmails(new Set())
                        }}
                        onDelete={() => {
                            if (selectedEmails.size === 0) return
                            if (selectedMailbox) {
                                batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'delete' })
                            }
                            setSelectedEmails(new Set())
                            toast({ title: `${selectedEmails.size} emails deleted`, variant: 'success' })
                        }}
                        onArchive={() => {
                            if (selectedEmails.size === 0) return
                            if (selectedMailbox) {
                                batchUpdate.mutate({ messageIds: Array.from(selectedEmails), action: 'archive' })
                            }
                            setSelectedEmails(new Set())
                            toast({ title: `${selectedEmails.size} emails archived`, variant: 'success' })
                        }}
                        onRefresh={handleRefresh}
                        isRefreshing={isFetching || syncMailbox.isPending}
                    />

                    <div className="flex-1 overflow-y-auto">
                        {emails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-20">
                                <Send className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No sent emails</p>
                                <p className="text-sm mt-1">Your sent emails will appear here</p>
                            </div>
                        ) : (
                            <EmailList
                                emails={emails}
                                selectedId={selectedEmail || undefined}
                                selectedEmails={selectedEmails}
                                onSelect={handleSelectEmail}
                                onSelectMultiple={(ids) => setSelectedEmails(new Set(ids))}
                                onStar={handleStar}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                emptyMessage="No sent emails"
                            />
                        )}
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-muted/30">
                        {selectedEmail ? (
                            <EmailDetail email={emails.find(email => email.id === selectedEmail)!} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                        <Send className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-foreground">Select a sent email to view</p>
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
    const { data: messageData } = useMessage(email.id)
    const fullMessage = messageData?.message

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 py-2 border-b border-border mb-3">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs flex-shrink-0">
                            {email.from.name?.[0]?.toUpperCase() || email.from.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">{email.from.name}</p>
                                <p className="text-xs text-muted-foreground flex-shrink-0">{email.date.toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">To: {email.to.map(t => t.name || t.email).join(', ')}</p>
                        </div>
                    </div>
                    <h2 className="text-sm font-bold text-foreground mb-3">{email.subject}</h2>

                    <div className="mt-4">
                        <EmailHtmlViewer
                            html={fullMessage?.bodyHtml || fullMessage?.htmlBody}
                            plainText={fullMessage?.bodyText || fullMessage?.plainBody || email.snippet}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <Link
                            href={`/mail/compose?forward=${email.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                        >
                            Forward
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
