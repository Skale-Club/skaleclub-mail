import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { MailboxProvider } from './hooks/useMailbox'
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

import { OrganizationProvider } from './hooks/useOrganization'
import { CampaignsPage } from './pages/outreach/CampaignsPage'
import { LeadsPage } from './pages/outreach/LeadsPage'
import { InboxesPage } from './pages/outreach/InboxesPage'
import { NewInboxPage } from './pages/outreach/inboxes/NewInboxPage'
import { SequencesPage } from './pages/outreach/SequencesPage'
import { NewSequencePage } from './pages/outreach/sequences/NewSequencePage'
import { AnalyticsPage as OutreachAnalyticsPage } from './pages/outreach/AnalyticsPage'
import { SettingsPage as OutreachSettingsPage } from './pages/outreach/SettingsPage'

import InboxPage from './pages/mail/InboxPage'
import SentPage from './pages/mail/SentPage'
import DraftsPage from './pages/mail/DraftsPage'
import TrashPage from './pages/mail/TrashPage'
import StarredPage from './pages/mail/StarredPage'
import SpamPage from './pages/mail/SpamPage'
import ArchivePage from './pages/mail/ArchivePage'
import ContactsPage from './pages/mail/ContactsPage'
import ComposePage from './pages/mail/ComposePage'
import MailSettingsPage from './pages/mail/SettingsPage'
import SearchPage from './pages/mail/SearchPage'
import EmailDetailPage from './pages/mail/EmailDetailPage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof Error && error.message === 'Unauthorized') return false
                return failureCount < 3
            },
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
})

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

function MailCheck({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, isLoading } = useAuth()

    if (isLoading) return <Spinner />

    if (!user) {
        window.location.href = '/login'
        return null
    }

    if (isAdmin) {
        window.location.href = '/admin'
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
                <AuthProvider>
                    <MailboxProvider>
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
                            <AdminCheck>
                                <OrganizationProvider>
                                    <OutreachDashboard />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/campaigns">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <CampaignsPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/leads">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <LeadsPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/inboxes">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <InboxesPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/inboxes/new">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <NewInboxPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/sequences">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <SequencesPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/sequences/new">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <NewSequencePage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/analytics">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <OutreachAnalyticsPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>
                        <Route path="/outreach/settings">
                            <AdminCheck>
                                <OrganizationProvider>
                                    <OutreachSettingsPage />
                                </OrganizationProvider>
                            </AdminCheck>
                        </Route>

                        <Route path="/mail/inbox">
                            <MailCheck>
                                <InboxPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/sent">
                            <MailCheck>
                                <SentPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/drafts">
                            <MailCheck>
                                <DraftsPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/trash">
                            <MailCheck>
                                <TrashPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/starred">
                            <MailCheck>
                                <StarredPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/spam">
                            <MailCheck>
                                <SpamPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/archive">
                            <MailCheck>
                                <ArchivePage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/contacts">
                            <MailCheck>
                                <ContactsPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/:folder/:id">
                            <MailCheck>
                                <EmailDetailPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/compose">
                            <MailCheck>
                                <ComposePage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/settings">
                            <MailCheck>
                                <MailSettingsPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail/search">
                            <MailCheck>
                                <SearchPage />
                            </MailCheck>
                        </Route>
                        <Route path="/mail">
                            <MailCheck>
                                <InboxPage />
                            </MailCheck>
                        </Route>

                        <Route path="/">
                            <RootRedirect />
                        </Route>
                            </Switch>
                            <Toaster />
                        </div>
                    </MailboxProvider>
                </AuthProvider>
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
