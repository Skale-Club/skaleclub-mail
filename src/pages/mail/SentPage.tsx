import React from 'react'
import { Link } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { LoadingState } from '../../components/mail/EmailParts'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMailbox } from '../../hooks/useMailbox'
import {
    useMessages,
    useDeleteMessage,
    useArchiveMessage,
    useBatchUpdate,
    useSyncMailbox,
    mapMessageToEmailItem
} from '../../hooks/useMail'
import { mockSentEmails } from '../../lib/mock-data'
import { Send, AlertCircle } from 'lucide-react'

export default function SentPage() {
    const { selectedMailbox, mailboxes, isLoading: mailboxesLoading } = useMailbox()
    const isMobile = useIsMobile()

    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())

    const { data, isLoading, isFetching, refetch } = useMessages('sent', 1, 50)
    const deleteMessage = useDeleteMessage()
    const archiveMessage = useArchiveMessage()
    const batchUpdate = useBatchUpdate()
    const syncMailbox = useSyncMailbox()

    const emails = React.useMemo(() => {
        if (!selectedMailbox || !data?.messages) {
            return mockSentEmails
        }
        return data.messages.map(mapMessageToEmailItem)
    }, [selectedMailbox, data])

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
            window.location.href = `/mail/sent/${id}`
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
                        <div className="flex items-center gap-3">
                            <Send className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sent</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {emails.length} sent {emails.length === 1 ? 'email' : 'emails'}
                                </p>
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
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                        {selectedEmail ? (
                            <EmailDetail email={emails.find(email => email.id === selectedEmail)!} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Send className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium">Select a sent email to view</p>
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {email.subject}
                    </h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            Y
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">You</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        To: {email.to.map(t => t.name || t.email).join(', ')}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {email.date.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {email.snippet}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href={`/mail/compose?forward=${email.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Forward
                    </Link>
                </div>
            </div>
        </div>
    )
}
