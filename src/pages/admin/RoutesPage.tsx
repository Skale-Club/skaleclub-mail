import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Route, Plus, Search, Trash2, Edit, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RouteConfig {
    id: string
    serverId: string
    name: string
    address: string
    mode: 'endpoint' | 'hold' | 'reject'
    spamMode: string
    spamThreshold: number
    createdAt: string
}

export default function RoutesPage() {
    const [routes, setRoutes] = useState<RouteConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedServer, setSelectedServer] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null)
    const [editData, setEditData] = useState({
        name: '',
        address: '',
        mode: 'endpoint' as 'endpoint' | 'hold' | 'reject',
        spamMode: 'mark',
        spamThreshold: 5,
    })
    const [newRoute, setNewRoute] = useState({
        serverId: '',
        name: '',
        address: '',
        mode: 'endpoint' as 'endpoint' | 'hold' | 'reject',
        spamMode: 'mark',
        spamThreshold: 5,
    })

    useEffect(() => {
        if (selectedServer) {
            fetchRoutes()
        } else {
            setRoutes([])
            setIsLoading(false)
        }
    }, [selectedServer])

    async function fetchRoutes() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/routes?serverId=${selectedServer}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setRoutes(data.routes || [])
            }
        } catch (error) {
            console.error('Error fetching routes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateRoute = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('/api/routes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newRoute, serverId: selectedServer }),
            })

            if (response.ok) {
                const data = await response.json()
                setRoutes([...routes, data.route])
                setShowCreateModal(false)
                setNewRoute({
                    serverId: '',
                    name: '',
                    address: '',
                    mode: 'endpoint',
                    spamMode: 'mark',
                    spamThreshold: 5,
                })
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to create route')
            }
        } catch (error) {
            console.error('Error creating route:', error)
        }
    }

    const handleUpdateRoute = async (id: string, updates: Partial<RouteConfig>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/routes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            if (response.ok) {
                const data = await response.json()
                setRoutes(routes.map(r => r.id === id ? data.route : r))
                setShowEditModal(false)
                setSelectedRoute(null)
            }
        } catch (error) {
            console.error('Error updating route:', error)
        }
    }

    const handleDeleteRoute = async (id: string) => {
        if (!confirm('Are you sure you want to delete this route? This action cannot be undone.')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/routes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setRoutes(routes.filter(r => r.id !== id))
            }
        } catch (error) {
            console.error('Error deleting route:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Routes</h2>
                    <p className="text-muted-foreground">
                        Configure email routing rules
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} disabled={!selectedServer}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Route
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
                        {/* Server options would be populated dynamically */}
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
                                placeholder="Search routes..."
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
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Address</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mode</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Spam Threshold</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredRoutes.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                No routes found. Create a route to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRoutes.map((route) => (
                                            <tr key={route.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{route.name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">{route.address}</code>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${route.mode === 'endpoint'
                                                            ? 'bg-green-100 text-green-800'
                                                            : route.mode === 'hold'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {route.mode}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-500">{route.spamThreshold}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(route.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRoute(route)
                                                            setEditData({
                                                                name: route.name,
                                                                address: route.address,
                                                                mode: route.mode,
                                                                spamMode: route.spamMode,
                                                                spamThreshold: route.spamThreshold,
                                                            })
                                                            setShowEditModal(true)
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteRoute(route.id)}
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

            {/* Create Route Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Route</CardTitle>
                                <CardDescription>
                                    Create a new email routing rule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Route Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="My Route"
                                        value={newRoute.name}
                                        onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Email Address</Label>
                                    <Input
                                        id="address"
                                        placeholder="user@domain.com"
                                        value={newRoute.address}
                                        onChange={(e) => setNewRoute({ ...newRoute, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="mode">Mode</Label>
                                    <select
                                        id="mode"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newRoute.mode}
                                        onChange={(e) => setNewRoute({ ...newRoute, mode: e.target.value as 'endpoint' | 'hold' | 'reject' })}
                                    >
                                        <option value="endpoint">Endpoint (Forward)</option>
                                        <option value="hold">Hold (Review)</option>
                                        <option value="reject">Reject (Block)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="spamThreshold">Spam Threshold (1-10)</Label>
                                    <Input
                                        id="spamThreshold"
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={newRoute.spamThreshold}
                                        onChange={(e) => setNewRoute({ ...newRoute, spamThreshold: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateRoute} disabled={!newRoute.name || !newRoute.address}>
                                        Create Route
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Edit Route Modal */}
            {showEditModal && selectedRoute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Route</CardTitle>
                                <CardDescription>
                                    Update route configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="editName">Route Name</Label>
                                    <Input
                                        id="editName"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editAddress">Email Address</Label>
                                    <Input
                                        id="editAddress"
                                        value={editData.address}
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editMode">Mode</Label>
                                    <select
                                        id="editMode"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editData.mode}
                                        onChange={(e) => setEditData({ ...editData, mode: e.target.value as 'endpoint' | 'hold' | 'reject' })}
                                    >
                                        <option value="endpoint">Endpoint (Forward)</option>
                                        <option value="hold">Hold (Review)</option>
                                        <option value="reject">Reject (Block)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="editSpamThreshold">Spam Threshold (1-10)</Label>
                                    <Input
                                        id="editSpamThreshold"
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={editData.spamThreshold}
                                        onChange={(e) => setEditData({ ...editData, spamThreshold: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => {
                                        setShowEditModal(false)
                                        setSelectedRoute(null)
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => handleUpdateRoute(selectedRoute.id, editData)}>
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
