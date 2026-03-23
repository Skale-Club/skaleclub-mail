import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Copy, Globe, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
    apiFetch,
    loadOrganizations,
    loadServersForOrganizations,
    matchesSearch,
    type ServerOption,
} from './helpers'

type DomainRecord = {
    id: string
    serverId: string
    name: string
    verificationToken: string | null
    verificationStatus: 'pending' | 'verified' | 'failed'
    dkimSelector?: string | null
    dkimPublicKey?: string | null
    spfStatus?: string | null
    mxStatus?: string | null
    createdAt: string
}

export default function DomainsPage() {
    const [servers, setServers] = useState<ServerOption[]>([])
    const [selectedServerId, setSelectedServerId] = useState('')
    const [domains, setDomains] = useState<DomainRecord[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [newDomainName, setNewDomainName] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null)

    useEffect(() => {
        void bootstrap()
    }, [])

    useEffect(() => {
        if (selectedServerId) {
            void fetchDomains(selectedServerId)
        }
    }, [selectedServerId])

    async function bootstrap() {
        try {
            const organizations = await loadOrganizations()
            const serverOptions = await loadServersForOrganizations(organizations)
            setServers(serverOptions)
            if (serverOptions.length > 0) {
                setSelectedServerId(serverOptions[0].id)
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error loading servers:', error)
            setIsLoading(false)
        }
    }

    async function fetchDomains(serverId: string) {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ domains: DomainRecord[] }>(`/api/domains?serverId=${serverId}`)
            setDomains(data.domains || [])
        } catch (error) {
            console.error('Error fetching domains:', error)
            setDomains([])
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateDomain() {
        try {
            const data = await apiFetch<{ domain: DomainRecord }>('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverId: selectedServerId,
                    name: newDomainName,
                    verificationMethod: 'dns',
                }),
            })
            setDomains((current) => [data.domain, ...current])
            setNewDomainName('')
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to create domain')
        }
    }

    async function handleVerifyDomain(domainId: string) {
        try {
            const data = await apiFetch<{ domain: DomainRecord }>(`/api/domains/${domainId}/verify`, {
                method: 'POST',
            })
            setDomains((current) => current.map((item) => item.id === domainId ? data.domain : item))
            if (selectedDomain?.id === domainId) {
                setSelectedDomain(data.domain)
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to verify domain')
        }
    }

    async function handleDeleteDomain(domainId: string) {
        if (!window.confirm('Delete this domain?')) {
            return
        }

        try {
            await apiFetch(`/api/domains/${domainId}`, { method: 'DELETE' })
            setDomains((current) => current.filter((item) => item.id !== domainId))
            if (selectedDomain?.id === domainId) {
                setSelectedDomain(null)
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to delete domain')
        }
    }

    const filteredDomains = useMemo(
        () => domains.filter((domain) => matchesSearch(domain.name, searchQuery)),
        [domains, searchQuery]
    )

    const activeServer = servers.find((server) => server.id === selectedServerId) || null

    return (
        <div className="space-y-6">
            <Card className="shadow-sm-soft">
                <CardContent className="grid gap-4 pt-6 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
                    <Field label="Server">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedServerId}
                            onChange={(event) => setSelectedServerId(event.target.value)}
                        >
                            {servers.length === 0 && <option value="">No servers</option>}
                            {servers.map((server) => (
                                <option key={server.id} value={server.id}>
                                    {server.organizationName} / {server.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Search">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                placeholder="Search domains"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </Field>
                    <Field label="Add domain">
                        <div className="flex gap-2">
                            <Input
                                placeholder="example.com"
                                value={newDomainName}
                                onChange={(event) => setNewDomainName(event.target.value)}
                            />
                            <Button onClick={handleCreateDomain} disabled={!selectedServerId || !newDomainName}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </Field>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Configured domains</CardTitle>
                        <CardDescription>
                            {activeServer ? `Server ${activeServer.name}` : 'Select a server to continue'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <p className="py-8 text-center text-muted-foreground">Loading domains...</p>
                        ) : filteredDomains.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No domains configured yet.</p>
                        ) : (
                            filteredDomains.map((domain) => (
                                <div
                                    key={domain.id}
                                    className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{domain.name}</span>
                                            <StatusPill status={domain.verificationStatus} />
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <span>SPF: {domain.spfStatus || 'pending'}</span>
                                            <span>MX: {domain.mxStatus || 'pending'}</span>
                                            <span>Created: {new Date(domain.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedDomain(domain)}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            DNS
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleVerifyDomain(domain.id)}
                                            disabled={domain.verificationStatus === 'verified'}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Verify
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteDomain(domain.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>DNS instructions</CardTitle>
                        <CardDescription>
                            {selectedDomain ? `Records for ${selectedDomain.name}` : 'Select a domain to inspect its records'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedDomain ? (
                            <p className="text-sm text-muted-foreground">No domain selected.</p>
                        ) : (
                            <>
                                <DnsRecord
                                    label="Verification TXT (@ record)"
                                    value={`skaleclub-verification:${selectedDomain.verificationToken || 'Token unavailable'}`}
                                />
                                <DnsRecord
                                    label="SPF TXT (@ record)"
                                    value="v=spf1 include:spf.skaleclub.com ~all"
                                />
                                <DnsRecord
                                    label="DKIM TXT record name"
                                    value={`${selectedDomain.dkimSelector || 'skaleclub'}._domainkey.${selectedDomain.name}`}
                                />
                                <DnsRecord
                                    label="DKIM TXT record value"
                                    value={selectedDomain.dkimPublicKey || '(generated after domain verification)'}
                                />
                                <DnsRecord
                                    label="DMARC TXT (_dmarc record)"
                                    value={`v=DMARC1; p=quarantine; rua=mailto:dmarc@${selectedDomain.name}`}
                                />
                                <DnsRecord
                                    label="MX Record (@ record)"
                                    value="10 mx.skaleclub.com"
                                />
                                <DnsRecord
                                    label="Return-Path CNAME (rp record)"
                                    value="rp.skaleclub.com"
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
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

function StatusPill({ status }: { status: DomainRecord['verificationStatus'] }) {
    const className =
        status === 'verified'
            ? 'bg-primary/10 text-primary'
            : status === 'failed'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-secondary text-secondary-foreground'

    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>
}

function DnsRecord({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <code className="mt-2 block break-all rounded bg-background p-2 text-xs">{value}</code>
        </div>
    )
}
