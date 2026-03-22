import React from 'react'
import { Link } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { toast } from '../../components/ui/toaster'
import { Send } from 'lucide-react'

const mockSentEmails: EmailItem[] = [
    {
        id: 's1',
        subject: 'Re: Project Update',
        snippet: 'Thanks for the update! I have reviewed the changes and everything looks good.',
        from: { name: 'You', email: 'user@skaleclub.com' },
        to: [{ name: 'Sarah Johnson', email: 'sarah.j@startup.io' }],
        date: new Date(Date.now() - 3600000),
        read: true,
        starred: false,
        hasAttachments: false
    },
    {
        id: 's2',
        subject: 'Weekly Status Report',
        snippet: 'Please find attached my weekly status report for your review.',
        from: { name: 'You', email: 'user@skaleclub.com' },
        to: [{ name: 'Manager', email: 'manager@company.com' }],
        date: new Date(Date.now() - 86400000),
        read: true,
        starred: true,
        hasAttachments: true
    },
    {
        id: 's3',
        subject: 'Meeting Notes - Q4 Planning',
        snippet: 'Hi team, here are the notes from our Q4 planning session yesterday.',
        from: { name: 'You', email: 'user@skaleclub.com' },
        to: [{ name: 'Team', email: 'team@company.com' }],
        date: new Date(Date.now() - 172800000),
        read: true,
        starred: false,
        hasAttachments: false
    },
]

export default function SentPage() {
    const [emails, setEmails] = React.useState<EmailItem[]>(mockSentEmails)
    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsRefreshing(false)
        toast({ title: 'Sent folder refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmail(id)
    }

    const handleStar = (id: string) => {
        setEmails(prev => prev.map(email => 
            email.id === id ? { ...email, starred: !email.starred } : email
        ))
        toast({ 
            title: emails.find(e => e.id === id)?.starred ? 'Removed from starred' : 'Added to starred',
            variant: 'success'
        })
    }

    const handleDelete = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Email deleted', variant: 'success' })
    }

    const handleArchive = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Email archived', variant: 'success' })
    }

    if (isLoading) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400">Loading sent items...</p>
                    </div>
                </div>
            </MailLayout>
        )
    }

    return (
        <MailLayout>
            <div className="flex h-full">
                <div className="w-full lg:w-1/2 xl:w-2/5 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-slate-900">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <Send className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sent</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {emails.length} sent emails
                                </p>
                            </div>
                        </div>
                    </div>

                    <EmailToolbar
                        selectedCount={selectedEmails.size}
                        onMarkRead={() => {
                            setEmails(prev => prev.map(e => 
                                selectedEmails.has(e.id) ? { ...e, read: true } : e
                            ))
                            setSelectedEmails(new Set())
                        }}
                        onMarkUnread={() => {
                            setEmails(prev => prev.map(e => 
                                selectedEmails.has(e.id) ? { ...e, read: false } : e
                            ))
                            setSelectedEmails(new Set())
                        }}
                        onDelete={() => {
                            setEmails(prev => prev.filter(e => !selectedEmails.has(e.id)))
                            setSelectedEmails(new Set())
                            toast({ title: 'Emails deleted', variant: 'success' })
                        }}
                        onArchive={() => {
                            setEmails(prev => prev.filter(e => !selectedEmails.has(e.id)))
                            setSelectedEmails(new Set())
                            toast({ title: 'Emails archived', variant: 'success' })
                        }}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                    />

                    <div className="flex-1 overflow-y-auto">
                        <EmailList
                            emails={emails}
                            selectedId={selectedEmail || undefined}
                            onSelect={handleSelectEmail}
                            onStar={handleStar}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            emptyMessage="No sent emails"
                        />
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                    {selectedEmail ? (
                        <EmailDetail email={emails.find(e => e.id === selectedEmail)!} />
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
                        This is the content of your sent email. In a real implementation, this would contain the actual email body text that was sent to the recipient.
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
