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

// Outreach Pages
import { OutreachLayout } from './components/outreach/OutreachLayout'
import { OutreachDashboard } from './pages/outreach/OutreachDashboard'
import { CampaignsPage } from './pages/outreach/CampaignsPage'
import { LeadsPage } from './pages/outreach/LeadsPage'
import { InboxesPage } from './pages/outreach/InboxesPage'
import { SequencesPage } from './pages/outreach/SequencesPage'
import { AnalyticsPage as OutreachAnalyticsPage } from './pages/outreach/AnalyticsPage'
import { SettingsPage } from './pages/outreach/SettingsPage'

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

                        {/* Outreach routes */}
                        <Route path="/outreach">
                            <AuthCheck>
                                <OutreachDashboard />
                            </AuthCheck>
                        </Route>
                        <Route path="/outreach/campaigns">
                            <AuthCheck>
                                <CampaignsPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/outreach/leads">
                            <AuthCheck>
                                <LeadsPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/outreach/inboxes">
                            <AuthCheck>
                                <InboxesPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/outreach/sequences">
                            <AuthCheck>
                                <SequencesPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/outreach/analytics">
                            <AuthCheck>
                                <OutreachAnalyticsPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/outreach/settings">
                            <AuthCheck>
                                <SettingsPage />
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
