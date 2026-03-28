import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch, useLocation } from 'wouter'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { MailboxProvider } from './hooks/useMailbox'
import { useCompose } from './hooks/useCompose'
import { useBranding } from './lib/branding'
import AdminLayout from './components/admin/AdminLayout'
import { OrganizationProvider } from './hooks/useOrganization'
import { ComposeProvider } from './hooks/useCompose'
import './index.css'

const Login = React.lazy(() => import('./pages/Login'))

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'))
const OrganizationsPage = React.lazy(() => import('./pages/admin/OrganizationsPage'))
const OrganizationDetailPage = React.lazy(() => import('./pages/admin/OrganizationDetailPage'))
const AdminsPage = React.lazy(() => import('./pages/admin/AdminsPage'))
const BrandingPage = React.lazy(() => import('./pages/admin/BrandingPage'))
const CredentialsPage = React.lazy(() => import('./pages/admin/CredentialsPage'))
const RoutesPage = React.lazy(() => import('./pages/admin/RoutesPage'))
const WebhooksPage = React.lazy(() => import('./pages/admin/WebhooksPage'))
const MessagesPage = React.lazy(() => import('./pages/admin/MessagesPage'))

const OutreachDashboard = React.lazy(() => import('./pages/outreach/OutreachDashboard'))
const CampaignsPage = React.lazy(() => import('./pages/outreach/CampaignsPage'))
const LeadsPage = React.lazy(() => import('./pages/outreach/LeadsPage'))
const InboxesPage = React.lazy(() => import('./pages/outreach/InboxesPage'))
const NewInboxPage = React.lazy(() => import('./pages/outreach/inboxes/NewInboxPage'))
const SequencesPage = React.lazy(() => import('./pages/outreach/SequencesPage'))
const OutreachAnalyticsPage = React.lazy(() => import('./pages/outreach/AnalyticsPage'))
const OutreachSettingsPage = React.lazy(() => import('./pages/outreach/SettingsPage'))

const InboxPage = React.lazy(() => import('./pages/mail/InboxPage'))
const SentPage = React.lazy(() => import('./pages/mail/SentPage'))
const DraftsPage = React.lazy(() => import('./pages/mail/DraftsPage'))
const TrashPage = React.lazy(() => import('./pages/mail/TrashPage'))
const StarredPage = React.lazy(() => import('./pages/mail/StarredPage'))
const SpamPage = React.lazy(() => import('./pages/mail/SpamPage'))
const ArchivePage = React.lazy(() => import('./pages/mail/ArchivePage'))
const ContactsPage = React.lazy(() => import('./pages/mail/ContactsPage'))
const ComposePage = React.lazy(() => import('./pages/mail/ComposePage'))
const MailSettingsPage = React.lazy(() => import('./pages/mail/SettingsPage'))
const SearchPage = React.lazy(() => import('./pages/mail/SearchPage'))
const EmailDetailPage = React.lazy(() => import('./pages/mail/EmailDetailPage'))
const LazyComposeDialog = React.lazy(() =>
    import('./components/mail/ComposeDialog').then((module) => ({ default: module.ComposeDialog }))
)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof Error && error.message === 'Unauthorized') return false
                if (error instanceof Error && error.message.includes('Too many requests')) return false
                return failureCount < 2
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

function AdminCheck({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, isLoading } = useAuth()
    const [, navigate] = useLocation()

    if (isLoading) return <Spinner />

    if (!user) {
        navigate('/login')
        return null
    }

    if (isAdmin === null) return <Spinner />

    if (!isAdmin) {
        navigate('/mail/inbox')
        return null
    }

    return <>{children}</>
}

function MailCheck({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, isLoading } = useAuth()
    const [, navigate] = useLocation()

    if (isLoading) return <Spinner />

    if (!user) {
        navigate('/login')
        return null
    }

    if (isAdmin === null) return <Spinner />

    if (isAdmin) {
        navigate('/admin')
        return null
    }

    return <>{children}</>
}

function RootRedirect() {
    const { user, isAdmin, isLoading } = useAuth()
    const [, navigate] = useLocation()

    if (isLoading) return <Spinner />

    if (!user) {
        navigate('/login')
        return null
    }

    if (isAdmin === null) return <Spinner />

    navigate(isAdmin ? '/admin' : '/mail/inbox')
    return null
}

