import { ReactNode, useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import {
    Building2,
    Users,
    Mail,
    LogOut,
    Menu,
    X,
    Home,
    BarChart2,
} from 'lucide-react'

interface NavItem {
    label: string
    href: string
    icon: ReactNode
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
    { label: 'Organizations', href: '/admin/organizations', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart2 className="w-5 h-5" /> },
]

interface AdminLayoutProps {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [location, navigate] = useLocation()
    const { user } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const isActive = (href: string) => {
        if (href === '/admin') {
            return location === '/admin'
        }
        return location.startsWith(href)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
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
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-4 border-b">
                        <div className="flex items-center gap-2">
                            <Mail className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold">SkaleClub</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-1">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <button
                                        onClick={() => {
                                            navigate(item.href)
                                            setSidebarOpen(false)
                                        }}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href)
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User section */}
                    <div className="border-t p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.email}</p>
                                <p className="text-xs text-muted-foreground">Administrator</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">
                            {navItems.find((item) => isActive(item.href))?.label || 'Admin Panel'}
                        </h1>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    )
}
