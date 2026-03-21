import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Key, Plus, Search, Trash2, Eye, EyeOff, Copy } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Credential {
    id: string
    serverId: string
    name: string
    type: 'smtp' | 'api'
    key: string
    lastUsedAt: string | null
    expiresAt: string | null
    createdAt: string
}

export default function CredentialsPage() {
    const [credentials, setCredentials] = useState<Credential[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedServer, setSelectedServer] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showKey, setShowKey] = useState<string | null>(null)
    const [newCredential, setNewCredential] = useState({
        serverId: '',
        name: '',
        type: 'smtp' as 'smtp' | 'api',
    })

    useEffect(() => {
        fetchCredentials()
    }, [selectedServer])

    async function fetchCredentials() {
        if (!selectedServer) {
            setCredentials([])
            setIsLoading(false)
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/credentials?serverId=${selectedServer}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

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

    const filteredCredentials = credentials.filter(cred =>
        cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.key.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateCredential = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('/api/credentials', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCredential),
            })

            if (response.ok) {
                const data = await response.json()
                setCredentials([...credentials, data.credential])
                setShowCreateModal(false)
                setNewCredential({
                    serverId: '',
                    name: '',
                    type: 'smtp',
                })
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to create credential')
            }
        } catch (error) {
            console.error('Error creating credential:', error)
        }
    }

    const handleDeleteCredential = async (id: string) => {
        if (!confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/credentials/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setCredentials(credentials.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error('Error deleting credential:', error)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credentials</h2>
          <p className="text-muted-foreground">
            Manage SMTP and API credentials for your </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} disabled={!selectedServer}>
          <Plus className="w-4 h-4 mr-2" />
          New Credential
        </Button>
      </div>

      {/* Server Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Server</CardTitle>
        </CardDescription>
          Choose a server to manage its credentials
        </CardDescription>
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
      </Card >

        {/* Search */ }
    {
        selectedServer && (
            <>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search credentials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Credentials List */}
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
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            No credentials found. Create a credential to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCredentials.map((credential) => (
                                        <tr key={credential.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{credential.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${credential.type === 'smtp'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {credential.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                                        {showKey === credential.id ? credential.key : '••••••••••'}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowKey(showKey === credential.id ? null : credential.id)}
                                                    >
                                                        {showKey === credential.id ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(credential.key)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-500">
                                                    {credential.lastUsedAt
                                                        ? new Date(credential.lastUsedAt).toLocaleDateString()
                                                        : 'Never'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-500">
                                                    {credential.expiresAt
                                                        ? new Date(credential.expiresAt).toLocaleDateString()
                                                        : 'Never'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCredential(credential.id)}
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
          </>
        </div >
      )
    }

    {/* Create Credential Modal */ }
    {
        showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Credential</CardTitle>
                            <CardDescription>
                                Create a new SMTP or API credential
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Credential Name</Label>
                                <Input
                                    id="name"
                                    placeholder="My App Credential"
                                    value={newCredential.name}
                                    onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newCredential.type}
                                    onChange={(e) => setNewCredential({ ...newCredential, type: e.target.value as 'smtp' | 'api' })}
                                >
                                    <option value="smtp">SMTP</option>
                                    <option value="api">API</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateCredential} disabled={!newCredential.name}>
                                    Create Credential
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }
    </div >
  )
}