function BrandingHead() {
    const { branding, isSuccess } = useBranding()

    const applyBranding = React.useCallback(() => {
        document.title = branding.applicationName

        const faviconUrl = new URL(branding.faviconUrl, window.location.origin)
        faviconUrl.searchParams.set('v', window.btoa(branding.faviconUrl).replace(/[+/=]/g, '').slice(0, 16))

        const faviconType = (() => {
            const pathname = faviconUrl.pathname.toLowerCase()

            if (pathname.endsWith('.svg')) return 'image/svg+xml'
            if (pathname.endsWith('.png')) return 'image/png'
            if (pathname.endsWith('.webp')) return 'image/webp'
            if (pathname.endsWith('.ico')) return 'image/x-icon'

            return undefined
        })()

        for (const link of document.head.querySelectorAll("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")) {
            if ((link as HTMLLinkElement).dataset.managedBrandingIcon !== 'true') {
                link.remove()
            }
        }

        const descriptors = [
            { key: 'icon', rel: 'icon' },
            { key: 'shortcut', rel: 'shortcut icon' },
            { key: 'apple', rel: 'apple-touch-icon' },
        ] as const

        for (const descriptor of descriptors) {
            const link = document.createElement('link')
            link.dataset.managedBrandingIcon = 'true'
            link.dataset.iconKey = descriptor.key
            link.rel = descriptor.rel
            link.href = faviconUrl.toString()

            if (faviconType) {
                link.type = faviconType
            }

            if (faviconType === 'image/svg+xml' && descriptor.rel !== 'apple-touch-icon') {
                link.sizes = 'any'
            }

            const existing = document.head.querySelector(
                `link[data-managed-branding-icon="true"][data-icon-key="${descriptor.key}"]`
            )

            if (existing) {
                existing.replaceWith(link)
            } else {
                document.head.appendChild(link)
            }
        }
    }, [branding.applicationName, branding.faviconUrl])

    React.useEffect(() => {
        if (!isSuccess) return

        applyBranding()

        const handleVisibilityRestore = () => {
            if (document.visibilityState === 'hidden') return
            applyBranding()
        }

        document.addEventListener('visibilitychange', handleVisibilityRestore)
        window.addEventListener('pageshow', handleVisibilityRestore)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityRestore)
            window.removeEventListener('pageshow', handleVisibilityRestore)
        }
    }, [applyBranding, isSuccess])

    return null
}

function ComposeDialogHost() {
    const { isOpen } = useCompose()

    if (!isOpen) return null

    return (
        <Suspense fallback={null}>
            <LazyComposeDialog />
        </Suspense>
    )
}

function PageSuspense({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

function App() {
    return (
        <ThemeProvider defaultTheme="system">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MailboxProvider>
                        <ComposeProvider>
                            <BrandingHead />
                            <div className="min-h-screen bg-background">
                                <Switch>
                                <Route path="/login">
                                    <PageSuspense><Login /></PageSuspense>
                                </Route>

                                <Route path="/admin">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><AdminDashboard /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/organizations">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><OrganizationsPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/organizations/:id">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><OrganizationDetailPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/admins">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><AdminsPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/branding">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><BrandingPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/credentials">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><CredentialsPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/routes">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><RoutesPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/webhooks">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><WebhooksPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>
                                <Route path="/admin/messages">
                                    <AdminCheck>
                                        <AdminLayout>
                                            <PageSuspense><MessagesPage /></PageSuspense>
                                        </AdminLayout>
                                    </AdminCheck>
                                </Route>

                                <Route path="/outreach">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><OutreachDashboard /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/campaigns">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><CampaignsPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/leads">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><LeadsPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/inboxes">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><InboxesPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/inboxes/new">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><NewInboxPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/sequences">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><SequencesPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/sequences/new">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><SequencesPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/analytics">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><OutreachAnalyticsPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>
                                <Route path="/outreach/settings">
                                    <AdminCheck>
                                        <OrganizationProvider>
                                            <PageSuspense><OutreachSettingsPage /></PageSuspense>
                                        </OrganizationProvider>
                                    </AdminCheck>
                                </Route>

                                <Route path="/mail/inbox">
                                    <MailCheck>
                                        <PageSuspense><InboxPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/sent">
                                    <MailCheck>
                                        <PageSuspense><SentPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/drafts">
                                    <MailCheck>
                                        <PageSuspense><DraftsPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/trash">
                                    <MailCheck>
                                        <PageSuspense><TrashPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/starred">
                                    <MailCheck>
                                        <PageSuspense><StarredPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/spam">
                                    <MailCheck>
                                        <PageSuspense><SpamPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/archive">
                                    <MailCheck>
                                        <PageSuspense><ArchivePage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/contacts">
                                    <MailCheck>
                                        <PageSuspense><ContactsPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/:folder/:id">
                                    <MailCheck>
                                        <PageSuspense><EmailDetailPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/compose">
                                    <MailCheck>
                                        <PageSuspense><ComposePage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/settings">
                                    <MailCheck>
                                        <PageSuspense><MailSettingsPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail/search">
                                    <MailCheck>
                                        <PageSuspense><SearchPage /></PageSuspense>
                                    </MailCheck>
                                </Route>
                                <Route path="/mail">
                                    <MailCheck>
                                        <PageSuspense><InboxPage /></PageSuspense>
                                    </MailCheck>
                                </Route>

                                <Route path="/">
                                    <RootRedirect />
                                </Route>
                            </Switch>
                            <Toaster />
                            <ComposeDialogHost />
                        </div>
                        </ComposeProvider>
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
