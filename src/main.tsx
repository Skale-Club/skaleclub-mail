import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'
import { useAuth } from './hooks/useAuth'
import './index.css'

// Pages
import Login from './pages/Login'

// Admin Pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import OrganizationsPage from './pages/admin/OrganizationsPage'
import OrganizationDetailPage from './pages/admin/OrganizationDetailPage'
import UsersPage from './pages/admin/UsersPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'

// Simple auth check component
function AuthCheck({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const pathname = window.location.pathname

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <ThemeProvider defaultTheme="dark">
            <QueryClientProvider client={new QueryClient()}>
                <div className="min-h-screen bg-background">
                    <Switch>
                        {/* Auth routes */}
                        <Route path="/login">
                            <Login />
                        </Route>

                        {/* Admin routes */}
                        <Route path="/admin">
                            <AuthCheck>
                                <AdminLayout><AdminDashboard /></AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/organizations">
                            <AuthCheck>
                                <AdminLayout><OrganizationsPage /></AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/organizations/:id">
                            <AuthCheck>
                                <AdminLayout><OrganizationDetailPage /></AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/users">
                            <AuthCheck>
                                <AdminLayout><UsersPage /></AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/analytics">
                            <AuthCheck>
                                <AdminLayout><AnalyticsPage /></AdminLayout>
                            </AuthCheck>
                        </Route>

                        {/* Default route */}
                        <Route path="/">
                            <AuthCheck>
                                <AdminLayout><AdminDashboard /></AdminLayout>
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
