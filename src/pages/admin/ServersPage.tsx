import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Server, Plus, Search, MoreHorizontal, Trash2, Edit, from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Server {
    id: string
    name: string
    slug: string
    organizationId: string
    mode: string
    sendMode: string
    description?: string
    defaultFromAddress?: string
    defaultFromName?: string
    suspended: boolean
    suspendedReason?: string
    created_at: string
    updated_at: string
}

export default function ServersPage() {
    const [servers, setServers] = useState<Server[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newServer, setNewServer] = useState({
        name: '',
        slug: '',
        organizationId: '',
        mode: 'live',
        sendMode: 'smtp',
        description: '',
        defaultFromAddress: '',
        defaultFromName: '',
    })
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

    const [showOrgSelector, setShowOrgSelector] = useState(false)

    useEffect(() => {
        fetchServers()
    }, [selectedOrg])

    async function fetchServers() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/servers?organizationId=${selectedOrg}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setServers(data.servers || [])
            }
        } catch (error) {
            console.error('Error fetching servers:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredServers = servers.filter(server =>
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateServer = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('/api/servers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newServer),
            })

            if (response.ok) {
                const data = await response.json()
                setServers([...servers, data.server])
                setShowCreateModal(false)
                setNewServer({
                    name: '',
                    slug: '',
                    organizationId: '',
                    mode: 'live',
                    sendMode: 'smtp',
                    description: '',
                    defaultFromAddress: '',
                    defaultFromName: '',
                })
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to create server')
            }
        } catch (error) {
            console.error('Error creating server:', error)
        }
    }

    const handleDeleteServer = async (id: string) => {
        if (!confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/servers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setServers(servers.filter(server => server.id !== id))
            }
        } catch (error) {
            console.error('Error deleting server:', error)
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Servers</h2>
                    <p className="text-muted-foreground">
                        Manage your mail servers
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Server
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search servers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Servers List */}
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="rounded-md border">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left font-medium">Name</th>
                                <th className="text-left font-medium">Slug</th>
                                <th className="text-left font-medium">Organization</th>
                                <th className="text-left font-medium">Mode</th>
                                <th className="text-left font-medium">Status</th>
                                <th className="text-right font-medium">Actions</th>
                            </tr>
                            <tbody>
                                {filteredServers.map((server) => (
                                    <tr key={server.id} className="hover:bg-accent">
                                        <td className="py-3">
                                            <div className="font-medium">{server.name}</div>
                                            <div className="text-sm text-muted-foreground">{server.slug}</div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        // Edit server
                                                        window.location.href = `/admin/servers/${server.id}/edit`
                                                    }}
                                                >
                                                    <Edit
                                            </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteServer(server.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                ))}
                                    </tbody>
                                ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    No servers found. Create your first server.
                                </div>
                        )}
                            </div>

                            {/* Create Modal */}
                            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-card rounded-lg shadow-xl max-w-md">
                        <CardHeader>
                            <CardTitle>Create New Server</CardTitle>
                            <CardDescription>Add a new mail server to your organization</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="My Server"
                                    value={newServer.name}
                                    onChange={(e) => {
                                        const name = e.target.value
                                        setNewServer({
                                            ...newServer,
                                            name,
                                            slug: generateSlug(name),
                                        })
                                    }
                                </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    placeholder="my-server"
                                    value={newServer.slug}
                                    onChange={(e) => {
                                        const slug = e.target.value
                                        setNewServer({ ...newServer, slug: e.target.value })
                                    }
                                </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizationId">Organization</Label>
                                <select
                                    id="organizationId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newServer.organizationId}
                                    onChange={(e) => setNewServer({
                                        ...newServer,
                                        organizationId: e.target.value,
                                    }
                                >
                                    {filteredOrganizations.map((org) => (
                                        <option key={org.id} value={org.name}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mode">Mode</Label>
                            <select
                                id="mode"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newServer.mode}
                                onChange={(e) => setNewServer({
                                    ...newServer,
                                    mode: e.target.value,
                                })
                            >
                                <option value="live">Live</option>
                                <option value="development">Development</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sendMode">Send Mode</Label>
                            <select
                                id="sendMode"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newServer.sendMode}
                                onChange={(e) => setNewServer({
                                    ...newServer,
                                    sendMode: e.target.value,
                                })
                            >
                                <option value="smtp">SMTP</option>
                                <option value="api">API</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Server description"
                                value={newServer.description || ''}
                                onChange={(e) => setNewServer({
                                    ...newServer,
                                    description: e.target.value,
                                })}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateServer} disabled={!newServer.name || !newServer.slug || !newServer.organizationId}>
                                Create Server
                            </Button>
                        </div>
                </div>
                </CardContent>
            </Card >
        </div >
    )
}
