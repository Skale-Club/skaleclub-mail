import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { supabase } from '../../lib/supabase'
import { BarChart2, Mail, CheckCircle, MousePointer, AlertCircle, Eye, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServerOption {
    id: string
    name: string
    slug: string
    organizationName: string
}

interface DailyStat {
    date: string
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    held: number
}

interface Summary {
    total: number
    sent: number
    delivered: number
    bounced: number
    held: number
    pending: number
    opened: number
    clicked: number
}

interface Rates {
    deliveryRate: number
    openRate: number
    clickRate: number
    bounceRate: number
}

interface RecentMessage {
    id: string
    subject: string | null
    fromAddress: string
    toAddresses: string[]
    status: string
    direction: string
    openedAt: string | null
    sentAt: string | null
    deliveredAt: string | null
    createdAt: string
}

interface Analytics {
    summary: Summary
    rates: Rates
    daily: DailyStat[]
    recentMessages: RecentMessage[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pct(value: number) {
    return `${value.toFixed(1)}%`
}

function formatDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString()
}

function formatShortDate(d: string) {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getStatusColor(status: string) {
    switch (status) {
        case 'delivered':  return 'bg-green-100 text-green-800'
        case 'sent':       return 'bg-blue-100 text-blue-800'
        case 'bounced':
        case 'failed':     return 'bg-red-100 text-red-800'
        case 'held':       return 'bg-yellow-100 text-yellow-800'
        default:           return 'bg-gray-100 text-gray-800'
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
    const [servers, setServers] = useState<ServerOption[]>([])
    const [selectedServerId, setSelectedServerId] = useState('')
    const [days, setDays] = useState(30)
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchServers()
    }, [])

    useEffect(() => {
        if (selectedServerId) fetchAnalytics()
    }, [selectedServerId, days])

    async function getToken() {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token
    }

    async function fetchServers() {
        try {
            const token = await getToken()
            // Fetch all orgs, then all servers per org
            const orgsRes = await fetch('/api/organizations', {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            if (!orgsRes.ok) return
            const { organizations } = await orgsRes.json()

            const allServers: ServerOption[] = []
            await Promise.all(
                (organizations || []).map(async (org: { id: string; name: string }) => {
                    const sRes = await fetch(`/api/servers?organizationId=${org.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    })
                    if (sRes.ok) {
                        const { servers: list } = await sRes.json()
                        for (const s of list || []) {
                            allServers.push({ id: s.id, name: s.name, slug: s.slug, organizationName: org.name })
                        }
                    }
                })
            )
            setServers(allServers)
            if (allServers.length > 0) setSelectedServerId(allServers[0].id)
        } catch (err) {
            console.error('Error fetching servers:', err)
        }
    }

    async function fetchAnalytics() {
        if (!selectedServerId) return
        setIsLoading(true)
        try {
            const token = await getToken()
            const res = await fetch(`/api/servers/${selectedServerId}/statistics?days=${days}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setAnalytics(data)
            }
        } catch (err) {
            console.error('Error fetching analytics:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Build bar chart data: use daily stats if available, else an empty array
    const dailyData = analytics?.daily ?? []
    const maxBarValue = dailyData.length
        ? Math.max(...dailyData.map((d) => d.sent + d.bounced), 1)
        : 1

    const { summary, rates } = analytics ?? { summary: null, rates: null }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground">Open rates, click rates and delivery stats</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Server selector */}
            <Card>
                <CardContent className="pt-4">
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedServerId}
                        onChange={(e) => setSelectedServerId(e.target.value)}
                    >
                        <option value="">Select a server…</option>
                        {servers.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.organizationName} / {s.name}
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            )}

            {!isLoading && analytics && (
                <>
                    {/* Summary cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                            label="Total Sent"
                            value={summary!.sent}
                            sub={`${summary!.total} total messages`}
                        />
                        <MetricCard
                            icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                            label="Delivery Rate"
                            value={pct(rates!.deliveryRate)}
                            sub={`${summary!.delivered} delivered`}
                            progress={rates!.deliveryRate}
                            progressColor="bg-green-500"
                        />
                        <MetricCard
                            icon={<Eye className="h-4 w-4 text-blue-500" />}
                            label="Open Rate"
                            value={pct(rates!.openRate)}
                            sub={`${summary!.opened} opened`}
                            progress={rates!.openRate}
                            progressColor="bg-blue-500"
                        />
                        <MetricCard
                            icon={<MousePointer className="h-4 w-4 text-violet-500" />}
                            label="Click Rate"
                            value={pct(rates!.clickRate)}
                            sub={`${summary!.clicked} clicks`}
                            progress={rates!.clickRate}
                            progressColor="bg-violet-500"
                        />
                        <MetricCard
                            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                            label="Bounce Rate"
                            value={pct(rates!.bounceRate)}
                            sub={`${summary!.bounced} bounced`}
                            progress={rates!.bounceRate}
                            progressColor="bg-red-500"
                        />
                        <MetricCard
                            icon={<BarChart2 className="h-4 w-4 text-yellow-500" />}
                            label="Held"
                            value={summary!.held}
                            sub="Waiting for release"
                        />
                        <MetricCard
                            icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
                            label="Pending / Queued"
                            value={summary!.pending}
                            sub="In pipeline"
                        />
                    </div>

                    {/* Daily bar chart */}
                    {dailyData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Daily Activity</CardTitle>
                                <CardDescription>Sent, opened and bounced per day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
                                    {dailyData.map((day) => (
                                        <div
                                            key={day.date}
                                            className="flex flex-col items-center gap-0.5 flex-shrink-0"
                                            style={{ minWidth: 28 }}
                                            title={`${formatShortDate(day.date)}\nSent: ${day.sent}\nOpened: ${day.opened}\nBounced: ${day.bounced}`}
                                        >
                                            {/* stacked: sent (blue) + bounced (red) */}
                                            <div className="flex flex-col justify-end w-5 gap-px" style={{ height: 100 }}>
                                                <div
                                                    className="w-full rounded-t bg-red-400"
                                                    style={{ height: `${(day.bounced / maxBarValue) * 100}%`, minHeight: day.bounced > 0 ? 2 : 0 }}
                                                />
                                                <div
                                                    className="w-full bg-blue-400"
                                                    style={{ height: `${((day.sent - day.bounced) / maxBarValue) * 100}%`, minHeight: day.sent > 0 ? 2 : 0 }}
                                                />
                                                <div
                                                    className="w-full rounded-b bg-green-400"
                                                    style={{ height: `${(day.opened / maxBarValue) * 100}%`, minHeight: day.opened > 0 ? 2 : 0 }}
                                                />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground rotate-45 origin-left mt-1">
                                                {formatShortDate(day.date)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Sent</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Opened</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Bounced</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {dailyData.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                No daily data yet. Stats are recorded as messages are sent and opened.
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Messages</CardTitle>
                            <CardDescription>Last 20 messages — eye icon indicates opened</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border text-sm">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Subject</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">From</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Opened</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sent</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {analytics.recentMessages.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                    No messages yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            analytics.recentMessages.map((msg) => (
                                                <tr key={msg.id} className="hover:bg-muted/30">
                                                    <td className="px-4 py-2">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(msg.status)}`}>
                                                            {msg.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 max-w-[200px] truncate" title={msg.subject ?? ''}>
                                                        {msg.subject || <span className="text-muted-foreground">(no subject)</span>}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground truncate max-w-[160px]">
                                                        {msg.fromAddress}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {msg.openedAt ? (
                                                            <span className="flex items-center gap-1 text-blue-600" title={formatDate(msg.openedAt)}>
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span className="text-xs">{formatDate(msg.openedAt)}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground text-xs">{formatDate(msg.sentAt)}</td>
                                                    <td className="px-4 py-2 text-muted-foreground text-xs">{formatDate(msg.createdAt)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {!isLoading && !analytics && selectedServerId && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No data found for this server.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function MetricCard({
    icon,
    label,
    value,
    sub,
    progress,
    progressColor,
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    sub: string
    progress?: number
    progressColor?: string
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                {progress !== undefined && (
                    <Progress
                        value={progress}
                        className="mt-2 h-1.5"
                        indicatorClassName={progressColor}
                    />
                )}
            </CardContent>
        </Card>
    )
}
