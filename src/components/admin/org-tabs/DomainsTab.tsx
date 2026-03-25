import { useEffect, useMemo, useState } from 'react'
import { Globe, Plus, Search, CheckCircle, XCircle, Trash2, Copy, RefreshCw, Loader2, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { fetchWithAuth } from './shared'

interface Domain {
    id: string
    orgId: string
    name: string
    verificationToken: string
    verificationStatus: 'pending' | 'verified' | 'failed'
    verificationMethod: string | null
    spfStatus: string | null
    spfError: string | null
    dkimStatus: string | null
    dkimError: string | null
    dmarcStatus: string | null
    dmarcError: string | null
    mxStatus: string | null
    mxError: string | null
    returnPathStatus: string | null
    returnPathError: string | null
    dkimSelector: string | null
    dkimPublicKey: string | null
    verifiedAt: string | null
    createdAt: string
}

interface DnsRecord {
    key: string
    label: string
    type: string
    name: string
    value: string
    priority?: string
    status: 'success' | 'error' | 'pending'
}

interface DnsResults {
    verification: { found: boolean }
    spf: { found: boolean; error: string | null }
    dkim: { found: boolean; error: string | null }
    dmarc: { found: boolean; error: string | null }
    mx: { found: boolean; error: string | null }
    returnPath: { found: boolean; error: string | null }
}

interface DomainsTabProps {
    orgId: string
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
}

function StatusBadge({ status }: { status: 'success' | 'error' | 'pending' }) {
    if (status === 'success') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
            </span>
        )
    }
    if (status === 'error') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="h-3.5 w-3.5" />
                Error
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
        </span>
    )
}

