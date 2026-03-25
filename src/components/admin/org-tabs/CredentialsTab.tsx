import { useEffect, useMemo, useState } from 'react'
import { Copy, Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { fetchWithAuth } from './shared'

interface Credential {
    id: string
    orgId: string
    name: string
    type: 'smtp' | 'api'
    key: string
    lastUsedAt: string | null
    expiresAt: string | null
    createdAt: string
}

interface CredentialsTabProps {
    orgId: string
}

export default function CredentialsTab({ orgId }: CredentialsTabProps) {
    const [credentials, setCredentials] = useState<Credential[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null)
    const [newCredential, setNewCredential] = useState({
        name: '',
        type: 'smtp' as 'smtp' | 'api',
    })

    useEffect(() => {
        void fetchCredentials()
    }, [orgId])

    async function fetchCredentials() {
        setIsLoading(true)
        try {
            const response = await fetchWithAuth(`/api/credentials?organizationId=${orgId}`)

            if (response.ok) {
                const data = await response.json()
                setCredentials(data.credentials || [])
            }
        } catch (error) {
            console.error('Error fetching credentials:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCredentials = useMemo(() => (
        credentials.filter((credential) =>
            credential.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            credential.key.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ), [credentials, searchQuery])

    async function handleCreateCredential() {
        if (!newCredential.name.trim()) return

        try {
            const response = await fetchWithAuth('/api/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: orgId,
                    name: newCredential.name.trim(),
                    type: newCredential.type,
                    key: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setCredentials((current) => [data.credential, ...current])
                setNewCredential({ name: '', type: 'smtp' })
                setShowCreateModal(false)
                setVisibleKeyId(data.credential.id)
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to create credential')
            }
        } catch (error) {
            console.error('Error creating credential:', error)
        }
    }

    async function handleDeleteCredential(credentialId: string) {
        if (!confirm('Are you sure you want to delete this credential? This action cannot be undone.')) return

        try {
            const response = await fetchWithAuth(`/api/credentials/${credentialId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setCredentials((current) => current.filter((credential) => credential.id !== credentialId))
                if (visibleKeyId === credentialId) {
                    setVisibleKeyId(null)
                }
            }
        } catch (error) {
            console.error('Error deleting credential:', error)
        }
    }

    function copyToClipboard(value: string) {
        void navigator.clipboard.writeText(value)
        alert('Copied to clipboard')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Credentials</h3>
                    <p className="text-sm text-muted-foreground">Manage SMTP and API credentials for this organization.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Credential
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search credentials..."
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Key</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Used</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Expires</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredCredentials.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No credentials found. Create a credential to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredCredentials.map((credential) => (
                                    <tr key={credential.id}>
                                        <td className="px-4 py-3 font-medium">{credential.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                credential.type === 'smtp'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {credential.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                                    {visibleKeyId === credential.id ? credential.key : '••••••••••••'}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setVisibleKeyId((current) => current === credential.id ? null : credential.id)}
                                                >
                                                    {visibleKeyId === credential.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(credential.key)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {credential.lastUsedAt ? new Date(credential.lastUsedAt).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {credential.expiresAt ? new Date(credential.expiresAt).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCredential(credential.id)}>
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
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Create Credential</CardTitle>
                            <CardDescription>Create a new SMTP or API credential.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="credentialName">Credential Name</Label>
                                <Input
                                    id="credentialName"
                                    placeholder="My App Credential"
                                    value={newCredential.name}
                                    onChange={(event) => setNewCredential((current) => ({ ...current, name: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="credentialType">Type</Label>
                                <select
                                    id="credentialType"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newCredential.type}
                                    onChange={(event) => setNewCredential((current) => ({ ...current, type: event.target.value as 'smtp' | 'api' }))}
                                >
                                    <option value="smtp">SMTP</option>
                                    <option value="api">API</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateCredential} disabled={!newCredential.name.trim()}>
                                    Create Credential
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
