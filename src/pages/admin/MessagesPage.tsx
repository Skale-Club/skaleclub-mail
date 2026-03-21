import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Mail, Plus, Search, Trash2, Eye, RefreshCw, from 'lucide-react'
import { supabase } from '../../lib/supabase'

import AdminLayout from '../../components/admin/AdminLayout'

interface Message {
    id: string
    serverId: string
    messageId: string | null
    token: string
    direction: 'incoming' | 'outgoing'
    fromAddress: string
    fromName: string | null
    toAddresses: string[]
    subject: string | null
    status: 'pending' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'held' | 'failed'
    held: boolean
    heldReason: string | null
    spamScore: number | null
    sentAt: string | null
    deliveredAt: string | null
    openedAt: string | null
    createdAt: string
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedServer, setSelectedServer] = useState('')
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [directionFilter, setDirectionFilter] = useState<string>('all')

    useEffect(() => {
        if (selectedServer) {
            fetchMessages()
        } else {
            setMessages([])
            setIsLoading(false)
        }
    }, [selectedServer])

    async function fetchMessages() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (directionFilter !== 'all') params.append('direction', directionFilter)

            const response = await fetch(`/api/messages?serverId=${selectedServer}&${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages || [])
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredMessages = messages.filter(message => {
        const matchesSearch =
            message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.toAddresses.some(addr =>
                addr.toLowerCase().includes(searchQuery.toLowerCase())
            ) || false

        return matchesSearch
    })

    const handleDeleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setMessages(messages.filter(m => m.id !== id))
                setSelectedMessage(null)
            }
        } catch (error) {
            console.error('Error deleting message:', error)
        }
    }

    const handleReleaseHeld = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/messages/${id}/release`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setMessages(messages.map(m => m.id === id ? { ...m, held: false, status: 'queued' } : m))
            }
        } catch (error) {
            console.error('Error releasing message:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800'
            case 'sent':
                return 'bg-blue-100 text-blue-800'
            case 'bounced':
            case 'failed':
                return 'bg-red-100 text-red-800'
            case 'held':
                return 'bg-yellow-100 text-yellow-800'
            case 'pending':
            case 'queued':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (date: string | null) => {
        if (!date) return 'Never'
        return new Date(date).toLocaleString()
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                        <p className="text-muted-foreground">
                            View and manage email messages
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchMessages}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={() => window.location.href = '/admin/messages/send'}>
                            <Plus className="w-4 h-4 mr-2" />
                            Send Message
                        </Button>
                    </div>
                </div>

                {/* Server Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Server</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(e.target.value)}
                        >
                            <option value="">Select a server...</option>
                            {/* Server options would be populated dynamically */}
                        </select>
                    </CardContent>
                </Card>

                {/* Filters and Search */}
                {selectedServer && (
                    <>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex gap-4">
                                <select
                                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="queued">Queued</option>
                                    <option value="sent">Sent</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="bounced">Bounced</option>
                                    <option value="held">Held</option>
                                    <option value="failed">Failed</option>
                                </select>
                                <select
                                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={directionFilter}
                                    onChange={(e) => setDirectionFilter(e.target.value)}
                                >
                                    <option value="all">All Directions</option>
                                    <option value="incoming">Incoming</option>
                                    <option value="outgoing">Outgoing</option>
                                </select>
                            </div>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Messages List */}
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Direction</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">From</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">To</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Subject</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Spam</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredMessages.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                    No messages found. Select a server to view messages.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMessages.map((message) => (
                                                <tr key={message.id} className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => setSelectedMessage(message)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(message.status)}`}>
                                                            {message.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm ${message.direction === 'outgoing' ? 'text-blue-600' : 'text-green-600'}`}>
                                                            {message.direction}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm">
                                                            <div className="font-medium">{message.fromName || message.fromAddress}</div>
                                                            <div className="text-gray-500 text-xs">{message.fromAddress}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm">
                                                            {message.toAddresses.slice(0, 3).join(', ')}
                                                            {message.toAddresses.length > 3 && (
                                                                <span className="text-gray-500 text-xs">
                                                                    +{message.toAddresses.length - 3} more
                                                                </span>
                                                            )
                          </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm max-w-xs truncate" title={message.subject || '(No subject)'}>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm ${message.spamScore !== null && message.spamScore > 5 ? 'text-red-600' : 'text-gray-500'}`}>
                                                            {message.spamScore || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(message.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {message.held && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleReleaseHeld(message.id)
                                                                }}
                                                            >
                                                                Release
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedMessage(message)
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteMessage(message.id)
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Message Detail Modal */}
                {selectedMessage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Message Details</CardTitle>
                                    <CardDescription>
                                        View full message details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Message ID</Label>
                                            <div className="text-sm font-mono bg-muted p-2 rounded px-2 py-1">
                                                {selectedMessage.messageId}
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                                                {selectedMessage.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>From</Label>
                                        <div className="text-sm">
                                            {selectedMessage.fromName && (
                                                <div className="font-medium">{selectedMessage.fromName}</div>
                                            )}
                                            <div className="text-gray-500">{selectedMessage.fromAddress}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>To</Label>
                                        <div className="text-sm">
                                            {selectedMessage.toAddresses.join(', ')}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Subject</Label>
                                        <div className="text-sm font-medium">
                                            {selectedMessage.subject || '(No subject)'}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Created</Label>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(selectedMessage.createdAt)}
                                        </div>
                                    </div>
                                    {selectedMessage.held && (
                                        <div className="rounded-md bg-yellow-50 p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-yellow-800">Held</span>
                                                <span className="text-sm text-yellow-700">{selectedMessage.heldReason}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label>Spam Score</Label>
                                        <div className="text-sm">
                                            {selectedMessage.spamScore !== null ? (
                                                <span className={selectedMessage.spamScore > 5 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                                    {selectedMessage.spamScore}/10
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">Not scored</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Timestamps</Label>
                                        <div className="text-sm space-y-1">
                                            {selectedMessage.sentAt && (
                                                <div>Sent: {formatDate(selectedMessage.sentAt)}</div>
                                            )}
                                            {selectedMessage.deliveredAt && (
                                                <div>Delivered: {formatDate(selectedMessage.deliveredAt)}</div>
                                            )}
                                            {selectedMessage.openedAt && (
                                                <div>Opened: {formatDate(selectedMessage.openedAt)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                                            Close
                                        </Button>
                                        {selectedMessage.held && (
                                            <Button onClick={() => handleReleaseHeld(selectedMessage.id)}>
                                                Release Message
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
        </AdminLayout>
    )
}
