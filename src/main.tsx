import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'
import { useAuth } from './hooks/useAuth'
import { useBranding } from './lib/branding'
import AdminLayout from './components/admin/AdminLayout'
import './index.css'

import Login from './pages/Login'

import AdminDashboard from './pages/admin/AdminDashboard'
import OrganizationsPage from './pages/admin/OrganizationsPage'
import OrganizationDetailPage from './pages/admin/OrganizationDetailPage'
import AdminsPage from './pages/admin/AdminsPage'
import BrandingPage from './pages/admin/BrandingPage'
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

function Spinner() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
    )
}

function AuthCheck({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const pathname = window.location.pathname

    if (isLoading) return <Spinner />

    if (!user && pathname !== '/login') {
        window.location.href = '/login'
        return null
    }

    return <>{children}</>
}

// Guards /admin/* routes — non-admins are redirected to webmail
function AdminCheck({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, isLoading } = useAuth()

    if (isLoading) return <Spinner />

    if (!user) {
        window.location.href = '/login'
        return null
    }

    if (!isAdmin) {
        window.location.href = '/mail/inbox'
        return null
    }

    return <>{children}</>
}

// Root redirect: admins → /admin, members → /mail/inbox
function RootRedirect() {
    const { user, isAdmin, isLoading } = useAuth()

    if (isLoading) return <Spinner />

    if (!user) {
        window.location.href = '/login'
        return null
    }

    window.location.href = isAdmin ? '/admin' : '/mail/inbox'
    return null
}

function BrandingHead() {
    const { branding } = useBranding()

    React.useEffect(() => {
        document.title = branding.applicationName

        let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null

        if (!favicon) {
            favicon = document.createElement('link')
            favicon.rel = 'icon'
            document.head.appendChild(favicon)
        }

        favicon.href = branding.faviconUrl
    }, [branding.applicationName, branding.faviconUrl])

    return null
}

function App() {
    return (
        <ThemeProvider defaultTheme="system">
            <QueryClientProvider client={queryClient}>
                <BrandingHead />
                <div className="min-h-screen bg-background">
                    <Switch>
                        <Route path="/login">
                            <Login />
                        </Route>

                        <Route path="/admin">
                            <AdminCheck>
                                <AdminLayout>
                                    <AdminDashboard />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/organizations">
                            <AdminCheck>
                                <AdminLayout>
                                    <OrganizationsPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/organizations/:id">
                            <AdminCheck>
                                <AdminLayout>
                                    <OrganizationDetailPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/admins">
                            <AdminCheck>
                                <AdminLayout>
                                    <AdminsPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/branding">
                            <AdminCheck>
                                <AdminLayout>
                                    <BrandingPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/credentials">
                            <AdminCheck>
                                <AdminLayout>
                                    <CredentialsPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/routes">
                            <AdminCheck>
                                <AdminLayout>
                                    <RoutesPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/webhooks">
                            <AdminCheck>
                                <AdminLayout>
                                    <WebhooksPage />
                                </AdminLayout>
                            </AdminCheck>
                        </Route>
                        <Route path="/admin/messages">
                            <AdminCheck>
                                <AdminLayout>
                                    <MessagesPage />
                                </AdminLayout>
                            </AdminCheck>
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
                            <RootRedirect />
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
