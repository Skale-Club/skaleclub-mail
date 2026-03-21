import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './components/theme-provider'
import { supabase } from './lib/supabase'

function App() {
    const { pathname } = useLocation()
    const { user, isLoading } = useAuth()

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login' && pathname !== '/register') {
            window.location.href = '/login'
        }
    }, [isLoading, user, pathname])

    return (
        <ThemeProvider defaultTheme="system">
            <AuthProvider>
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                        <div className="container flex h-16 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-bold">SkaleClub Mail</span>
                            </div>
                            <nav className="flex items-center gap-6">
                                {user && (
                                    <>
                                        <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            Dashboard
                                        </a>
                                        <a href="/organizations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            Organizations
                                        </a>
                                        <a href="/servers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            Servers
                                        </a>
                                        <a href="/messages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            Messages
                                        </a>
                                        <a href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            Settings
                                        </a>
                                    </>
                </nav>
                            {user && (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={() => {
                                            supabase.auth.signOut()
                                        }}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="container py-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></div>
                            </div>
                        ) : (
                            children
                        )}
                    </main>

                    {/* Toaster for notifications */}
                    <Toaster />
                </div>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
