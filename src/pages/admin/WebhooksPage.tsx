import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Webhook, Plus, Search, Trash2, Edit, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface WebhookConfig {
    id: string
    serverId: string
    name: string
    url: string
    secret: string | null
    active: boolean
    events: string[]
    createdAt: string
}

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedServer, setSelectedServer] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null)
    const [editData, setEditData] = useState({
        name: '',
        url: '',
        secret: '',
        active: true,
        events: [] as string[],
    })
    const [newWebhook, setNewWebhook] = useState({
        serverId: '',
        name: '',
        url: '',
        secret: '',
        events: [] as string[],
    })

    const availableEvents = [
        'message_sent',
        'message_delivered',
        'message_bounced',
        'message_held',
        'message_opened',
        'link_clicked',
        'domain_verified',
        'spam_alert',
    ]

    useEffect(() => {
        if (selectedServer) {
            fetchWebhooks()
        } else {
            setWebhooks([])
            setIsLoading(false)
        }
    }, [selectedServer])

    async function fetchWebhooks() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/webhooks?serverId=${selectedServer}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setWebhooks(data.webhooks || [])
            }
        } catch (error) {
            console.error('Error fetching webhooks:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredWebhooks = webhooks.filter(webhook =>
        webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webhook.url.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateWebhook = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('/api/webhooks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newWebhook, serverId: selectedServer }),
            })

            if (response.ok) {
                const data = await response.json()
                setWebhooks([...webhooks, data.webhook])
                setShowCreateModal(false)
                setNewWebhook({
                    serverId: '',
                    name: '',
                    url: '',
                    secret: '',
                    events: [],
                })
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to create webhook')
            }
        } catch (error) {
            console.error('Error creating webhook:', error)
        }
    }

    const handleUpdateWebhook = async (id: string, updates: Partial<WebhookConfig>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/webhooks/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            if (response.ok) {
                const data = await response.json()
                setWebhooks(webhooks.map(w => w.id === id ? data.webhook : w))
                setShowEditModal(false)
                setSelectedWebhook(null)
            }
        } catch (error) {
            console.error('Error updating webhook:', error)
        }
    }

    const handleDeleteWebhook = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/webhooks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setWebhooks(webhooks.filter(w => w.id !== id))
            }
        } catch (error) {
            console.error('Error deleting webhook:', error)
        }
    }

    const handleTestWebhook = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/webhooks/${id}/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                alert(data.success ? 'Webhook test successful!' : 'Webhook test failed. Check the URL and try again.')
            }
        } catch (error) {
            console.error('Error testing webhook:', error)
            alert('Failed to test webhook')
        }
    }

    const toggleEvent = (event: string, isSelected: boolean) => {
        if (isSelected) {
            return newWebhook.events.filter(e => e !== event)
        } else {
            return [...newWebhook.events, event]
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Webhooks</h2>
                    <p className="text-muted-foreground">
                        Configure webhook notifications for events
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} disabled={!selectedServer}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Webhook
                </Button>
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
                    </select>
                </CardContent>
            </Card>

            {/* Search and List */}
            {selectedServer && (
                <>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search webhooks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">URL</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Events</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredWebhooks.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                No webhooks found. Create a webhook to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredWebhooks.map((webhook) => (
                                            <tr key={webhook.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{webhook.name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">{webhook.url}</code>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${webhook.active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {webhook.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {webhook.events.slice(0, 3).map((event) => (
                                                            <span key={event} className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                                                                {event.replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                        {webhook.events.length > 3 && (
                                                            <span className="text-xs text-gray-500">+{webhook.events.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(webhook.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleTestWebhook(webhook.id)}
                                                        title="Test webhook"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedWebhook(webhook)
                                                            setEditData({
                                                                name: webhook.name,
                                                                url: webhook.url,
                                                                secret: webhook.secret || '',
                                                                active: webhook.active,
                                                                events: webhook.events,
                                                            })
                                                            setShowEditModal(true)
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteWebhook(webhook.id)}
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

            {/* Create Webhook Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Webhook</CardTitle>
                                <CardDescription>
                                    Create a new webhook for event notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Webhook Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="My Webhook"
                                        value={newWebhook.name}
                                        onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://example.com/webhook"
                                        value={newWebhook.url}
                                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="secret">Secret (Optional)</Label>
                                    <Input
                                        id="secret"
                                        placeholder="webhook_secret"
                                        value={newWebhook.secret}
                                        onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Events to Subscribe</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {availableEvents.map((event) => (
                                            <label key={event} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={newWebhook.events.includes(event)}
                                                    onChange={(e) => {
                                                        const newEvents = e.target.checked
                                                            ? [...newWebhook.events, event]
                                                            : newWebhook.events.filter((e) => e !== event)
                                                        setNewWebhook({ ...newWebhook, events: newEvents })
                                                    }}
                                                />
                                                <span className="text-sm">{event.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateWebhook}
                                        disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                                    >
                                        Create Webhook
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Edit Webhook Modal */}
            {showEditModal && selectedWebhook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Webhook</CardTitle>
                                <CardDescription>
                                    Update webhook configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="editName">Webhook Name</Label>
                                    <Input
                                        id="editName"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editUrl">URL</Label>
                                    <Input
                                        id="editUrl"
                                        value={editData.url}
                                        onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editSecret">Secret</Label>
                                    <Input
                                        id="editSecret"
                                        value={editData.secret}
                                        onChange={(e) => setEditData({ ...editData, secret: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="editActive"
                                        checked={editData.active}
                                        onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                                    />
                                    <Label htmlFor="editActive">Active</Label>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => {
                                        setShowEditModal(false)
                                        setSelectedWebhook(null)
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => handleUpdateWebhook(selectedWebhook.id, editData)}>
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
