import { useEffect, useMemo, useState } from 'react'
import { Eye, Mail, RefreshCw, Search, Trash2 } from 'lucide-react'
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

type MessageRecord = {
    id: string
    organizationId: string
    messageId: string | null
    token: string
    direction: 'incoming' | 'outgoing'
    fromAddress: string
    fromName: string | null
    toAddresses: string[]
    subject: string | null
    plainBody?: string | null
    htmlBody?: string | null
    status: 'pending' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'held' | 'failed'
    held: boolean
    heldReason: string | null
    sentAt: string | null
    deliveredAt: string | null
    openedAt: string | null
    createdAt: string
}

export default function MessagesPage() {
    const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState('')
    const [messages, setMessages] = useState<MessageRecord[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [directionFilter, setDirectionFilter] = useState('all')
    const [selectedMessage, setSelectedMessage] = useState<MessageRecord | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        void bootstrap()
    }, [])

    useEffect(() => {
        if (selectedOrgId) {
            void fetchMessages(selectedOrgId)
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

    async function fetchMessages(organizationId: string) {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                organizationId,
                limit: '100',
            })
            const data = await apiFetch<{ messages: MessageRecord[] }>(`/api/messages?${params.toString()}`)
            setMessages(data.messages || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
            setMessages([])
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(messageId: string) {
        if (!window.confirm('Delete this message?')) {
            return
        }

        try {
            await apiFetch(`/api/messages/${messageId}`, { method: 'DELETE' })
            setMessages((current) => current.filter((message) => message.id !== messageId))
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null)
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to delete message')
        }
    }

    async function handleRelease(messageId: string) {
        try {
            const data = await apiFetch<{ message: MessageRecord }>(`/api/messages/${messageId}/release`, {
                method: 'POST',
            })
            setMessages((current) => current.map((message) => message.id === messageId ? data.message : message))
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(data.message)
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to release message')
        }
    }

    const filteredMessages = useMemo(
        () =>
            messages.filter((message) => {
                const matches =
                    matchesSearch(message.subject || '', searchQuery) ||
                    matchesSearch(message.fromAddress, searchQuery) ||
                    matchesSearch(message.toAddresses.join(', '), searchQuery)
                const statusMatches = statusFilter === 'all' || message.status === statusFilter
                const directionMatches = directionFilter === 'all' || message.direction === directionFilter
                return matches && statusMatches && directionMatches
            }),
        [messages, searchQuery, statusFilter, directionFilter]
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                    <p className="text-muted-foreground">Inspect recent inbound and outbound traffic.</p>
                </div>
                <Button variant="outline" onClick={() => selectedOrgId && fetchMessages(selectedOrgId)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardContent className="grid gap-4 pt-6 lg:grid-cols-[240px_minmax(0,1fr)_180px_180px]">
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
                                placeholder="Search by subject, sender or recipient"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </Field>
                    <Field label="Status">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="queued">Queued</option>
                            <option value="sent">Sent</option>
                            <option value="delivered">Delivered</option>
                            <option value="bounced">Bounced</option>
                            <option value="held">Held</option>
                            <option value="failed">Failed</option>
                        </select>
                    </Field>
                    <Field label="Direction">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={directionFilter}
                            onChange={(event) => setDirectionFilter(event.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="incoming">Incoming</option>
                            <option value="outgoing">Outgoing</option>
                        </select>
                    </Field>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent messages</CardTitle>
                        <CardDescription>Up to the latest 100 messages for the selected organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <p className="py-8 text-center text-muted-foreground">Loading messages...</p>
                        ) : filteredMessages.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No messages found.</p>
                        ) : (
                            filteredMessages.map((message) => (
                                <div key={message.id} className="rounded-lg border p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{message.subject || '(no subject)'}</span>
                                                <MessageStatus status={message.status} />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {message.fromAddress} → {message.toAddresses.join(', ')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(message.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                            {message.held && (
                                                <Button variant="outline" size="sm" onClick={() => handleRelease(message.id)}>
                                                    Release
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(message.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Message detail</CardTitle>
                        <CardDescription>{selectedMessage ? selectedMessage.subject || '(no subject)' : 'Select a message'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedMessage ? (
                            <p className="text-sm text-muted-foreground">No message selected.</p>
                        ) : (
                            <>
                                <Detail label="From" value={selectedMessage.fromAddress} />
                                <Detail label="To" value={selectedMessage.toAddresses.join(', ')} />
                                <Detail label="Status" value={selectedMessage.status} />
                                <Detail label="Direction" value={selectedMessage.direction} />
                                <Detail label="Sent at" value={selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleString() : 'Not sent'} />
                                <Detail label="Opened at" value={selectedMessage.openedAt ? new Date(selectedMessage.openedAt).toLocaleString() : 'Not opened'} />
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Body</p>
                                    <div className="max-h-80 overflow-auto rounded-lg border bg-muted/30 p-3 text-sm">
                                        {selectedMessage.plainBody || selectedMessage.htmlBody || 'No body stored.'}
                                    </div>
                                </div>
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

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm">{value}</p>
        </div>
    )
}

function MessageStatus({ status }: { status: MessageRecord['status'] }) {
    const className =
        status === 'delivered'
            ? 'bg-emerald-100 text-emerald-800'
            : status === 'sent'
            ? 'bg-blue-100 text-blue-800'
            : status === 'held'
            ? 'bg-amber-100 text-amber-800'
            : status === 'failed' || status === 'bounced'
            ? 'bg-red-100 text-red-800'
            : 'bg-slate-100 text-slate-800'

    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>
}
