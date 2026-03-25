import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { EmailList, EmailItem, EmailToolbar } from '../../components/mail/EmailList'
import { toast } from '../../components/ui/toaster'
import { Search as SearchIcon } from 'lucide-react'

const mockSearchResults: EmailItem[] = [
    {
        id: 's1',
        subject: 'Project Update - Q4 Planning',
        snippet: 'Hi team, here are the notes from our Q4 planning session. We discussed the new features and timeline.',
        from: { name: 'John Smith', email: 'john@company.com' },
        to: [{ name: 'You', email: 'user@example.com' }],
        date: new Date(Date.now() - 86400000),
        read: true,
        starred: false,
        hasAttachments: true,
        labels: ['Work']
    },
    {
        id: 's2',
        subject: 'Update on Marketing Campaign',
        snippet: 'The marketing team has completed the analysis of the Q4 campaign. Results look promising...',
        from: { name: 'Marketing Team', email: 'marketing@company.com' },
        to: [{ name: 'You', email: 'user@example.com' }],
        date: new Date(Date.now() - 172800000),
        read: false,
        starred: true,
        hasAttachments: false
    },
]

export default function SearchPage() {
    const [location] = useLocation()
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<EmailItem[]>(mockSearchResults)
    const [isSearching, setIsSearching] = React.useState(false)
    const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null)
    const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        const params = new URLSearchParams(location.split('?')[1] || '')
        const q = params.get('q') || ''
        setQuery(q)
        if (q) {
            performSearch(q)
        }
    }, [location])

    const performSearch = async (_searchQuery: string) => {
        setIsSearching(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSearching(false)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            window.location.href = `/mail/search?q=${encodeURIComponent(query)}`
        }
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmail(id)
    }

    const handleStar = (id: string) => {
        setResults(prev => prev.map(email => 
            email.id === id ? { ...email, starred: !email.starred } : email
        ))
    }

    const handleDelete = (id: string) => {
        setResults(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Email deleted', variant: 'success' })
    }

    const handleArchive = (id: string) => {
        setResults(prev => prev.filter(email => email.id !== id))
        toast({ title: 'Email archived', variant: 'success' })
    }

    return (
        <MailLayout>
            <div className="flex h-full">
                <div className="w-full lg:w-1/2 xl:w-2/5 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-slate-900">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                        <form onSubmit={handleSearch} className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </form>
                        <div className="mt-3 flex items-center justify-between">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Search Results
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {results.length} results for "{query}"
                            </p>
                        </div>
                    </div>

                    <EmailToolbar
                        selectedCount={selectedEmails.size}
                        onMarkRead={() => {}}
                        onMarkUnread={() => {}}
                        onDelete={() => {
                            setResults(prev => prev.filter(e => !selectedEmails.has(e.id)))
                            setSelectedEmails(new Set())
                            toast({ title: 'Emails deleted', variant: 'success' })
                        }}
                        onArchive={() => {}}
                        onRefresh={() => {
                            performSearch(query)
                            toast({ title: 'Search refreshed', variant: 'success' })
                        }}
                    />

                    <div className="flex-1 overflow-y-auto">
                        {isSearching ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-500 dark:text-gray-400">Searching...</p>
                                </div>
                            </div>
                        ) : results.length > 0 ? (
                            <EmailList
                                emails={results}
                                selectedId={selectedEmail || undefined}
                                onSelect={handleSelectEmail}
                                onStar={handleStar}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                emptyMessage="No results found"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                <SearchIcon className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No results found</p>
                                <p className="text-sm mt-1">Try different keywords or check your spelling</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col bg-gray-50 dark:bg-slate-900/50">
                    {selectedEmail ? (
                        <EmailDetail email={results.find(e => e.id === selectedEmail)!} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <SearchIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">Select a result to preview</p>
                                <p className="text-sm mt-1">Click on an email from the search results</p>
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {email.from.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
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
                        href={`/mail/compose?reply=${email.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Reply
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
    )
}
