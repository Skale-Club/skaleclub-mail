import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'wouter'
import {
    Plus,
    Play,
    Clock,
    Mail,
    Edit3,
    Copy,
    Trash2,
    ChevronDown,
    GripVertical,
    Save,
    ArrowUp,
    ArrowDown
} from 'lucide-react'
import { OutreachLayout } from '../../components/outreach/OutreachLayout'

interface Sequence {
    id: string
    campaignId: string
    name: string
    type: 'email' | 'delay'
    order: number
    delayDays: number
    subject: string | null
    bodyHtml: string | null
    bodyText: string | null
    trackOpens: boolean
    trackClicks: boolean
    isActive: boolean
    createdAt: string
}

interface SequenceStep {
    id: string
    sequenceId: string
    order: number
    type: 'email' | 'delay'
    delayDays: number
    delayHours: number
    subject: string | null
    bodyHtml: string | null
    bodyText: string | null
    trackOpens: boolean
    trackClicks: boolean
}

interface SequenceResponse {
    sequence: Sequence
    steps: SequenceStep[]
}

async function fetchSequences(): Promise<Sequence[]> {
    const response = await fetch('/api/outreach/campaigns/sequences')
    if (!response.ok) throw new Error('Failed to fetch sequences')
    const data = await response.json()
    return data.sequences || []
}

async function fetchSequence(id: string): Promise<SequenceResponse> {
    const response = await fetch(`/api/outreach/campaigns/sequences/${id}`)
    if (!response.ok) throw new Error('Failed to fetch sequence')
    return response.json()
}

async function createSequence(data: Partial<Sequence>): Promise<Sequence> {
    const response = await fetch('/api/outreach/campaigns/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create sequence')
    return response.json()
}

async function updateSequence(id: string, data: Partial<Sequence>): Promise<Sequence> {
    const response = await fetch(`/api/outreach/campaigns/sequences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update sequence')
    return response.json()
}

async function deleteSequence(id: string): Promise<void> {
    const response = await fetch(`/api/outreach/campaigns/sequences/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete sequence')
}

function SequenceCard({ sequence, stepsCount, onEdit, onDelete }: {
    sequence: Sequence
    stepsCount: number
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}) {
    const [showMenu, setShowMenu] = React.useState(false)

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{sequence.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${sequence.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {sequence.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {stepsCount} steps
                        </span>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                <button
                                    onClick={() => { onEdit(sequence.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => { onDelete(sequence.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export function SequencesPage() {
    const { data: sequences, isLoading } = useQuery({
        queryKey: ['sequences'],
        queryFn: fetchSequences,
    })

    return (
        <OutreachLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sequences</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Create email sequences for automated follow-ups
                        </p>
                    </div>
                    <Link
                        href="/outreach/sequences/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        New Sequence
                    </Link>
                </div>

                {/* Sequences List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : sequences && sequences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sequences.map((sequence) => (
                            <SequenceCard
                                key={sequence.id}
                                sequence={sequence}
                                stepsCount={0}
                                onEdit={(id) => console.log('Edit', id)}
                                onDelete={(id) => console.log('Delete', id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sequences yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Create your first email sequence to automate follow-ups
                        </p>
                        <Link
                            href="/outreach/sequences/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5" />
                            Create Sequence
                        </Link>
                    </div>
                )}
            </div>
        </OutreachLayout>
    )
}

export default SequencesPage
