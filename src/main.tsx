import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'
import { useAuth } from './hooks/useAuth'
import AdminLayout from './components/admin/AdminLayout'
import './index.css'

import Login from './pages/Login'

import AdminDashboard from './pages/admin/AdminDashboard'
import OrganizationsPage from './pages/admin/OrganizationsPage'
import OrganizationDetailPage from './pages/admin/OrganizationDetailPage'
import ServersPage from './pages/admin/ServersPage'
import DomainsPage from './pages/admin/DomainsPage'
import UsersPage from './pages/admin/UsersPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import CredentialsPage from './pages/admin/CredentialsPage'
import RoutesPage from './pages/admin/RoutesPage'
import WebhooksPage from './pages/admin/WebhooksPage'
import MessagesPage from './pages/admin/MessagesPage'

import { OutreachDashboard } from './pages/outreach/OutreachDashboard'
import { CampaignsPage } from './pages/outreach/CampaignsPage'
import { LeadsPage } from './pages/outreach/LeadsPage'
import { InboxesPage } from './pages/outreach/InboxesPage'
import { SequencesPage } from './pages/outreach/SequencesPage'
import { AnalyticsPage as OutreachAnalyticsPage } from './pages/outreach/AnalyticsPage'
import { SettingsPage as OutreachSettingsPage } from './pages/outreach/SettingsPage'

import InboxPage from './pages/mail/InboxPage'
import SentPage from './pages/mail/SentPage'
import DraftsPage from './pages/mail/DraftsPage'
import TrashPage from './pages/mail/TrashPage'
import ComposePage from './pages/mail/ComposePage'
import MailSettingsPage from './pages/mail/SettingsPage'
import SearchPage from './pages/mail/SearchPage'

const queryClient = new QueryClient()

function AuthCheck({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const pathname = window.location.pathname

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
            <QueryClientProvider client={queryClient}>
                <div className="min-h-screen bg-background">
                    <Switch>
                        <Route path="/login">
                            <Login />
                        </Route>

                        <Route path="/admin">
                            <AuthCheck>
                                <AdminLayout>
                                    <AdminDashboard />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/organizations">
                            <AuthCheck>
                                <AdminLayout>
                                    <OrganizationsPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/organizations/:id">
                            <AuthCheck>
                                <AdminLayout>
                                    <OrganizationDetailPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/servers">
                            <AuthCheck>
                                <AdminLayout>
                                    <ServersPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/domains">
                            <AuthCheck>
                                <AdminLayout>
                                    <DomainsPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/users">
                            <AuthCheck>
                                <AdminLayout>
                                    <UsersPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/credentials">
                            <AuthCheck>
                                <AdminLayout>
                                    <CredentialsPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/routes">
                            <AuthCheck>
                                <AdminLayout>
                                    <RoutesPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/webhooks">
                            <AuthCheck>
                                <AdminLayout>
                                    <WebhooksPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/messages">
                            <AuthCheck>
                                <AdminLayout>
                                    <MessagesPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>
                        <Route path="/admin/analytics">
                            <AuthCheck>
                                <AdminLayout>
                                    <AnalyticsPage />
                                </AdminLayout>
                            </AuthCheck>
                        </Route>

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
                                <OutreachSettingsPage />
                            </AuthCheck>
                        </Route>

                        <Route path="/mail/inbox">
                            <AuthCheck>
                                <InboxPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail/sent">
                            <AuthCheck>
                                <SentPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail/drafts">
                            <AuthCheck>
                                <DraftsPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail/trash">
                            <AuthCheck>
                                <TrashPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail/compose">
                            <AuthCheck>
                                <ComposePage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail/settings">
                            <AuthCheck>
                                <MailSettingsPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail/search">
                            <AuthCheck>
                                <SearchPage />
                            </AuthCheck>
                        </Route>
                        <Route path="/mail">
                            <AuthCheck>
                                <InboxPage />
                            </AuthCheck>
                        </Route>

                        <Route path="/">
                            <AuthCheck>
                                <AdminLayout>
                                    <AdminDashboard />
                                </AdminLayout>
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
