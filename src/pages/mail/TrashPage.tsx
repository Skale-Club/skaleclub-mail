import React from 'react'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { toast } from '../../components/ui/toaster'
import { Trash2 } from 'lucide-react'

const mockTrashEmails: EmailItem[] = [
    {
        id: 't1',
        subject: 'Old Newsletter',
        snippet: 'Check out our latest updates and news from last month...',
        from: { name: 'Newsletter', email: 'newsletter@spam.com' },
        to: [{ name: 'You', email: 'user@example.com' }],
        date: new Date(Date.now() - 604800000),
        read: true,
        starred: false,
        hasAttachments: false
    },
]

export default function TrashPage() {
    const [emails, setEmails] = React.useState<EmailItem[]>(mockTrashEmails)
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
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmail(id)
    }

    const handleDelete = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Permanently deleted', variant: 'success' })
    }

    const handleRestore = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Email restored to inbox', variant: 'success' })
    }

    const handleEmptyTrash = () => {
        setEmails([])
        toast({ title: 'Trash emptied', variant: 'success' })
    }

    if (isLoading) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400">Loading trash...</p>
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trash</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {emails.length} items
                                    </p>
                                </div>
                            </div>
                            {emails.length > 0 && (
                                <button
                                    onClick={handleEmptyTrash}
                                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
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
                        onDelete={() => {
                            setEmails(prev => prev.filter(e => !selectedEmails.has(e.id)))
                            setSelectedEmails(new Set())
                            toast({ title: 'Permanently deleted', variant: 'success' })
                        }}
                        onArchive={() => {}}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                    />

                    <div className="flex-1 overflow-y-auto">
                        {emails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-20">
                                <Trash2 className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Trash is empty</p>
                                <p className="text-sm mt-1">Deleted emails will appear here</p>
                            </div>
                        ) : (
                            <EmailList
                                emails={emails}
                                selectedId={selectedEmail || undefined}
                                onSelect={handleSelectEmail}
                                onDelete={handleDelete}
                                emptyMessage="No items in trash"
                            />
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                    {selectedEmail ? (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-3xl mx-auto">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        {emails.find(e => e.id === selectedEmail)?.subject}
                                    </h2>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            From: {emails.find(e => e.id === selectedEmail)?.from.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRestore(selectedEmail)}
                                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors"
                                            >
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedEmail)}
                                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                                            >
                                                Delete forever
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    This email will be permanently deleted after 30 days.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Trash2 className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">Select an email from trash</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MailLayout>
    )
}