function DnsRecordCard({ record, onCheck, isChecking, disabled }: {
    record: DnsRecord
    onCheck: () => void
    isChecking: boolean
    disabled?: boolean
}) {
    return (
        <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{record.label}</h4>
                <div className="flex items-center gap-2">
                    <StatusBadge status={record.status} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 focus-visible:ring-0 focus-visible:ring-offset-0" onClick={onCheck} disabled={disabled || isChecking} title="Check this record">
                        <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className={`grid gap-4 ${record.priority ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</span>
                    <div>
                        <code className="rounded bg-muted px-2.5 py-1.5 text-xs font-mono">{record.type}</code>
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</span>
                    <div className="flex items-center gap-1.5">
                        <code className="flex-1 truncate rounded bg-muted px-2.5 py-1.5 text-xs font-mono">{record.name}</code>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(record.name)} title="Copy name">
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                {record.priority && (
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</span>
                        <div className="flex items-center gap-1.5">
                            <code className="flex-1 truncate rounded bg-muted px-2.5 py-1.5 text-xs font-mono">{record.priority}</code>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(record.priority!)} title="Copy priority">
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
                <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Value</span>
                    <div className="flex items-center gap-1.5">
                        <code className="flex-1 truncate rounded bg-muted px-2.5 py-1.5 text-xs font-mono">{record.value}</code>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(record.value)} title="Copy value">
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {record.status === 'error' && (
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    The {record.label} values in your platform and in your domain provider account mismatch. Add this value to your domain provider account to authenticate this domain.
                </div>
            )}
            {record.status === 'success' && (
                <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    The {record.label} values in your platform and your domain provider account match.
                </div>
            )}
        </div>
    )
}

export default function DomainsTab({ orgId }: DomainsTabProps) {
    const [domains, setDomains] = useState<Domain[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
    const [dnsResults, setDnsResults] = useState<DnsResults | null>(null)
    const [checkingRecord, setCheckingRecord] = useState<string | null>(null)
    const [verifyingAll, setVerifyingAll] = useState(false)
    const [newDomain, setNewDomain] = useState({
        name: '',
        verificationMethod: 'dns',
    })

    useEffect(() => {
        void fetchDomains()
    }, [orgId])

    async function fetchDomains() {
        setIsLoading(true)
        try {
            const response = await fetchWithAuth(`/api/domains?organizationId=${orgId}`)

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

    const filteredDomains = useMemo(() => (
        domains.filter((domain) =>
            domain.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ), [domains, searchQuery])

    async function handleCreateDomain() {
        if (!newDomain.name.trim()) return

        try {
            const response = await fetchWithAuth('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: orgId,
                    name: newDomain.name.trim(),
                    verificationMethod: newDomain.verificationMethod,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setDomains((current) => [data.domain, ...current])
                setNewDomain({ name: '', verificationMethod: 'dns' })
                setShowCreateModal(false)
                setSelectedDomain(data.domain)
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to create domain')
            }
        } catch (error) {
            console.error('Error creating domain:', error)
        }
    }

    async function handleVerifyDomain(domainId: string, recordKey: string) {
        setCheckingRecord(recordKey)
        try {
            const response = await fetchWithAuth(`/api/domains/${domainId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ record: recordKey }),
            })

            if (response.ok) {
                const data = await response.json()
                setDomains((current) =>
                    current.map((domain) => domain.id === domainId ? data.domain : domain)
                )
                if (selectedDomain?.id === domainId) {
                    setSelectedDomain(data.domain)
                }
                setDnsResults(data.dnsResults || null)
            } else {
                const error = await response.json()
                alert(error.error || 'Verification failed')
            }
        } catch (error) {
            console.error('Error verifying domain:', error)
        } finally {
            setCheckingRecord(null)
        }
    }

    async function handleVerifyAll(domainId: string) {
        setVerifyingAll(true)
        try {
            const response = await fetchWithAuth(`/api/domains/${domainId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            if (response.ok) {
                const data = await response.json()
                setDomains((current) =>
                    current.map((domain) => domain.id === domainId ? data.domain : domain)
                )
                if (selectedDomain?.id === domainId) {
                    setSelectedDomain(data.domain)
                }
                setDnsResults(data.dnsResults || null)
            } else {
                const error = await response.json()
                alert(error.error || 'Verification failed')
            }
        } catch (error) {
            console.error('Error verifying domain:', error)
        } finally {
            setVerifyingAll(false)
        }
    }

    async function handleDeleteDomain(domainId: string) {
        if (!confirm('Are you sure you want to delete this domain?')) return

        try {
            const response = await fetchWithAuth(`/api/domains/${domainId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setDomains((current) => current.filter((domain) => domain.id !== domainId))
                if (selectedDomain?.id === domainId) {
                    setSelectedDomain(null)
                }
            }
        } catch (error) {
            console.error('Error deleting domain:', error)
        }
    }

    function getDnsRecords(domain: Domain): DnsRecord[] {
        // Use live dnsResults when available (after clicking "Check records"),
        // otherwise fall back to persisted DB status
        function statusFor(
            dbStatus: string | null | undefined,
            resultsKey: keyof NonNullable<typeof dnsResults>,
        ): DnsRecord['status'] {
            if (dnsResults) {
                return dnsResults[resultsKey].found ? 'success' : 'error'
            }
            if (dbStatus === 'verified') return 'success'
            if (dbStatus === 'failed') return 'error'
            return 'pending'
        }

        return [
            {
                key: 'verification',
                label: 'Skale Club Verification',
                type: 'TXT',
                name: '@',
                value: `skaleclub-verification:${domain.verificationToken}`,
                status: statusFor(domain.verificationStatus, 'verification'),
            },
            {
                key: 'spf',
                label: 'SPF Record',
                type: 'TXT',
                name: '@',
                value: 'v=spf1 include:spf.skaleclub.com ~all',
                status: statusFor(domain.spfStatus, 'spf'),
            },
            {
                key: 'dkim',
                label: 'DKIM Record',
                type: 'TXT',
                name: 'skaleclub._domainkey',
                value: domain.dkimPublicKey || '(generated after domain verification)',
                status: statusFor(domain.dkimStatus, 'dkim'),
            },
            {
                key: 'dmarc',
                label: 'DMARC Record',
                type: 'TXT',
                name: '_dmarc',
                value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain.name}`,
                status: statusFor(domain.dmarcStatus, 'dmarc'),
            },
            {
                key: 'mx',
                label: 'MX Record',
                type: 'MX',
                name: '@',
                value: 'mx.skaleclub.com',
                priority: '10',
                status: statusFor(domain.mxStatus, 'mx'),
            },
            {
                key: 'returnPath',
                label: 'Return-Path',
                type: 'CNAME',
                name: 'rp',
                value: 'rp.skaleclub.com',
                status: statusFor(domain.returnPathStatus, 'returnPath'),
            },
        ]
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Domains</h3>
                    <p className="text-sm text-muted-foreground">Manage sending domains and DNS authentication.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-10"
                    placeholder="Search domains..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
            ) : filteredDomains.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No domains found. Add a domain to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredDomains.map((domain) => {
                        const isAuthenticated =
                            domain.verificationStatus === 'verified' &&
                            domain.spfStatus === 'verified' &&
                            domain.dkimStatus === 'verified' &&
                            domain.dmarcStatus === 'verified' &&
                            domain.mxStatus === 'verified' &&
                            domain.returnPathStatus === 'verified'
                        const isFailed =
                            !isAuthenticated &&
                            (domain.verificationStatus === 'failed' ||
                                domain.spfStatus === 'failed' ||
                                domain.dkimStatus === 'failed' ||
                                domain.dmarcStatus === 'failed' ||
                                domain.mxStatus === 'failed' ||
                                domain.returnPathStatus === 'failed')
                        const isSelected = selectedDomain?.id === domain.id

                        return (
                            <Card
                                key={domain.id}
                                className="cursor-pointer transition-all hover:shadow-md"
                                onClick={() => { setSelectedDomain(isSelected ? null : domain); setDnsResults(null) }}
                            >
                                <CardContent className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isAuthenticated
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                : isFailed
                                                    ? 'bg-red-100 dark:bg-red-900/30'
                                                    : 'bg-amber-100 dark:bg-amber-900/30'
                                            }`}>
                                            <Globe className={`h-5 w-5 ${isAuthenticated
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : isFailed
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-amber-600 dark:text-amber-400'
                                                }`} />
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-medium">{domain.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Added {new Date(domain.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium ${isAuthenticated
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : isFailed
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {isAuthenticated ? 'Authenticated' : isFailed ? 'Failed' : 'Pending'}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteDomain(domain.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* DNS Records Modal */}
            {selectedDomain && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={() => { setSelectedDomain(null); setDnsResults(null) }}>
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle>DNS records for domain authentication</CardTitle>
                                    <CardDescription className="mt-1.5">
                                        Add these DNS records to your domain provider to authenticate <strong>{selectedDomain.name}</strong>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleVerifyAll(selectedDomain.id)}
                                        disabled={verifyingAll || checkingRecord !== null}
                                        className="gap-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    >
                                        {verifyingAll
                                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…</>
                                            : <><RefreshCw className="h-3.5 w-3.5" /> Verify all</>
                                        }
                                    </Button>
                                    <Button variant="ghost" size="icon" className="focus-visible:ring-0 focus-visible:ring-offset-0" onClick={() => { setSelectedDomain(null); setDnsResults(null) }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {getDnsRecords(selectedDomain).map((record) => (
                                <DnsRecordCard
                                    key={record.key}
                                    record={record}
                                    onCheck={() => handleVerifyDomain(selectedDomain.id, record.key)}
                                    isChecking={checkingRecord === record.key}
                                    disabled={verifyingAll || checkingRecord !== null}
                                />
                            ))}

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Need help? After adding these DNS records at your domain provider, click the refresh icon on each record to verify. DNS changes can take up to 48 hours to propagate.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => { setSelectedDomain(null); setDnsResults(null) }}>
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Create Domain Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>Add Domain</CardTitle>
                                    <CardDescription>Add a new sending domain to this organization.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="domainName">Domain Name</Label>
                                <Input
                                    id="domainName"
                                    placeholder="example.com"
                                    value={newDomain.name}
                                    onChange={(event) => setNewDomain((current) => ({ ...current, name: event.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the domain you want to send emails from (e.g., yourdomain.com)
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateDomain} disabled={!newDomain.name.trim()}>
                                    Add Domain
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
