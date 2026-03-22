import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'wouter'
import { Plus, Mail, ChevronDown } from 'lucide-react'
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

async function fetchSequences(): Promise<Sequence[]> {
    const response = await fetch('/api/outreach/campaigns/sequences')
    if (!response.ok) throw new Error('Failed to fetch sequences')
    const data = await response.json()
    return data.sequences || []
}

function SequenceCard({
    sequence,
    stepsCount,
    onEdit,
    onDelete,
}: {
    sequence: Sequence
    stepsCount: number
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}) {
    const [showMenu, setShowMenu] = React.useState(false)

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{sequence.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${sequence.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {sequence.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{stepsCount} steps</span>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <button
                                    onClick={() => { onEdit(sequence.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => { onDelete(sequence.id); setShowMenu(false) }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sequences</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Create email sequences for automated follow-ups
                        </p>
                    </div>
                    <Link
                        href="/outreach/sequences/new"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />
                        New Sequence
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse dark:border-gray-700 dark:bg-gray-800">
                                <div className="mb-2 h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : sequences && sequences.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                        <Mail className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No sequences yet</h3>
                        <p className="mb-4 text-gray-500 dark:text-gray-400">
                            Create your first email sequence to automate follow-ups
                        </p>
                        <Link
                            href="/outreach/sequences/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-5 w-5" />
                            Create Sequence
                        </Link>
                    </div>
                )}
            </div>
        </OutreachLayout>
    )
}

export default SequencesPage
