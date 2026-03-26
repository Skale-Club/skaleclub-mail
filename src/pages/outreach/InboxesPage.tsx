import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'wouter'
import {
    Plus,
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    RefreshCw,
    Trash2,
    Settings,
    Send,
    Inbox,
    AlertCircle
} from 'lucide-react'
import { OutreachLayout } from '../../components/outreach/OutreachLayout'
import { apiFetch, apiRequest } from '../../lib/api-client'

interface EmailAccount {
    id: string
    email: string
    displayName: string | null
    status: 'pending' | 'verified' | 'failed' | 'paused'
    provider: string
    dailyLimit: number
    sentToday: number
    warmupEnabled: boolean
    warmupDay: number
    warmupProgress: number
    lastSyncAt: string | null
    createdAt: string
}

interface EmailAccountsResponse {
    accounts: EmailAccount[]
    total: number
}

async function fetchEmailAccounts(): Promise<EmailAccountsResponse> {
    const data = await apiFetch<{ emailAccounts?: EmailAccount[] }>('/api/outreach/email-accounts')
    return {
        accounts: data.emailAccounts || [],
        total: (data.emailAccounts || []).length,
    }
}

async function verifyEmailAccount(id: string): Promise<void> {
    await apiRequest(`/api/outreach/email-accounts/${id}/verify`, {
        method: 'POST',
    })
}

async function deleteEmailAccount(id: string): Promise<void> {
    await apiRequest(`/api/outreach/email-accounts/${id}`, {
        method: 'DELETE',
    })
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    verified: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Verified'
    },
    pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending'
    },
    failed: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Failed'
    },
    paused: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Paused'
    },
}

function InboxCard({ account, onVerify, onDelete }: {
    account: EmailAccount
    onVerify: (id: string) => void
    onDelete: (id: string) => void
}) {
    const [showMenu, setShowMenu] = React.useState(false)
    const status = statusConfig[account.status] || statusConfig.pending
    const dailyUsage = (account.sentToday / account.dailyLimit) * 100

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.email}</p>
                        {account.displayName && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{account.displayName}</p>
                        )}
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                <Link
                                    href={`/outreach/inboxes/${account.id}`}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Settings className="w-4 h-4" /> Settings
                                </Link>
                                {account.status === 'pending' && (
                                    <button
                                        onClick={() => { onVerify(account.id); setShowMenu(false) }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Verify
                                    </button>
                                )}
                                <button
                                    onClick={() => { onDelete(account.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${status.color}`}>
                    {status.icon}
                    {status.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{account.provider}</span>
            </div>

            {/* Daily Usage */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Daily Usage</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                        {account.sentToday} / {account.dailyLimit}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${dailyUsage >= 90 ? 'bg-red-500' : dailyUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(dailyUsage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Warmup Progress */}
            {account.warmupEnabled && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Warmup Progress</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                            Day {account.warmupDay}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${account.warmupProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{account.sentToday}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sent Today</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{account.dailyLimit}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</p>
                </div>
            </div>
        </div>
    )
}

export function InboxesPage() {
    const queryClient = useQueryClient()

    const { data: accountsData, isLoading } = useQuery({
        queryKey: ['email-accounts'],
        queryFn: fetchEmailAccounts,
    })

    const verifyMutation = useMutation({
        mutationFn: (id: string) => verifyEmailAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-accounts'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteEmailAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-accounts'] })
        },
    })

    const handleVerify = (id: string) => {
        verifyMutation.mutate(id)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this inbox?')) {
            deleteMutation.mutate(id)
        }
    }

    const totalAccounts = accountsData?.total || 0
    const verifiedAccounts = accountsData?.accounts?.filter(a => a.status === 'verified').length || 0
    const totalSentToday = accountsData?.accounts?.reduce((sum, a) => sum + a.sentToday, 0) || 0
    const totalDailyLimit = accountsData?.accounts?.reduce((sum, a) => sum + a.dailyLimit, 0) || 0

    return (
        <OutreachLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inboxes</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your email accounts for cold outreach
                        </p>
                    </div>
                    <Link
                        href="/outreach/inboxes/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Inbox
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Inbox className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Inboxes</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalAccounts}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{verifiedAccounts}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sent Today</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalSentToday}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Limit</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalDailyLimit}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inbox List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : accountsData?.accounts && accountsData.accounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accountsData.accounts.map((account) => (
                            <InboxCard
                                key={account.id}
                                account={account}
                                onVerify={handleVerify}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No inboxes connected
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                            Connect your email accounts to start sending cold emails. You can add Gmail, Outlook,
                            or custom SMTP accounts.
                        </p>
                        <Link
                            href="/outreach/inboxes/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Inbox
                        </Link>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        💡 Tips for Better Deliverability
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Enable warmup for new email accounts to build sender reputation</li>
                        <li>• Keep daily sending limits reasonable (50-100 emails per day per account)</li>
                        <li>• Use multiple inboxes to distribute sending load</li>
                        <li>• Verify your domain and set up SPF, DKIM, and DMARC records</li>
                    </ul>
                </div>
            </div>
        </OutreachLayout>
    )
}

export default InboxesPage
