import React from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../lib/branding'
import { supabase } from '../../lib/supabase'
import { AppLogo } from '../AppLogo'
import {
    ArrowLeft,
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
} from 'lucide-react'

import { ModeToggle } from '../mode-toggle'

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
    const { branding } = useBranding()
    const [location, navigate] = useLocation()
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
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                    <Link href="/outreach" className="flex items-center gap-3">
                        <AppLogo className="h-9 w-9 shrink-0" />
                        <div>
                            <span className="block text-base font-bold leading-tight text-foreground">{branding.applicationName}</span>
                            <span className="block text-xs text-muted-foreground">Outreach</span>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors"
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
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActiveRoute(item.href)
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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
                <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user?.email || 'User'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSignOut}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
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
                <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="flex items-center justify-between h-full px-4">
                        <button
                            className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                Cold Email Outreach Platform
                            </span>
                            <button
                                onClick={() => navigate('/admin')}
                                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Sair do Outreach</span>
                            </button>
                            <ModeToggle />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default OutreachLayout
