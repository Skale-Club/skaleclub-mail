import { useEffect, useMemo, useState } from 'react'
import { Copy, KeyRound, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
    apiFetch,
    loadOrganizations,
    matchesSearch,
    type OrganizationOption,
} from './helpers'

type CredentialRecord = {
    id: string
    organizationId: string
    name: string
    type: 'smtp' | 'api'
    key: string
    lastUsedAt: string | null
    expiresAt: string | null
    createdAt: string
}

type CredentialForm = {
    name: string
    type: CredentialRecord['type']
    key: string
    secret: string
}

const initialForm: CredentialForm = {
    name: '',
    type: 'smtp',
    key: '',
    secret: '',
}

export default function CredentialsPage() {
    const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState('')
    const [credentials, setCredentials] = useState<CredentialRecord[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [form, setForm] = useState<CredentialForm>(initialForm)
    const [isLoading, setIsLoading] = useState(true)
    const [generatedSecret, setGeneratedSecret] = useState<string | null>(null)

    useEffect(() => {
        void bootstrap()
    }, [])

    useEffect(() => {
        if (selectedOrgId) {
            void fetchCredentials(selectedOrgId)
        }
    }, [selectedOrgId])

    async function bootstrap() {
        try {
            const orgOptions = await loadOrganizations()
            setOrganizations(orgOptions)
            if (orgOptions.length > 0) {
                setSelectedOrgId(orgOptions[0].id)
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error loading organizations:', error)
            setIsLoading(false)
        }
    }

    async function fetchCredentials(organizationId: string) {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ credentials: CredentialRecord[] }>(`/api/credentials?organizationId=${organizationId}`)
            setCredentials(data.credentials || [])
        } catch (error) {
            console.error('Error fetching credentials:', error)
            setCredentials([])
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateCredential() {
        try {
            const data = await apiFetch<{ credential: CredentialRecord }>('/api/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: selectedOrgId,
                    name: form.name,
                    type: form.type,
                    key: form.key,
                    secret: form.secret || undefined,
                }),
            })
            setCredentials((current) => [data.credential, ...current])
            setGeneratedSecret(form.secret || null)
            setForm(initialForm)
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to create credential')
        }
    }

    async function handleRegenerate(credentialId: string) {
        try {
            const data = await apiFetch<{ newKey: string; newSecret: string }>(`/api/credentials/${credentialId}/regenerate`, {
                method: 'POST',
            })
            setGeneratedSecret(data.newSecret)
            setCredentials((current) =>
                current.map((item) => item.id === credentialId ? { ...item, key: data.newKey } : item)
            )
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to regenerate credential')
        }
    }

    async function handleDelete(credentialId: string) {
        if (!window.confirm('Delete this credential?')) {
            return
        }

        try {
            await apiFetch(`/api/credentials/${credentialId}`, { method: 'DELETE' })
            setCredentials((current) => current.filter((item) => item.id !== credentialId))
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to delete credential')
        }
    }

    function copy(value: string) {
        navigator.clipboard.writeText(value).catch(() => {})
    }

    const filteredCredentials = useMemo(
        () =>
            credentials.filter((credential) =>
                matchesSearch(credential.name, searchQuery) ||
                matchesSearch(credential.key, searchQuery)
            ),
        [credentials, searchQuery]
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Credentials</h2>
                    <p className="text-muted-foreground">Generate SMTP or API credentials for each organization.</p>
                </div>
            </div>

            <Card>
                <CardContent className="grid gap-4 pt-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <Field label="Organization">
                        <select
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
                    </Field>
                    <Field label="Search">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                placeholder="Search credentials"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </Field>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle>Create credential</CardTitle>
                        <CardDescription>
                            Use a stable key and store the generated secret outside the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field label="Name">
                            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                        </Field>
                        <Field label="Type">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.type}
                                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CredentialRecord['type'] }))}
                            >
                                <option value="smtp">SMTP</option>
                                <option value="api">API</option>
                            </select>
                        </Field>
                        <Field label="Key">
                            <Input value={form.key} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))} />
                        </Field>
                        <Field label="Secret (optional)">
                            <Input value={form.secret} onChange={(event) => setForm((current) => ({ ...current, secret: event.target.value }))} />
                        </Field>
                        <Button className="w-full" onClick={handleCreateCredential} disabled={!selectedOrgId || !form.name || !form.key}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create credential
                        </Button>
                        {generatedSecret && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                <p className="font-medium">Latest secret</p>
                                <p className="mt-1 break-all font-mono text-xs">{generatedSecret}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing credentials</CardTitle>
                        <CardDescription>Regenerate secrets if one has been exposed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <p className="py-8 text-center text-muted-foreground">Loading credentials...</p>
                        ) : filteredCredentials.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No credentials found.</p>
                        ) : (
                            filteredCredentials.map((credential) => (
                                <div key={credential.id} className="rounded-lg border p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{credential.name}</span>
                                                <TypePill type={credential.type} />
                                            </div>
                                            <p className="break-all font-mono text-xs text-muted-foreground">{credential.key}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Created {new Date(credential.createdAt).toLocaleString()}
                                                {credential.lastUsedAt ? ` • Last used ${new Date(credential.lastUsedAt).toLocaleString()}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" onClick={() => copy(credential.key)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy key
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleRegenerate(credential.id)}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Regenerate
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(credential.id)}>
                                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
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

function TypePill({ type }: { type: CredentialRecord['type'] }) {
    return (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {type.toUpperCase()}
        </span>
    )
}
