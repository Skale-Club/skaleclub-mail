import React from 'react'
import { Link } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { toast } from '../../components/ui/toaster'
import { FileText } from 'lucide-react'

const mockDraftEmails: EmailItem[] = [
    {
        id: 'd1',
        subject: 'Draft: Follow up on our call',
        snippet: 'Hi, I wanted to follow up on our conversation earlier today about the new project...',
        from: { name: 'You', email: 'user@skaleclub.com' },
        to: [{ name: 'Client', email: 'client@example.com' }],
        date: new Date(Date.now() - 3600000),
        read: true,
        starred: false,
        hasAttachments: false
    },
    {
        id: 'd2',
        subject: 'Draft: Meeting request',
        snippet: 'Hi team, I would like to schedule a meeting to discuss the upcoming quarterly...',
        from: { name: 'You', email: 'user@skaleclub.com' },
        to: [{ name: 'Team', email: 'team@company.com' }],
        date: new Date(Date.now() - 86400000),
        read: true,
        starred: false,
        hasAttachments: false
    },
]

export default function DraftsPage() {
    const [emails, setEmails] = React.useState<EmailItem[]>(mockDraftEmails)
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
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsRefreshing(false)
        toast({ title: 'Drafts refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmail(id)
    }

    const handleDelete = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Draft deleted', variant: 'success' })
    }

    if (isLoading) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400">Loading drafts...</p>
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
                            <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Drafts</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {emails.length} drafts
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
                            toast({ title: 'Drafts deleted', variant: 'success' })
                        }}
                        onArchive={() => {
                            toast({ title: 'Cannot archive drafts', variant: 'destructive' })
                        }}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
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

                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                    {selectedEmail ? (
                        <EmailDetail email={emails.find(e => e.id === selectedEmail)!} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">Select a draft to edit</p>
                                <p className="text-sm mt-1">Click on a draft to continue editing</p>
                                <Link
                                    href="/mail/compose"
                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Compose new email
                                </Link>
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
                        {email.subject || '(No subject)'}
                    </h2>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            Y
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                To: {email.to.map(t => t.name || t.email).join(', ')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Last edited: {email.date.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {email.snippet}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <Link
                        href={`/mail/compose?draft=${email.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Continue editing
                    </Link>
                </div>
            </div>
        </div>
    )
}
