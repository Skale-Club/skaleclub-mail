import React from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import {
    Inbox,
    Send,
    FileText,
    Trash2,
    Star,
    Settings,
    LogOut,
    Menu,
    X,
    Mail,
    Search,
    Plus,
    ChevronDown,
    User,
    RefreshCw,
    Bell
} from 'lucide-react'

interface MailLayoutProps {
    children: React.ReactNode
}

interface FolderItem {
    id: string
    label: string
    icon: React.ReactNode
    href: string
    badge?: number
}

const folders: FolderItem[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-5 h-5" />, href: '/mail/inbox' },
    { id: 'sent', label: 'Sent', icon: <Send className="w-5 h-5" />, href: '/mail/sent' },
    { id: 'drafts', label: 'Drafts', icon: <FileText className="w-5 h-5" />, href: '/mail/drafts' },
    { id: 'starred', label: 'Starred', icon: <Star className="w-5 h-5" />, href: '/mail/starred' },
    { id: 'trash', label: 'Trash', icon: <Trash2 className="w-5 h-5" />, href: '/mail/trash' },
]

export function MailLayout({ children }: MailLayoutProps) {
    const { user } = useAuth()
    const [location] = useLocation()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const [userMenuOpen, setUserMenuOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const isActiveRoute = (href: string) => {
        return location.startsWith(href)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/mail/search?q=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex h-screen">
                <aside className={`
                    fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900
                    text-white shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:shadow-none
                `}>
                    <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700/50">
                        <Link href="/mail/inbox" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold tracking-tight">SkaleMail</span>
                            </div>
                        </Link>
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <Link
                            href="/mail/compose"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            Compose
                        </Link>
                    </div>

                    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                        {folders.map((folder) => (
                            <Link
                                key={folder.id}
                                href={folder.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActiveRoute(folder.href)
                                        ? 'bg-blue-600/20 text-blue-400 shadow-inner'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    }
                                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {folder.icon}
                                <span className="flex-1">{folder.label}</span>
                                {folder.badge && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 rounded-full">
                                        {folder.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
                        <Link
                            href="/mail/settings"
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-2
                                ${isActiveRoute('/mail/settings')
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }
                            `}
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </Link>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search emails..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-96 pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
                                />
                            </form>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative">
                                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {user?.user_metadata?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/mail/settings"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                Profile & Settings
                                            </Link>
                                            <Link
                                                href="/outreach"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Outreach Dashboard
                                            </Link>
                                            <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
