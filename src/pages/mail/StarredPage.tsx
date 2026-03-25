import React from 'react'
import { Link } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { toast } from '../../components/ui/toaster'
import { useIsMobile } from '../../hooks/useIsMobile'
import { Star } from 'lucide-react'

function createMockStarredEmails(): EmailItem[] {
    return [
        {
            id: '1',
            subject: 'Important: Q4 Planning Document',
            snippet: 'Please review the attached Q4 planning document before our meeting tomorrow...',
            from: { name: 'Sarah Johnson', email: 'sarah.j@startup.io' },
            to: [{ name: 'You', email: 'user@example.com' }],
            date: new Date(Date.now() - 3600000),
            read: false,
            starred: true,
            hasAttachments: true,
            labels: ['Work', 'Important']
        },
        {
            id: '2',
            subject: 'Re: Contract Review',
            snippet: 'Thanks for sending over the contract. I have reviewed it and made some annotations...',
            from: { name: 'Legal Team', email: 'legal@company.com' },
            to: [{ name: 'You', email: 'user@example.com' }],
            date: new Date(Date.now() - 86400000),
            read: true,
            starred: true,
            hasAttachments: true,
            labels: ['Legal']
        },
        {
            id: '3',
            subject: 'Vacation Request Approved',
            snippet: 'Your vacation request for December 20-27 has been approved. Enjoy your time off!',
            from: { name: 'HR Department', email: 'hr@company.com' },
            to: [{ name: 'You', email: 'user@example.com' }],
            date: new Date(Date.now() - 172800000),
            read: true,
            starred: true,
            hasAttachments: false
        },
        {
            id: '4',
            subject: 'Customer Feedback - Excellent Service',
            snippet: 'I wanted to share some great feedback we received from a customer about your recent support...',
            from: { name: 'Manager', email: 'manager@company.com' },
            to: [{ name: 'You', email: 'user@example.com' }],
            date: new Date(Date.now() - 259200000),
            read: true,
            starred: true,
            hasAttachments: false
        },
    ]
}

export default function StarredPage() {
    const isMobile = useIsMobile()
    const [emails, setEmails] = React.useState<EmailItem[]>(() => createMockStarredEmails())
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
        toast({ title: 'Starred emails refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        if (isMobile) {
            window.location.href = `/mail/starred/${id}`
            return
        }
        setSelectedEmail(id)
    }

    const handleStar = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        const email = emails.find(e => e.id === id)
        toast({
            title: email ? 'Removed from starred' : 'Email updated',
            variant: 'success'
        })
    }

    const handleDelete = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        setSelectedEmails(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        toast({ title: 'Email moved to trash', variant: 'success' })
    }

    const handleArchive = (id: string) => {
        setEmails(prev => prev.filter(email => email.id !== id))
        setSelectedEmails(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        toast({ title: 'Email archived', variant: 'success' })
    }

    const handleBulkDelete = () => {
        if (selectedEmails.size === 0) return
        setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)))
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} emails deleted`, variant: 'success' })
    }

    const handleBulkArchive = () => {
        if (selectedEmails.size === 0) return
        setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)))
        setSelectedEmails(new Set())
        toast({ title: `${selectedEmails.size} emails archived`, variant: 'success' })
    }

    if (isLoading) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400">Loading starred emails...</p>
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Starred</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {emails.length} starred {emails.length === 1 ? 'email' : 'emails'}
                                    </p>
                                </div>
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
                        onDelete={handleBulkDelete}
                        onArchive={handleBulkArchive}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                    />

                    <div className="flex-1 overflow-y-auto">
                        {emails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-20">
                                <Star className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No starred emails</p>
                                <p className="text-sm mt-1">Star emails to find them easily later</p>
                            </div>
                        ) : (
                            <EmailList
                                emails={emails}
                                selectedId={selectedEmail || undefined}
                                onSelect={handleSelectEmail}
                                onStar={handleStar}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                emptyMessage="No starred emails"
                            />
                        )}
                    </div>
                </div>

                {!isMobile && (
                    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                        {selectedEmail ? (
                            <EmailDetail email={emails.find(e => e.id === selectedEmail)!} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                        <Star className="w-10 h-10 text-yellow-500" />
                                    </div>
                                    <p className="text-lg font-medium">Select a starred email</p>
                                    <p className="text-sm mt-1">Click on an email from the list to view its contents</p>
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
    const [showFullContent, setShowFullContent] = React.useState(false)

    const fullContent = `Dear User,

Thank you for marking this email as starred. This is a placeholder for the actual email content.

In a real implementation, this would display the full email body with proper formatting, including:
- Rich text formatting
- Inline images
- Quoted replies
- Attachments

Best regards,
The Team

---
This email was sent to ${email.to.map(t => t.email).join(', ')}
Date: ${email.date.toLocaleString()}`

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {email.subject}
                        </h2>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                {email.from.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {email.from.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {email.from.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {email.date.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        To: {email.to.map(t => t.name || t.email).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {email.labels && email.labels.length > 0 && (
                        <div className="flex items-center gap-2 mb-6">
                            {email.labels.map(label => (
                                <span
                                    key={label}
                                    className="px-3 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {showFullContent ? fullContent : fullContent.slice(0, 300) + '...'}
                        </div>
                        {!showFullContent && (
                            <button
                                onClick={() => setShowFullContent(true)}
                                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Read more
                            </button>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Click Reply to respond to this email
                        </p>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/mail/compose?reply=${email.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Reply
                            </Link>
                            <Link
                                href={`/mail/compose?reply=${email.id}&replyAll=true`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Reply All
                            </Link>
                            <Link
                                href={`/mail/compose?forward=${email.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Forward
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
