import React from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import {
    LayoutDashboard,
    Mail,
    Users,
    Target,
    Send,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Zap
} from 'lucide-react'

interface OutreachLayoutProps {
    children: React.ReactNode
}

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/outreach', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Campaigns', href: '/outreach/campaigns', icon: <Target className="w-5 h-5" /> },
    { label: 'Leads', href: '/outreach/leads', icon: <Users className="w-5 h-5" /> },
    { label: 'Inboxes', href: '/outreach/inboxes', icon: <Mail className="w-5 h-5" /> },
    { label: 'Sequences', href: '/outreach/sequences', icon: <Send className="w-5 h-5" /> },
    { label: 'Analytics', href: '/outreach/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Settings', href: '/outreach/settings', icon: <Settings className="w-5 h-5" /> },
]

export function OutreachLayout({ children }: OutreachLayoutProps) {
    const { user } = useAuth()
    const [location] = useLocation()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const isActiveRoute = (href: string) => {
        if (href === '/outreach') {
            return location === '/outreach'
        }
        return location.startsWith(href)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/outreach" className="flex items-center gap-2">
                        <Zap className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Outreach</span>
                    </Link>
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActiveRoute(item.href)
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
              `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.email || 'User'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/admin"
                            className="flex-1 px-3 py-2 text-xs text-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Admin
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                            <LogOut className="w-3 h-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between h-full px-4">
                        <button
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Cold Email Outreach Platform
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default OutreachLayout
