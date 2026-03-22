import { useEffect, useState } from 'react'
import { Building2, Server, Globe, Users, Mail, TrendingUp, AlertCircle, CheckCircle, HardDrive } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

interface DashboardStats {
    organizations: number
    servers: number
    domains: number
    users: number
    messages: {
        sent: number
        delivered: number
        bounced: number
        pending: number
    }
}

interface UserUsage {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    messageCount: number
    attachmentBytes: number
}

interface SystemUsage {
    storage: {
        used: number
        limit: number
    }
    users: UserUsage[]
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats>({
        organizations: 0,
        servers: 0,
        domains: 0,
        users: 0,
        messages: { sent: 0, delivered: 0, bounced: 0, pending: 0 },
    })
    const [systemUsage, setSystemUsage] = useState<SystemUsage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [usageLoading, setUsageLoading] = useState(true)

    useEffect(() => {
        void fetchStats()
        void fetchUsage()
    }, [])

    async function fetchStats() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            const headers = { Authorization: `Bearer ${token}` }

            const orgResponse = await fetch('/api/organizations', { headers })
            const userResponse = await fetch('/api/users', { headers })

            const orgPayload = orgResponse.ok ? await orgResponse.json() : { organizations: [] }
            const userPayload = userResponse.ok ? await userResponse.json() : { users: [] }
            const organizations = orgPayload.organizations || []

            const organizationsCount = organizations.length
            const serversCount = organizations.reduce(
                (total: number, org: { servers?: unknown[] }) => total + (org.servers?.length || 0),
                0
            )

            setStats({
                organizations: organizationsCount,
                servers: serversCount,
                domains: 0,
                users: (userPayload.users || []).length,
                messages: { sent: 0, delivered: 0, bounced: 0, pending: 0 },
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchUsage() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            const response = await fetch('/api/system/usage', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setSystemUsage(data)
            }
        } catch (error) {
            console.error('Error fetching usage:', error)
        } finally {
            setUsageLoading(false)
        }
    }

    const storagePercent = systemUsage
        ? Math.min(100, (systemUsage.storage.used / systemUsage.storage.limit) * 100)
        : 0

    const maxUserMessages = systemUsage?.users.length
        ? Math.max(...systemUsage.users.map((u) => u.messageCount), 1)
        : 1

    const maxUserBytes = systemUsage?.users.length
        ? Math.max(...systemUsage.users.map((u) => u.attachmentBytes), 1)
        : 1

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.user_metadata?.firstName || user?.email}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/admin/organizations'}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Organizations
                    </Button>
                    <Button onClick={() => window.location.href = '/admin/servers'}>
                        <Server className="mr-2 h-4 w-4" />
                        Servers
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.organizations}</div>
                        <p className="text-xs text-muted-foreground">Active organizations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Servers</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.servers}</div>
                        <p className="text-xs text-muted-foreground">Mail servers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Domains</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.domains}</div>
                        <p className="text-xs text-muted-foreground">Verified domains</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messages.sent}</div>
                        <p className="text-xs text-muted-foreground">Messages sent</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messages.delivered}</div>
                        <p className="text-xs text-muted-foreground">Successfully delivered</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bounced</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messages.bounced}</div>
                        <p className="text-xs text-muted-foreground">Failed deliveries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messages.pending}</div>
                        <p className="text-xs text-muted-foreground">In queue</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            System Storage
                        </CardTitle>
                        <CardDescription>Supabase object storage usage</CardDescription>
                    </div>
                    {systemUsage && (
                        <span className="text-sm text-muted-foreground">
                            {formatBytes(systemUsage.storage.used)} / {formatBytes(systemUsage.storage.limit)}
                        </span>
                    )}
                </CardHeader>
                <CardContent>
                    {usageLoading ? (
                        <div className="h-4 animate-pulse rounded-full bg-muted" />
                    ) : (
                        <>
                            <Progress
                                value={storagePercent}
                                indicatorClassName={
                                    storagePercent > 90
                                        ? 'bg-red-500'
                                        : storagePercent > 70
                                            ? 'bg-yellow-500'
                                            : 'bg-primary'
                                }
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {storagePercent.toFixed(1)}% used
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Usage per User
                    </CardTitle>
                    <CardDescription>Message count and attachment storage per user</CardDescription>
                </CardHeader>
                <CardContent>
                    {usageLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-1">
                                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                                    <div className="h-2 animate-pulse rounded-full bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : !systemUsage?.users.length ? (
                        <p className="text-sm text-muted-foreground">No users found.</p>
                    ) : (
                        <div className="space-y-5">
                            {systemUsage.users.map((u) => {
                                const msgPercent = (u.messageCount / maxUserMessages) * 100
                                const bytesPercent = (u.attachmentBytes / maxUserBytes) * 100
                                const displayName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
                                return (
                                    <div key={u.id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="max-w-[200px] truncate font-medium" title={u.email}>
                                                {displayName}
                                            </span>
                                            <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                                                {u.messageCount} msg | {formatBytes(u.attachmentBytes)}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-20 shrink-0 text-xs text-muted-foreground">Messages</span>
                                                <Progress value={msgPercent} className="flex-1" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-20 shrink-0 text-xs text-muted-foreground">Attachments</span>
                                                <Progress value={bytesPercent} className="flex-1" indicatorClassName="bg-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks to get started quickly</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/admin/organizations'}>
                            <Building2 className="mr-2 h-4 w-4" />
                            View Organizations
                        </Button>
                        <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/admin/users'}>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Users
                        </Button>
                        <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/admin/analytics'}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Open Analytics
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
            )}
        </div>
    )
}
