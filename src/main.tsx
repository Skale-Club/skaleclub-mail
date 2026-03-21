import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'
import { useAuth } from './hooks/useAuth'
import './lib/utils'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Simple auth check component
function AuthCheck({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const pathname = window.location.pathname

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></div>
            </div>
        )
    }

    if (!user && pathname !== '/login') {
        window.location.href = '/login'
        return null
    }

    return <>{children}</>
}

function App() {
    return (
        <ThemeProvider defaultTheme="system">
            <QueryClientProvider client={new QueryClient()}>
                <div className="min-h-screen bg-background">
                    <Switch>
                        <Route path="/login">
                            <Login />
                        </Route>
                        <Route path="/dashboard">
                            <AuthCheck>
                                <Dashboard />
                            </AuthCheck>
                        </Route>
                        <Route path="/">
                            <AuthCheck>
                                <Dashboard />
                            </AuthCheck>
                        </Route>
                    </Switch>
                    <Toaster />
                </div>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default App

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
