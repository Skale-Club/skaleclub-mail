import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'wouter'
import {
    Plus,
    Search,
    Filter,
    Upload,
    MoreVertical,
    Mail,
    Building,
    Trash2,
    Users,
    UserPlus,
    FileText
} from 'lucide-react'
import { OutreachLayout } from '../../components/outreach/OutreachLayout'

interface Lead {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    company: string | null
    title: string | null
    phone: string | null
    linkedinUrl: string | null
    status: string
    leadListId: string | null
    leadListName: string | null
    totalEmailsSent: number
    totalOpens: number
    totalClicks: number
    totalReplies: number
    createdAt: string
}

interface LeadList {
    id: string
    name: string
    leadCount: number
}

interface LeadsResponse {
    leads: Lead[]
    total: number
}

async function fetchLeads(params: { status?: string; listId?: string; search?: string }): Promise<LeadsResponse> {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'all') query.set('status', params.status)
    if (params.listId && params.listId !== 'all') query.set('listId', params.listId)
    if (params.search) query.set('search', params.search)

    const response = await fetch(`/api/outreach/leads?${query.toString()}`, { cache: 'no-store' })
    if (!response.ok) throw new Error('Failed to fetch leads')
    return response.json()
}

async function fetchLeadLists(): Promise<LeadList[]> {
    const response = await fetch('/api/outreach/leads/lists', { cache: 'no-store' })
    if (!response.ok) throw new Error('Failed to fetch lead lists')
    return response.json()
}

async function deleteLead(id: string): Promise<void> {
    const response = await fetch(`/api/outreach/leads/${id}`, {
        cache: 'no-store',
        method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete lead')
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    replied: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    interested: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    not_interested: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    bounced: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    unsubscribed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
}

function LeadRow({ lead, onDelete }: { lead: Lead; onDelete: (id: string) => void }) {
    const [showMenu, setShowMenu] = React.useState(false)
    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email

    return (
        <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                    </div>
                </div>
            </td>
            <td className="py-3 px-4">
                {lead.company && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{lead.company}</span>
                    </div>
                )}
                {lead.title && <p className="text-xs text-gray-500 dark:text-gray-500">{lead.title}</p>}
            </td>
            <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status] || statusColors.new}`}>
                    {lead.status.replace('_', ' ')}
                </span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                {lead.totalEmailsSent}
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                {lead.totalOpens}
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                {lead.totalReplies}
            </td>
            <td className="py-3 px-4">
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
                            <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                <Link
                                    href={`/outreach/leads/${lead.id}`}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <FileText className="w-4 h-4" /> View Details
                                </Link>
                                <button
                                    onClick={() => { onDelete(lead.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}

export function LeadsPage() {
    const [search, setSearch] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState('all')
    const [listFilter, setListFilter] = React.useState('all')
    const [selectedLeads, setSelectedLeads] = React.useState<string[]>([])
    const queryClient = useQueryClient()

    const { data: leadsData, isLoading: leadsLoading } = useQuery({
        queryKey: ['leads', statusFilter, listFilter, search],
        queryFn: () => fetchLeads({ status: statusFilter, listId: listFilter, search }),
    })

    const { data: leadLists } = useQuery({
        queryKey: ['lead-lists'],
        queryFn: fetchLeadLists,
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteLead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] })
        },
    })

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleSelectAll = () => {
        if (leadsData?.leads) {
            if (selectedLeads.length === leadsData.leads.length) {
                setSelectedLeads([])
            } else {
                setSelectedLeads(leadsData.leads.map(l => l.id))
            }
        }
    }

    return (
        <OutreachLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your prospects and lead lists
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/outreach/leads/import"
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Upload className="w-5 h-5" />
                            Import
                        </Link>
                        <Link
                            href="/outreach/leads/new"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Lead
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {leadsData?.total || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Contacted</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {leadsData?.leads?.filter(l => l.status === 'contacted').length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Interested</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {leadsData?.leads?.filter(l => l.status === 'interested').length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Lead Lists</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {leadLists?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads by name or email..."
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
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="replied">Replied</option>
                            <option value="interested">Interested</option>
                            <option value="not_interested">Not Interested</option>
                            <option value="bounced">Bounced</option>
                            <option value="unsubscribed">Unsubscribed</option>
                        </select>
                        <select
                            value={listFilter}
                            onChange={(e) => setListFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Lists</option>
                            {leadLists?.map(list => (
                                <option key={list.id} value={list.id}>{list.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedLeads.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                            {selectedLeads.length} lead(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                Add to Campaign
                            </button>
                            <button className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                Add to List
                            </button>
                            <button className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30">
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* Leads Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {leadsLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-4">
                                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : leadsData?.leads && leadsData.leads.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-3 px-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.length === leadsData.leads.length}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 dark:border-gray-600"
                                            />
                                        </th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Company</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Emails</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Opens</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Replies</th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leadsData.leads.map((lead) => (
                                        <LeadRow key={lead.id} lead={lead} onDelete={handleDelete} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {search || statusFilter !== 'all' || listFilter !== 'all' ? 'No leads found' : 'No leads yet'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {search || statusFilter !== 'all' || listFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Import or add leads to start your outreach campaigns'
                                }
                            </p>
                            {!search && statusFilter === 'all' && listFilter === 'all' && (
                                <div className="flex items-center justify-center gap-2">
                                    <Link
                                        href="/outreach/leads/import"
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Import Leads
                                    </Link>
                                    <Link
                                        href="/outreach/leads/new"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Lead
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </OutreachLayout>
    )
}

export default LeadsPage
