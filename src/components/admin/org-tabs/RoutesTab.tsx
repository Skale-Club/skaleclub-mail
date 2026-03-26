import { useEffect, useMemo, useState } from 'react'
import { Edit, Plus, Search, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { apiFetch, apiRequest } from './shared'

interface RouteConfig {
    id: string
    organizationId: string
    name: string
    address: string
    mode: 'endpoint' | 'hold' | 'reject'
    spamMode: string
    spamThreshold: number
    createdAt: string
}

interface RoutesTabProps {
    organizationId: string
}

const emptyRoute = {
    name: '',
    address: '',
    mode: 'endpoint' as 'endpoint' | 'hold' | 'reject',
    spamMode: 'mark',
    spamThreshold: 5,
}

export default function RoutesTab({ organizationId }: RoutesTabProps) {
    const [routes, setRoutes] = useState<RouteConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null)
    const [newRoute, setNewRoute] = useState(emptyRoute)
    const [editData, setEditData] = useState(emptyRoute)

    useEffect(() => {
        void fetchRoutes()
    }, [organizationId])

    async function fetchRoutes() {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ routes: RouteConfig[] }>(`/api/routes?organizationId=${organizationId}`)
            setRoutes(data.routes || [])
        } catch (error) {
            console.error('Error fetching routes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredRoutes = useMemo(() => (
        routes.filter((route) =>
            route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ), [routes, searchQuery])

    async function handleCreateRoute() {
        try {
            const data = await apiFetch<{ route: RouteConfig }>('/api/routes', {
                method: 'POST',
                body: JSON.stringify({ ...newRoute, organizationId }),
            })

            setRoutes((current) => [data.route, ...current])
            setNewRoute(emptyRoute)
            setShowCreateModal(false)
        } catch (error) {
            console.error('Error creating route:', error)
            alert(error instanceof Error ? error.message : 'Failed to create route')
        }
    }

    async function handleUpdateRoute() {
        if (!selectedRoute) return

        try {
            const data = await apiFetch<{ route: RouteConfig }>(`/api/routes/${selectedRoute.id}`, {
                method: 'PUT',
                body: JSON.stringify(editData),
            })

            setRoutes((current) => current.map((route) => route.id === selectedRoute.id ? data.route : route))
            setSelectedRoute(null)
            setShowEditModal(false)
        } catch (error) {
            console.error('Error updating route:', error)
            alert(error instanceof Error ? error.message : 'Failed to update route')
        }
    }

    async function handleDeleteRoute(routeId: string) {
        if (!confirm('Are you sure you want to delete this route? This action cannot be undone.')) return

        try {
            await apiRequest(`/api/routes/${routeId}`, {
                method: 'DELETE',
            })

            setRoutes((current) => current.filter((route) => route.id !== routeId))
        } catch (error) {
            console.error('Error deleting route:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Routes</h3>
                    <p className="text-sm text-muted-foreground">Configure email routing rules.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Route
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search routes..."
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
                                        <td className="px-4 py-3 font-medium">{route.name}</td>
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-muted px-2 py-1 text-sm">{route.address}</code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                route.mode === 'endpoint'
                                                    ? 'bg-green-100 text-green-800'
                                                    : route.mode === 'hold'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}>
                                                {route.mode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{route.spamThreshold}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(route.createdAt).toLocaleDateString()}
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
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRoute(route.id)}>
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
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Create Route</CardTitle>
                            <CardDescription>Create a new email routing rule.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="routeName">Route Name</Label>
                                <Input
                                    id="routeName"
                                    placeholder="My Route"
                                    value={newRoute.name}
                                    onChange={(event) => setNewRoute((current) => ({ ...current, name: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="routeAddress">Email Address</Label>
                                <Input
                                    id="routeAddress"
                                    placeholder="support@example.com"
                                    value={newRoute.address}
                                    onChange={(event) => setNewRoute((current) => ({ ...current, address: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="routeMode">Mode</Label>
                                <select
                                    id="routeMode"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newRoute.mode}
                                    onChange={(event) => setNewRoute((current) => ({ ...current, mode: event.target.value as 'endpoint' | 'hold' | 'reject' }))}
                                >
                                    <option value="endpoint">Endpoint (Forward)</option>
                                    <option value="hold">Hold (Review)</option>
                                    <option value="reject">Reject (Block)</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="spamThreshold">Spam Threshold</Label>
                                <Input
                                    id="spamThreshold"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={newRoute.spamThreshold}
                                    onChange={(event) => setNewRoute((current) => ({ ...current, spamThreshold: Number(event.target.value) || 0 }))}
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
            )}

            {showEditModal && selectedRoute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Edit Route</CardTitle>
                            <CardDescription>Update route configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="editRouteName">Route Name</Label>
                                <Input
                                    id="editRouteName"
                                    value={editData.name}
                                    onChange={(event) => setEditData((current) => ({ ...current, name: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editRouteAddress">Email Address</Label>
                                <Input
                                    id="editRouteAddress"
                                    value={editData.address}
                                    onChange={(event) => setEditData((current) => ({ ...current, address: event.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editRouteMode">Mode</Label>
                                <select
                                    id="editRouteMode"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editData.mode}
                                    onChange={(event) => setEditData((current) => ({ ...current, mode: event.target.value as 'endpoint' | 'hold' | 'reject' }))}
                                >
                                    <option value="endpoint">Endpoint (Forward)</option>
                                    <option value="hold">Hold (Review)</option>
                                    <option value="reject">Reject (Block)</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="editSpamThreshold">Spam Threshold</Label>
                                <Input
                                    id="editSpamThreshold"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editData.spamThreshold}
                                    onChange={(event) => setEditData((current) => ({ ...current, spamThreshold: Number(event.target.value) || 0 }))}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedRoute(null)
                                        setShowEditModal(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateRoute}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
