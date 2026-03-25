import React from 'react'
import { Link } from 'wouter'
import { useBranding } from '../../lib/branding'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { toast } from '../../components/ui/toaster'
import { 
    Inbox as InboxIcon
} from 'lucide-react'

function createMockEmails(applicationName: string, companyName: string): EmailItem[] {
    const domain = companyName ? `${companyName.toLowerCase().replace(/\s+/g, '')}.com` : 'example.com'
    return [
        {
            id: '1',
            subject: `Welcome to ${applicationName}!`,
            snippet: 'Get started with your new email account and explore all the features we have prepared for you.',
            from: { name: `${companyName || 'Platform'} Team`, email: `noreply@${domain}` },
            to: [{ name: 'User', email: `user@${domain}` }],
            date: new Date(),
            read: false,
            starred: true,
            hasAttachments: false,
            labels: ['Welcome']
        },
        {
            id: '2',
            subject: 'Meeting Tomorrow at 10 AM',
            snippet: 'Hi team, just a reminder about our weekly sync meeting tomorrow at 10 AM. Please come prepared with your updates.',
            from: { name: 'John Smith', email: 'john.smith@company.com' },
            to: [{ name: 'User', email: `user@${domain}` }],
            date: new Date(Date.now() - 3600000),
            read: false,
            starred: false,
            hasAttachments: true,
            labels: ['Work']
        },
        {
            id: '3',
            subject: 'Your Monthly Report is Ready',
            snippet: 'Your analytics report for January 2024 is now available. Click here to view the detailed breakdown.',
            from: { name: 'Analytics Team', email: 'reports@analytics.com' },
            to: [{ name: 'User', email: `user@${domain}` }],
            date: new Date(Date.now() - 86400000),
            read: true,
            starred: false,
            hasAttachments: true
        },
        {
            id: '4',
            subject: 'Re: Project Update',
            snippet: 'Thanks for the update! I have reviewed the changes and everything looks good. Lets proceed with the deployment.',
            from: { name: 'Sarah Johnson', email: 'sarah.j@startup.io' },
            to: [{ name: 'User', email: `user@${domain}` }],
            date: new Date(Date.now() - 172800000),
            read: true,
            starred: false,
            hasAttachments: false
        },
        {
            id: '5',
            subject: 'New Feature Announcement',
            snippet: 'We are excited to announce our latest feature: Email Templates! Create and manage your email templates with ease.',
            from: { name: 'Product Team', email: `product@${domain}` },
            to: [{ name: 'User', email: `user@${domain}` }],
            date: new Date(Date.now() - 259200000),
            read: true,
            starred: false,
            hasAttachments: false
        },
    ]
}

export default function InboxPage() {
    const { branding } = useBranding()
    const [emails, setEmails] = React.useState<EmailItem[]>(() => createMockEmails(branding.applicationName, branding.companyName))
    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    React.useEffect(() => {
        const brandedWelcomeEmail = createMockEmails(branding.applicationName, branding.companyName)[0]

        setEmails((current) => {
            if (current.some((email) => email.id !== '1')) {
                return current.map((email) => email.id === '1'
                    ? brandedWelcomeEmail
                    : email)
            }

            return createMockEmails(branding.applicationName, branding.companyName)
        })
    }, [branding.applicationName, branding.companyName])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsRefreshing(false)
        toast({ title: 'Inbox refreshed', variant: 'success' })
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmail(id)
    }

    const handleStar = (id: string) => {
        setEmails(prev => prev.map(email => 
            email.id === id ? { ...email, starred: !email.starred } : email
        ))
        const email = emails.find(e => e.id === id)
        toast({ 
            title: email?.starred ? 'Removed from starred' : 'Added to starred',
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

    const unreadCount = emails.filter(e => !e.read).length

    if (isLoading) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400">Loading inbox...</p>
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
                                <InboxIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
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
                        <EmailList
                            emails={emails}
                            selectedId={selectedEmail || undefined}
                            onSelect={handleSelectEmail}
                            onStar={handleStar}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            emptyMessage="No emails in inbox"
                        />
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                    {selectedEmail ? (
                        <EmailDetail
                            email={emails.find(e => e.id === selectedEmail)!}
                            applicationName={branding.applicationName}
                            companyName={branding.companyName}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <InboxIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">Select an email to read</p>
                                <p className="text-sm mt-1">Click on an email from the list to view its contents</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MailLayout>
    )
}

function EmailDetail({
    email,
    applicationName,
    companyName,
}: {
    email: EmailItem
    applicationName: string
    companyName: string
}) {
    const [showFullContent, setShowFullContent] = React.useState(false)

    const domain = companyName ? `${companyName.toLowerCase().replace(/\s+/g, '')}.com` : 'example.com'

    const fullContent = `Dear User,

Thank you for using ${applicationName}! We are thrilled to have you as part of our growing community.

Here's what you can do with your new email account:

1. Send and receive emails professionally
2. Organize your inbox with folders and labels
3. Track email opens and clicks
4. Create email templates for faster composing
5. Set up webhooks for automated workflows

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Best regards,
The ${companyName || 'Platform'} Team

---
${applicationName} - Professional Email Made Simple
Website: https://${domain}
Support: support@${domain}`

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {email.subject}
                        </h2>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {email.date.toLocaleString()}
                                    </p>
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
                                    className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {showFullContent ? fullContent : fullContent.slice(0, 500) + '...'}
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
