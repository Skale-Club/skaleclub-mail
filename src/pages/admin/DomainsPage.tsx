import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Globe, Plus, Search, CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Domain {
    id: string
    serverId: string
    name: string
    verificationToken: string
    verificationStatus: 'pending' | 'verified' | 'failed'
    spfStatus: string
    mxStatus: string
    dkimSelector: string
    dkimPublicKey: string
    verifiedAt: string
    createdAt: string
}

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedServer, setSelectedServer] = useState<string>('')
    const [showVerifyModal, setShowVerifyModal] = useState(false)
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)

    useEffect(() => {
        fetchDomains()
    }, [selectedServer])

    useEffect(() => {
        if (selectedServer) {
            fetchDomains()
        }
    }, [selectedServer])

    async function fetchDomains() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/domains?serverId=${selectedServer}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setDomains(data.domains || [])
            }
        } catch (error) {
            console.error('Error fetching domains:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredDomains = domains.filter(domain =>
        domain.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleVerifyDomain = async (domainId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/domains/${domainId}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setDomains(domains.map(d =>
                    d.id === domainId ? { ...d, verificationStatus: 'verified', verifiedAt: data.verifiedAt } : : : : else {
                    const error = await response.json()
                alert(error.error || 'Verification failed')
            }
        } catch (error) {
            console.error('Error verifying domain:', error)
        }
    }

    const handleDeleteDomain = async (id: string) => {
        if (!confirm('Are you sure you want to delete this domain?')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/domains/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setDomains(domains.filter(d => d.id !== id))
            }
        } catch (error) {
            console.error('Error deleting domain:', error)
        }
    }

    const getDnsRecords = (domain: Domain) => {
        const records = []

        // TXT Record (for verification)
        if (domain.verificationStatus === 'verified') {
            records.push({
                type: 'TXT',
                name: `@`,
                ttl: 3600,
                value: domain.verificationToken,
            })
        }

        // CNAME Record for DKIM
        if (domain.dkimSelector) {
            records.push({
                type: 'CNAME',
                name: `${domain.dkimSelector}._domainkey`,
                ttl: 3600,
                value: domain.dkimPublicKey,
            })
        }

        // MX Record (for receiving email)
        records.push({
            type: 'MX',
            name: `mx.${domain.name}`,
            ttl: 3600,
            value: `10 mail.${domain.name}`,
        })
    }

    return records
}

return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Domains</h2>
                <p className="text-muted-foreground">
                    Manage sending domains for your servers
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/admin/servers'}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Back to Servers
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Domain
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

        {/* Search */}
        <div className="flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search domains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Domains List */}
        {isLoading ? (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        ) : (
            <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Domain</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">DKIM</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SPF</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MX</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredDomains.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No domains found. Add a domain to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredDomains.map((domain) => (
                                <tr key={domain.id}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{domain.name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${domain.verificationStatus === 'verified'
                                                ? 'bg-green-100 text-green-800'
                                                : domain.verificationStatus === 'failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {domain.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm ${domain.spfStatus === 'verified' ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                            {domain.spfStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm ${domain.mxStatus === 'verified' ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                            {domain.mxStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-500">
                                            {new Date(domain.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedDomain(domain)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleVerifyDomain(domain.id)}
                                            disabled={domain.verificationStatus === 'verified'}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDomain(domain.id)}
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

        {/* DNS Instructions */}
        {selectedDomain && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        DNS Configuration for {selectedDomain.name}
                    </CardTitle>
                    <CardDescription>
                        Add these DNS records to verify your domain
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-md bg-muted/50 p-4">
                            <h4 className="text-sm font-medium mb-2">Verification TXT Record</h4>
                            <code className="text-xs bg-background p-2 rounded font-mono">
                                @ IN TXT record for "{selectedDomain.verificationToken}"
                            </code>
                        </div>

                        <div className="rounded-md bg-muted/50 p-4">
                            <h4 className="text-sm font-medium mb-2">DKIM Record</h4>
                            <code className="text-xs bg-background p-2 rounded font-mono">
                                {selectedDomain.dkimSelector || 'postal'}._domainkey.{selectedDomain.name}
                            </code>
                        </div>

                        <div className="rounded-md bg-muted/50 p-4">
                            <h4 className="text-sm font-medium mb-2">SPF Record (h4>
                                <code className="text-xs bg-background p-2 rounded font-mono">
                                    v=spf1 include a:mail.{selectedDomain.name} include ip4:192.0.0.0 ? ~all - mx ~selectedDomain.name} -all;
                                </code>
                        </div>

                        <div className="rounded-md bg-muted/50 p-4">
                            <h4 className="text-sm font-medium mb-2">MX Record</h4>
                            <code className="text-xs bg-background p-2 rounded font-mono">
                                10 mail.{selectedDomain.name}
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">
                                Points to your mail server (e.g., mail.yourdomain.com)
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setSelectedDomain(null)}>
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Create Domain Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full max-w-lg">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Domain</CardTitle>
                            <CardDescription>
                                Add a new sending domain to your server
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="domainName">Domain Name</Label>
                                <Input
                                    id="domainName"
                                    placeholder="example.com"
                                    value={newDomain.name}
                                    onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateDomain} disabled={!newDomain.name}>
                                    Add Domain
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
