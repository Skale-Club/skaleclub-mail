import { useEffect, useMemo, useState } from 'react'
import { Edit, Globe, Mail, Plus, Search, Server, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
    apiFetch,
    loadOrganizations,
    type OrganizationOption,
    matchesSearch,
} from './helpers'

type ServerRecord = {
    id: string
    name: string
    slug: string
    organizationId: string
    mode: 'live' | 'development'
    sendMode: 'smtp' | 'api' | 'outlook'
    description?: string | null
    defaultFromAddress?: string | null
    defaultFromName?: string | null
    suspended: boolean
    suspendedReason?: string | null
    createdAt: string
}

type ServerForm = {
    name: string
    slug: string
    organizationId: string
    mode: ServerRecord['mode']
    sendMode: ServerRecord['sendMode']
    description: string
    defaultFromAddress: string
    defaultFromName: string
}

const emptyForm: ServerForm = {
    name: '',
    slug: '',
    organizationId: '',
    mode: 'live',
    sendMode: 'smtp',
    description: '',
    defaultFromAddress: '',
    defaultFromName: '',
}

export default function ServersPage() {
    const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState('')
    const [servers, setServers] = useState<ServerRecord[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingServer, setEditingServer] = useState<ServerRecord | null>(null)
    const [form, setForm] = useState<ServerForm>(emptyForm)

    useEffect(() => {
        void bootstrap()
    }, [])

    useEffect(() => {
        if (selectedOrgId) {
            void fetchServers(selectedOrgId)
        }
    }, [selectedOrgId])

    async function bootstrap() {
        try {
            const orgs = await loadOrganizations()
            setOrganizations(orgs)
            if (orgs.length > 0) {
                setSelectedOrgId(orgs[0].id)
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error loading organizations:', error)
            setIsLoading(false)
        }
    }

    async function fetchServers(organizationId: string) {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ servers: ServerRecord[] }>(`/api/servers?organizationId=${organizationId}`)
            setServers(data.servers || [])
        } catch (error) {
            console.error('Error fetching servers:', error)
            setServers([])
        } finally {
            setIsLoading(false)
        }
    }

    function resetForm() {
        setForm({
            ...emptyForm,
            organizationId: selectedOrgId,
        })
        setEditingServer(null)
    }

    function openCreateModal() {
        resetForm()
        setShowCreateModal(true)
    }

    function openEditModal(server: ServerRecord) {
        setEditingServer(server)
        setForm({
            name: server.name,
            slug: server.slug,
            organizationId: server.organizationId,
            mode: server.mode,
            sendMode: server.sendMode,
            description: server.description || '',
            defaultFromAddress: server.defaultFromAddress || '',
            defaultFromName: server.defaultFromName || '',
        })
        setShowCreateModal(true)
    }

    async function handleSave() {
        try {
            if (editingServer) {
                const data = await apiFetch<{ server: ServerRecord }>(`/api/servers/${editingServer.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.name,
                        mode: form.mode,
                        sendMode: form.sendMode,
                        description: form.description || undefined,
                        defaultFromAddress: form.defaultFromAddress || undefined,
                        defaultFromName: form.defaultFromName || undefined,
                    }),
                })
                setServers((current) => current.map((item) => item.id === editingServer.id ? data.server : item))
            } else {
                const data = await apiFetch<{ server: ServerRecord }>('/api/servers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...form,
                        organizationId: selectedOrgId,
                        description: form.description || undefined,
                        defaultFromAddress: form.defaultFromAddress || undefined,
                        defaultFromName: form.defaultFromName || undefined,
                    }),
                })
                setServers((current) => [data.server, ...current])
            }

            setShowCreateModal(false)
            resetForm()
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to save server')
        }
    }

    async function handleDelete(serverId: string) {
        if (!window.confirm('Delete this server?')) {
            return
        }

        try {
            await apiFetch(`/api/servers/${serverId}`, { method: 'DELETE' })
            setServers((current) => current.filter((item) => item.id !== serverId))
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to delete server')
        }
    }

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 50)
    }

    const filteredServers = useMemo(
        () =>
            servers.filter((server) =>
                matchesSearch(server.name, searchQuery) ||
                matchesSearch(server.slug, searchQuery) ||
                matchesSearch(server.defaultFromAddress || '', searchQuery)
            ),
        [servers, searchQuery]
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Servers</h2>
                    <p className="text-muted-foreground">Manage mail servers per organization.</p>
                </div>
                <Button onClick={openCreateModal} disabled={!selectedOrgId}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Server
                </Button>
            </div>

            <Card>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <select
                            id="organization"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedOrgId}
                            onChange={(event) => setSelectedOrgId(event.target.value)}
                        >
                            {organizations.length === 0 && <option value="">No organizations</option>}
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                className="pl-10"
                                placeholder="Search by name, slug or from address"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">Loading servers...</CardContent>
                </Card>
            ) : filteredServers.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No servers found for this organization.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                    {filteredServers.map((server) => (
                        <Card key={server.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Server className="h-5 w-5 text-primary" />
                                            {server.name}
                                        </CardTitle>
                                        <CardDescription>{server.slug}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(server)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(server.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Stat label="Mode" value={server.mode} />
                                    <Stat label="Send mode" value={server.sendMode} />
                                    <Stat label="From address" value={server.defaultFromAddress || 'Not set'} />
                                    <Stat label="Sender name" value={server.defaultFromName || 'Not set'} />
                                </div>
                                {server.description && (
                                    <p className="text-sm text-muted-foreground">{server.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <BadgeLike icon={<Mail className="h-3.5 w-3.5" />} label={server.defaultFromAddress || 'No sender'} />
                                    <BadgeLike icon={<Globe className="h-3.5 w-3.5" />} label={server.suspended ? 'Suspended' : 'Active'} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>{editingServer ? 'Edit Server' : 'Create Server'}</CardTitle>
                            <CardDescription>
                                Configure the delivery mode and sender defaults for this organization.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <Field label="Name">
                                <Input
                                    value={form.name}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                        slug: editingServer ? current.slug : generateSlug(event.target.value),
                                    }))}
                                />
                            </Field>
                            <Field label="Slug">
                                <Input
                                    value={form.slug}
                                    disabled={!!editingServer}
                                    onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                                />
                            </Field>
                            <Field label="Mode">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.mode}
                                    onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value as ServerRecord['mode'] }))}
                                >
                                    <option value="live">Live</option>
                                    <option value="development">Development</option>
                                </select>
                            </Field>
                            <Field label="Send mode">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={form.sendMode}
                                    onChange={(event) => setForm((current) => ({ ...current, sendMode: event.target.value as ServerRecord['sendMode'] }))}
                                >
                                    <option value="smtp">SMTP</option>
                                    <option value="api">API</option>
                                    <option value="outlook">Outlook</option>
                                </select>
                            </Field>
                            <Field label="Default from address">
                                <Input
                                    type="email"
                                    value={form.defaultFromAddress}
                                    onChange={(event) => setForm((current) => ({ ...current, defaultFromAddress: event.target.value }))}
                                />
                            </Field>
                            <Field label="Default from name">
                                <Input
                                    value={form.defaultFromName}
                                    onChange={(event) => setForm((current) => ({ ...current, defaultFromName: event.target.value }))}
                                />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Description">
                                    <textarea
                                        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.description}
                                        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                    />
                                </Field>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={!form.name || !form.slug || !selectedOrgId}>
                                    {editingServer ? 'Save changes' : 'Create server'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    )
}

function BadgeLike({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1">
            {icon}
            {label}
        </span>
    )
}
