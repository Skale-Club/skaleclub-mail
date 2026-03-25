import React from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../lib/branding'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useKeyboardShortcutHelp } from '../../hooks/useKeyboardShortcuts'
import { AppLogo } from '../AppLogo'
import { ModeToggle } from '../mode-toggle'
import { supabase } from '../../lib/supabase'
import { AccountSwitcher } from './AccountSwitcher'
import { KeyboardShortcutsHelp, KeyboardShortcutsButton } from './KeyboardShortcutsHelp'
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
    { id: 'starred', label: 'Starred', icon: <Star className="w-5 h-5" />, href: '/mail/starred' },
    { id: 'sent', label: 'Sent', icon: <Send className="w-5 h-5" />, href: '/mail/sent' },
    { id: 'drafts', label: 'Drafts', icon: <FileText className="w-5 h-5" />, href: '/mail/drafts' },
    { id: 'trash', label: 'Trash', icon: <Trash2 className="w-5 h-5" />, href: '/mail/trash' },
]

export function MailLayout({ children }: MailLayoutProps) {
    const { user } = useAuth()
    const { branding } = useBranding()
    const isMobile = useIsMobile()
    const { isOpen: shortcutsOpen, closeHelp: closeShortcuts } = useKeyboardShortcutHelp()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const [userMenuOpen, setUserMenuOpen] = React.useState(false)
    const [searchOpen, setSearchOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const isActiveRoute = (href: string) => {
        return window.location.pathname.startsWith(href)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/mail/search?q=${encodeURIComponent(searchQuery)}`
            setSearchOpen(false)
        }
    }

    const closeSidebar = () => setSidebarOpen(false)

    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-between h-16 px-5 border-b border-border">
                <Link href="/mail/inbox" className="flex items-center gap-3" onClick={closeSidebar}>
                    <AppLogo className="h-10 w-10 shrink-0" />
                    <div>
                        <span className="text-xl font-bold tracking-tight text-foreground">{branding.applicationName}</span>
                    </div>
                </Link>
                {isMobile && (
                    <button
                        className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                        onClick={closeSidebar}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="p-4 border-b border-border">
                <AccountSwitcher />
            </div>

            <div className="p-4">
                <Link
                    href="/mail/compose"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-xl font-medium text-primary-foreground shadow-sm-soft transition-all duration-200"
                    onClick={closeSidebar}
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
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActiveRoute(folder.href)
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            }
                        `}
                        onClick={closeSidebar}
                    >
                        {folder.icon}
                        <span className="flex-1">{folder.label}</span>
                        {folder.badge && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                                {folder.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <Link
                    href="/mail/settings"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActiveRoute('/mail/settings')
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }
                    `}
                    onClick={closeSidebar}
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>
            </div>
        </>
    )

    const MobileBottomNav = () => (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border flex items-center justify-around py-2 lg:hidden safe-area-bottom">
            <Link
                href="/mail/inbox"
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                    isActiveRoute('/mail/inbox') ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
                <Inbox className="w-5 h-5" />
                <span className="text-xs">Inbox</span>
            </Link>
            <Link
                href="/mail/starred"
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                    isActiveRoute('/mail/starred') ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
                <Star className="w-5 h-5" />
                <span className="text-xs">Starred</span>
            </Link>
            <Link
                href="/mail/compose"
                className="flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-primary bg-primary/10 rounded-full p-3 -mt-4 shadow-lg"
            >
                <Plus className="w-6 h-6" />
            </Link>
            <Link
                href="/mail/sent"
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                    isActiveRoute('/mail/sent') ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
                <Send className="w-5 h-5" />
                <span className="text-xs">Sent</span>
            </Link>
            <button
                onClick={() => setSidebarOpen(true)}
                className="flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground"
            >
                <Menu className="w-5 h-5" />
                <span className="text-xs">Menu</span>
            </button>
        </nav>
    )

    return (
        <div className="min-h-screen bg-background">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className="flex h-screen">
                {!isMobile && (
                    <aside className="w-72 h-full bg-card border-r border-border flex flex-col">
                        <SidebarContent />
                    </aside>
                )}

                {isMobile && sidebarOpen && (
                    <aside className="fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border shadow-lg flex flex-col animate-slide-in-left">
                        <SidebarContent />
                    </aside>
                )}

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                        <div className="flex items-center gap-2 sm:gap-4">
                            {isMobile && (
                                <button
                                    className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}

                            {isMobile ? (
                                searchOpen ? (
                                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Search emails..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-muted/50 border border-transparent rounded-lg text-sm focus:bg-background focus:border-border focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchOpen(false)
                                                setSearchQuery('')
                                            }}
                                            className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </form>
                                ) : (
                                    <Link href="/mail/inbox" className="flex items-center gap-2">
                                        <AppLogo className="h-8 w-8 shrink-0" />
                                        <span className="font-bold text-foreground">{branding.applicationName}</span>
                                    </Link>
                                )
                            ) : (
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search emails..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-64 sm:w-80 lg:w-96 pl-10 pr-4 py-2 bg-muted/50 border border-transparent rounded-lg text-sm focus:bg-background focus:border-border focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm-soft"
                                    />
                                </form>
                            )}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-3">
                            {isMobile && !searchOpen && (
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            )}
                            
                            <button className="p-2 rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors relative">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            
                            <button className="p-2 rounded-xl hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors relative hidden sm:flex">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                            </button>
                            
                            <KeyboardShortcutsButton onClick={() => {}} />
                            <ModeToggle />

                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-accent transition-colors"
                                >
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                                        {user?.user_metadata?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-foreground">
                                        {user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} top-full mt-2 w-64 bg-popover text-popover-foreground rounded-xl shadow-md border border-border py-2 z-50`}>
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="text-sm font-medium">
                                                    {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/mail/settings"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                Profile & Settings
                                            </Link>
                                            <Link
                                                href="/outreach"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Outreach Dashboard
                                            </Link>
                                            <div className="border-t border-border mt-2 pt-2">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
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

                    <main className={`flex-1 overflow-hidden bg-background ${isMobile ? 'pb-20' : ''}`}>
                        {children}
                    </main>
                </div>
            </div>

            {isMobile && <MobileBottomNav />}
            
            <KeyboardShortcutsHelp isOpen={shortcutsOpen} onClose={closeShortcuts} />
        </div>
    )
}
