import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Mail, Users, Target, Eye, MousePointer } from 'lucide-react'
import { OutreachLayout } from '../../components/outreach/OutreachLayout'

interface AnalyticsData {
    overview: {
        totalCampaigns: number
        activeCampaigns: number
        totalLeads: number
        totalEmailsSent: number
        totalOpens: number
        totalClicks: number
        totalReplies: number
        totalBounces: number
        avgOpenRate: number
        avgClickRate: number
        avgReplyRate: number
        avgBounceRate: number
    }
}

type DailyStat = {
    date: string
    emailsSent: number
    opens: number
    clicks: number
    replies: number
}

type StatColor = 'blue' | 'green' | 'purple' | 'orange' | 'red'

async function fetchAnalytics(): Promise<AnalyticsData> {
    const response = await fetch('/api/outreach/campaigns/analytics')
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
}

async function fetchDailyStats(): Promise<DailyStat[]> {
    const response = await fetch('/api/outreach/campaigns/analytics/daily')
    if (!response.ok) throw new Error('Failed to fetch daily stats')
    return response.json()
}

function StatCard({
    title,
    value,
    change,
    icon,
    color = 'blue',
}: {
    title: string
    value: string | number
    change?: number
    icon: ReactNode
    color?: StatColor
}) {
    const colorClasses: Record<StatColor, string> = {
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        purple: 'text-purple-600 dark:text-purple-400',
        orange: 'text-orange-600 dark:text-orange-400',
        red: 'text-red-600 dark:text-red-400',
    }

    const displayValue = typeof value === 'number' ? value.toLocaleString() : value

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayValue}</p>
                    {change !== undefined && (
                        <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </p>
                    )}
                </div>
                <div className={`rounded-lg bg-gray-100 p-2 dark:bg-gray-700 ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function MiniChart({
    data,
    title,
    color = 'blue',
}: {
    data: { name: string; value: number }[]
    title: string
    color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
    const max = Math.max(...data.map((d) => d.value))
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
            <div className="mt-2 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="w-20 text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                        <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            <div
                                className={`h-2 rounded-full ${colorClasses[color]}`}
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function AnalyticsPage() {
    const { data: overview, isLoading: overviewLoading } = useQuery({
        queryKey: ['outreach-analytics'],
        queryFn: fetchAnalytics,
    })

    const { data: dailyStats, isLoading: dailyLoading } = useQuery({
        queryKey: ['outreach-daily-stats'],
        queryFn: fetchDailyStats,
    })

    return (
        <OutreachLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Track your cold email campaign performance
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                        <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                            <option value="all">All Campaigns</option>
                        </select>
                    </div>
                </div>

                {overviewLoading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse dark:border-gray-700 dark:bg-gray-800">
                                <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : overview?.overview && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Active Campaigns"
                            value={overview.overview.activeCampaigns}
                            icon={<Target className="h-6 w-6" />}
                            color="blue"
                        />
                        <StatCard
                            title="Total Leads"
                            value={overview.overview.totalLeads.toLocaleString()}
                            icon={<Users className="h-6 w-6" />}
                            color="green"
                        />
                        <StatCard
                            title="Emails Sent"
                            value={overview.overview.totalEmailsSent.toLocaleString()}
                            icon={<Mail className="h-6 w-6" />}
                            color="purple"
                        />
                        <StatCard
                            title="Avg Open Rate"
                            value={`${overview.overview.avgOpenRate.toFixed(1)}%`}
                            icon={<Eye className="h-6 w-6" />}
                            color="orange"
                            change={2.5}
                        />
                    </div>
                )}

                {overview?.overview && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <StatCard
                            title="Avg Click Rate"
                            value={`${overview.overview.avgClickRate.toFixed(1)}%`}
                            icon={<MousePointer className="h-5 w-5" />}
                            color="blue"
                        />
                        <StatCard
                            title="Avg Reply Rate"
                            value={`${overview.overview.avgReplyRate.toFixed(1)}%`}
                            icon={<TrendingUp className="h-5 w-5" />}
                            color="green"
                        />
                        <StatCard
                            title="Avg Bounce Rate"
                            value={`${overview.overview.avgBounceRate.toFixed(1)}%`}
                            icon={<Target className="h-5 w-5" />}
                            color="red"
                            change={-0.5}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <MiniChart
                        title="Emails Sent Over Time"
                        data={[
                            { name: 'Mon', value: 120 },
                            { name: 'Tue', value: 150 },
                            { name: 'Wed', value: 180 },
                            { name: 'Thu', value: 220 },
                            { name: 'Fri', value: 200 },
                            { name: 'Sat', value: 80 },
                            { name: 'Sun', value: 60 },
                        ]}
                        color="blue"
                    />
                    <MiniChart
                        title="Open Rate by Day"
                        data={[
                            { name: 'Mon', value: 45 },
                            { name: 'Tue', value: 52 },
                            { name: 'Wed', value: 48 },
                            { name: 'Thu', value: 55 },
                            { name: 'Fri', value: 50 },
                            { name: 'Sat', value: 42 },
                            { name: 'Sun', value: 38 },
                        ]}
                        color="green"
                    />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Daily Performance</h3>
                    </div>
                    {dailyLoading ? (
                        <div className="space-y-3 p-4">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                </div>
                            ))}
                        </div>
                    ) : dailyStats && dailyStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sent</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Opens</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Clicks</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Replies</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyStats.map((stat, index) => (
                                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {new Date(stat.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{stat.emailsSent}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{stat.opens}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{stat.clicks}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{stat.replies}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No daily stats available
                        </div>
                    )}
                </div>
            </div>
        </OutreachLayout>
    )
}

export default AnalyticsPage
