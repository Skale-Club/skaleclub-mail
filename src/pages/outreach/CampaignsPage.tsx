import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'wouter'
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Play,
    Pause,
    Copy,
    Trash2,
    Target,
    Users,
    Mail,
    TrendingUp
} from 'lucide-react'
import { OutreachLayout } from '../../components/outreach/OutreachLayout'

interface Campaign {
    id: string
    name: string
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
    totalLeads: number
    emailsSent: number
    openRate: number
    clickRate: number
    replyRate: number
    bounceRate: number
    createdAt: string
    updatedAt: string
}

interface CampaignsResponse {
    campaigns: Campaign[]
    total: number
}

async function fetchCampaigns(params: { status?: string; search?: string }): Promise<CampaignsResponse> {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'all') query.set('status', params.status)
    if (params.search) query.set('search', params.search)

    const response = await fetch(`/api/outreach/campaigns?${query.toString()}`, { cache: 'no-store' })
    if (!response.ok) throw new Error('Failed to fetch campaigns')
    return response.json()
}

async function updateCampaignStatus(id: string, status: string): Promise<void> {
    const response = await fetch(`/api/outreach/campaigns/${id}/status`, {
        cache: 'no-store',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error('Failed to update campaign')
}

async function deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`/api/outreach/campaigns/${id}`, {
        cache: 'no-store',
        method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete campaign')
}

function CampaignCard({ campaign, onStatusChange, onDelete }: {
    campaign: Campaign
    onStatusChange: (id: string, status: string) => void
    onDelete: (id: string) => void
}) {
    const [showMenu, setShowMenu] = React.useState(false)

    const statusColors: Record<string, string> = {
        active: 'bg-primary/10 text-primary',
        paused: 'bg-secondary text-secondary-foreground',
        draft: 'bg-muted text-muted-foreground',
        completed: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
        archived: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <Link
                        href={`/outreach/campaigns/${campaign.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        {campaign.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[campaign.status]}`}>
                            {campaign.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
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
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                {campaign.status === 'active' && (
                                    <button
                                        onClick={() => { onStatusChange(campaign.id, 'paused'); setShowMenu(false) }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Pause className="w-4 h-4" /> Pause
                                    </button>
                                )}
                                {campaign.status === 'paused' && (
                                    <button
                                        onClick={() => { onStatusChange(campaign.id, 'active'); setShowMenu(false) }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" /> Resume
                                    </button>
                                )}
                                {campaign.status === 'draft' && (
                                    <button
                                        onClick={() => { onStatusChange(campaign.id, 'active'); setShowMenu(false) }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" /> Start
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowMenu(false)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" /> Duplicate
                                </button>
                                <button
                                    onClick={() => { onDelete(campaign.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Users className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.totalLeads}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Leads</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Mail className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.emailsSent}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.openRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Opens</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Target className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.replyRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Replies</p>
                </div>
            </div>
        </div>
    )
}

export function CampaignsPage() {
    const [search, setSearch] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState('all')
    const queryClient = useQueryClient()
    const { data, isLoading } = useQuery({
        queryKey: ['campaigns', statusFilter, search],
        queryFn: () => fetchCampaigns({ status: statusFilter, search }),
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateCampaignStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        },
    })

    const handleStatusChange = (id: string, status: string) => {
        statusMutation.mutate({ id, status })
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <OutreachLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your cold email outreach campaigns
                        </p>
                    </div>
                    <Link
                        href="/outreach/campaigns/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Campaign
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Campaign List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="text-center">
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-12 mb-1"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-8"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : data?.campaigns && data.campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.campaigns.map((campaign) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {search || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {search || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first campaign to start reaching out to leads'
                            }
                        </p>
                        {!search && statusFilter === 'all' && (
                            <Link
                                href="/outreach/campaigns/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </OutreachLayout>
    )
}

export default CampaignsPage
