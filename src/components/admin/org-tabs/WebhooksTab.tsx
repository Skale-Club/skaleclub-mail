import { useEffect, useMemo, useState } from 'react'
import { Edit, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { apiFetch, apiRequest } from './shared'

interface WebhookConfig {
    id: string
    organizationId: string
    name: string
    url: string
    secret: string | null
    active: boolean
    events: string[]
    createdAt: string
}

interface WebhooksTabProps {
    organizationId: string
}

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

const emptyWebhook = {
    name: '',
    url: '',
    secret: '',
    active: true,
    events: [] as string[],
}

export default function WebhooksTab({ organizationId }: WebhooksTabProps) {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null)
    const [newWebhook, setNewWebhook] = useState(emptyWebhook)
    const [editData, setEditData] = useState(emptyWebhook)

    useEffect(() => {
        void fetchWebhooks()
    }, [organizationId])

    async function fetchWebhooks() {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ webhooks: WebhookConfig[] }>(`/api/webhooks?organizationId=${organizationId}`)
            setWebhooks(data.webhooks || [])
        } catch (error) {
            console.error('Error fetching webhooks:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredWebhooks = useMemo(() => (
        webhooks.filter((webhook) =>
            webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            webhook.url.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ), [webhooks, searchQuery])

    async function handleCreateWebhook() {
        try {
            const data = await apiFetch<{ webhook: WebhookConfig }>('/api/webhooks', {
                method: 'POST',
                body: JSON.stringify({
                    ...newWebhook,
                    organizationId,
                }),
            })

            setWebhooks((current) => [data.webhook, ...current])
            setNewWebhook(emptyWebhook)
            setShowCreateModal(false)
        } catch (error) {
            console.error('Error creating webhook:', error)
            alert(error instanceof Error ? error.message : 'Failed to create webhook')
        }
    }

    async function handleUpdateWebhook() {
        if (!selectedWebhook) return

        try {
            const data = await apiFetch<{ webhook: WebhookConfig }>(`/api/webhooks/${selectedWebhook.id}`, {
                method: 'PATCH',
                body: JSON.stringify(editData),
            })

            setWebhooks((current) => current.map((webhook) => webhook.id === selectedWebhook.id ? data.webhook : webhook))
            setSelectedWebhook(null)
            setShowEditModal(false)
        } catch (error) {
            console.error('Error updating webhook:', error)
            alert(error instanceof Error ? error.message : 'Failed to update webhook')
        }
    }

    async function handleDeleteWebhook(webhookId: string) {
        if (!confirm('Are you sure you want to delete this webhook?')) return

        try {
            await apiRequest(`/api/webhooks/${webhookId}`, {
                method: 'DELETE',
            })

            setWebhooks((current) => current.filter((webhook) => webhook.id !== webhookId))
        } catch (error) {
            console.error('Error deleting webhook:', error)
        }
    }

    async function handleTestWebhook(webhookId: string) {
        try {
            const data = await apiFetch<{ success?: boolean }>(`/api/webhooks/${webhookId}/test`, {
                method: 'POST',
            })

            alert(data.success ? 'Webhook test successful' : 'Webhook test failed')
        } catch (error) {
            console.error('Error testing webhook:', error)
            alert(error instanceof Error ? error.message : 'Failed to test webhook')
        }
    }

    function toggleEvent(event: string, isSelected: boolean, target: 'new' | 'edit') {
        const update = (current: typeof emptyWebhook) => ({
            ...current,
            events: isSelected
                ? current.events.filter((currentEvent) => currentEvent !== event)
                : [...current.events, event],
        })

        if (target === 'new') {
            setNewWebhook((current) => update(current))
            return
        }

        setEditData((current) => update(current))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Webhooks</h3>
                    <p className="text-sm text-muted-foreground">Configure event notifications and test deliveries.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Webhook
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search webhooks..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
                                        <td className="px-4 py-3 font-medium">{webhook.name}</td>
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-muted px-2 py-1 text-sm">{webhook.url}</code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {webhook.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {webhook.events.slice(0, 3).map((event) => (
                                                    <span key={event} className="rounded bg-muted px-2 py-0.5 text-xs">
                                                        {event.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                                {webhook.events.length > 3 && (
                                                    <span className="text-xs text-gray-500">+{webhook.events.length - 3} more</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(webhook.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleTestWebhook(webhook.id)}>
                                                <RefreshCw className="h-4 w-4" />
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
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Create Webhook</CardTitle>
                            <CardDescription>Create a new webhook for event notifications.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="webhookName">Webhook Name</Label>
                                <Input
                                    id="webhookName"
                                    placeholder="My Webhook"
                                    value={newWebhook.name}
                                    onChange={(event) => setNewWebhook((current) => ({ ...current, name: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="webhookUrl">URL</Label>
                                <Input
                                    id="webhookUrl"
                                    placeholder="https://example.com/webhook"
                                    value={newWebhook.url}
                                    onChange={(event) => setNewWebhook((current) => ({ ...current, url: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="webhookSecret">Secret</Label>
                                <Input
                                    id="webhookSecret"
                                    placeholder="optional shared secret"
                                    value={newWebhook.secret}
                                    onChange={(event) => setNewWebhook((current) => ({ ...current, secret: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Events</Label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {availableEvents.map((event) => (
                                        <label key={event} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={newWebhook.events.includes(event)}
                                                onChange={() => toggleEvent(event, newWebhook.events.includes(event), 'new')}
                                            />
                                            <span>{event.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateWebhook} disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}>
                                    Create Webhook
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showEditModal && selectedWebhook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Edit Webhook</CardTitle>
                            <CardDescription>Update webhook configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="editWebhookName">Webhook Name</Label>
                                <Input
                                    id="editWebhookName"
                                    value={editData.name}
                                    onChange={(event) => setEditData((current) => ({ ...current, name: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editWebhookUrl">URL</Label>
                                <Input
                                    id="editWebhookUrl"
                                    value={editData.url}
                                    onChange={(event) => setEditData((current) => ({ ...current, url: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editWebhookSecret">Secret</Label>
                                <Input
                                    id="editWebhookSecret"
                                    value={editData.secret}
                                    onChange={(event) => setEditData((current) => ({ ...current, secret: event.target.value }))}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="editWebhookActive"
                                    type="checkbox"
                                    checked={editData.active}
                                    onChange={(event) => setEditData((current) => ({ ...current, active: event.target.checked }))}
                                />
                                <Label htmlFor="editWebhookActive">Active</Label>
                            </div>
                            <div>
                                <Label>Events</Label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {availableEvents.map((event) => (
                                        <label key={event} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={editData.events.includes(event)}
                                                onChange={() => toggleEvent(event, editData.events.includes(event), 'edit')}
                                            />
                                            <span>{event.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedWebhook(null)
                                        setShowEditModal(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateWebhook} disabled={!editData.name || !editData.url || editData.events.length === 0}>
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
