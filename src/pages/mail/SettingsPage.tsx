import React from 'react'
import { MailLayout } from '../../components/mail/MailLayout'
import { toast } from '../../components/ui/toaster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import {
    User,
    Bell,
    Shield,
    Palette,
    Mail,
    Plus,
    Trash2,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    ExternalLink,
    Server,
    Filter,
    Trash,
    PenTool
} from 'lucide-react'
import { apiFetch } from '../../lib/api-client'

type TabId = 'profile' | 'notifications' | 'security' | 'appearance' | 'accounts' | 'filters' | 'signatures'

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
}

const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'accounts', label: 'Accounts', icon: <Mail className="w-5 h-5" /> },
    { id: 'signatures', label: 'Signatures', icon: <PenTool className="w-5 h-5" /> },
    { id: 'filters', label: 'Filters', icon: <Filter className="w-5 h-5" /> },
]

interface Mailbox {
    id: string
    email: string
    displayName: string | null
    isDefault: boolean
    isActive: boolean
    lastSyncAt: string | null
    syncError: string | null
}

interface FilterCondition {
    field: 'from' | 'to' | 'subject' | 'body' | 'hasAttachment'
    operator: 'contains' | 'equals' | 'startsWith' | 'notContains' | 'regex'
    value: string
}

interface FilterAction {
    action: 'markRead' | 'markUnread' | 'markStarred' | 'unmarkStarred' | 'moveToFolder' | 'markSpam' | 'markNotSpam' | 'archive' | 'addLabel'
    value?: string
}

interface MailFilter {
    id: string
    name: string
    conditions: FilterCondition[]
    actions: FilterAction[]
    isActive: boolean
    priority: number
    createdAt: string
}

interface Signature {
    id: string
    mailboxId: string
    name: string
    content: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export default function MailSettingsPage() {
    const [activeTab, setActiveTab] = React.useState<TabId>('accounts')
    const [isSaving, setIsSaving] = React.useState(false)
    const [showAddAccount, setShowAddAccount] = React.useState(false)
    const [showAddFilter, setShowAddFilter] = React.useState(false)
    const [selectedMailboxId, setSelectedMailboxId] = React.useState<string | null>(null)
    const [isLoadingMailboxes, setIsLoadingMailboxes] = React.useState(false)
    const [isLoadingFilters, setIsLoadingFilters] = React.useState(false)
    const [mailboxes, setMailboxes] = React.useState<Mailbox[]>([])
    const [filters, setFilters] = React.useState<MailFilter[]>([])
    const [isTesting, setIsTesting] = React.useState(false)
    const [isSavingAccount, setIsSavingAccount] = React.useState(false)
    const [isSavingFilter, setIsSavingFilter] = React.useState(false)
    const [signatures, setSignatures] = React.useState<Signature[]>([])
    const [isLoadingSignatures, setIsLoadingSignatures] = React.useState(false)
    const [showAddSignature, setShowAddSignature] = React.useState(false)
    const [isSavingSignature, setIsSavingSignature] = React.useState(false)
    const [editingSignature, setEditingSignature] = React.useState<Signature | null>(null)

    const [newAccount, setNewAccount] = React.useState({
        email: '',
        displayName: '',
        smtpHost: '',
        smtpPort: '587',
        smtpUsername: '',
        smtpPassword: '',
        smtpSecure: true,
        imapHost: '',
        imapPort: '993',
        imapUsername: '',
        imapPassword: '',
        imapSecure: true,
        isDefault: false,
    })

    const [newFilter, setNewFilter] = React.useState({
        name: '',
        conditions: [{ field: 'from', operator: 'contains', value: '' }] as FilterCondition[],
        actions: [{ action: 'markRead' }] as FilterAction[],
        priority: 0,
    })

    const fetchMailboxes = React.useCallback(async () => {
        setIsLoadingMailboxes(true)
        try {
            const data = await apiFetch<{ mailboxes: Mailbox[] }>('/api/mail/mailboxes')
            setMailboxes(data.mailboxes || [])
            if (data.mailboxes?.length > 0 && !selectedMailboxId) {
                setSelectedMailboxId(data.mailboxes[0].id)
            }
        } catch (error) {
            console.error('Error fetching mailboxes:', error)
        } finally {
            setIsLoadingMailboxes(false)
        }
    }, [selectedMailboxId])

    const fetchFilters = React.useCallback(async () => {
        if (!selectedMailboxId) return
        setIsLoadingFilters(true)
        try {
            const data = await apiFetch<{ filters: MailFilter[] }>(`/api/mail/mailboxes/${selectedMailboxId}/filters`)
            setFilters(data.filters || [])
        } catch (error) {
            console.error('Error fetching filters:', error)
        } finally {
            setIsLoadingFilters(false)
        }
    }, [selectedMailboxId])

    React.useEffect(() => {
        fetchMailboxes()
    }, [fetchMailboxes])

    React.useEffect(() => {
        if (selectedMailboxId && activeTab === 'filters') {
            fetchFilters()
        }
    }, [selectedMailboxId, activeTab, fetchFilters])

    const fetchSignatures = React.useCallback(async () => {
        if (!selectedMailboxId) return
        setIsLoadingSignatures(true)
        try {
            const data = await apiFetch<{ signatures: Signature[] }>(`/api/mail/mailboxes/${selectedMailboxId}/signatures`)
            setSignatures(data.signatures || [])
        } catch (error) {
            console.error('Error fetching signatures:', error)
        } finally {
            setIsLoadingSignatures(false)
        }
    }, [selectedMailboxId])

    React.useEffect(() => {
        if (selectedMailboxId && activeTab === 'signatures') {
            fetchSignatures()
        }
    }, [selectedMailboxId, activeTab, fetchSignatures])

    const handleTestConnection = async () => {
        setIsTesting(true)
        try {
            const data = await apiFetch<{ data: { smtp: boolean; imap: boolean; errors?: string[] } }>('/api/mail/mailboxes/test-connection', {
                method: 'POST',
                body: JSON.stringify({
                    smtpHost: newAccount.smtpHost,
                    smtpPort: parseInt(newAccount.smtpPort),
                    smtpSecure: newAccount.smtpSecure,
                    smtpUsername: newAccount.smtpUsername || newAccount.email,
                    smtpPassword: newAccount.smtpPassword,
                    imapHost: newAccount.imapHost,
                    imapPort: parseInt(newAccount.imapPort),
                    imapSecure: newAccount.imapSecure,
                    imapUsername: newAccount.imapUsername || newAccount.email,
                    imapPassword: newAccount.imapPassword,
                }),
            })
            if (data.data?.smtp && data.data?.imap) {
                toast({ title: 'Connection successful!', variant: 'success' })
            } else {
                toast({ 
                    title: 'Connection failed', 
                    description: data.data?.errors?.join(', '),
                    variant: 'destructive' 
                })
            }
        } catch (error) {
            toast({ title: 'Connection test failed', variant: 'destructive' })
        } finally {
            setIsTesting(false)
        }
    }

    const handleAddAccount = async () => {
        setIsSavingAccount(true)
        try {
            await apiFetch('/api/mail/mailboxes', {
                method: 'POST',
                body: JSON.stringify({
                    ...newAccount,
                    smtpPort: parseInt(newAccount.smtpPort),
                    imapPort: parseInt(newAccount.imapPort),
                    smtpUsername: newAccount.smtpUsername || newAccount.email,
                    imapUsername: newAccount.imapUsername || newAccount.email,
                }),
            })
            setShowAddAccount(false)
            setNewAccount({
                email: '',
                displayName: '',
                smtpHost: '',
                smtpPort: '587',
                smtpUsername: '',
                smtpPassword: '',
                smtpSecure: true,
                imapHost: '',
                imapPort: '993',
                imapUsername: '',
                imapPassword: '',
                imapSecure: true,
                isDefault: false,
            })
            fetchMailboxes()
            toast({ title: 'Account added successfully', variant: 'success' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to add account'
            toast({ title: 'Failed to add account', description: message, variant: 'destructive' })
        } finally {
            setIsSavingAccount(false)
        }
    }

    const handleDeleteMailbox = async (id: string) => {
        try {
            await apiFetch(`/api/mail/mailboxes/${id}`, { method: 'DELETE' })
            fetchMailboxes()
            toast({ title: 'Account removed successfully', variant: 'success' })
        } catch (error) {
            toast({ title: 'Failed to remove account', variant: 'destructive' })
        }
    }

    const handleAddFilter = async () => {
        if (!selectedMailboxId) return
        setIsSavingFilter(true)
        try {
            await apiFetch(`/api/mail/mailboxes/${selectedMailboxId}/filters`, {
                method: 'POST',
                body: JSON.stringify({
                    name: newFilter.name,
                    conditions: newFilter.conditions.filter(c => c.value),
                    actions: newFilter.actions,
                    priority: newFilter.priority,
                }),
            })
            setShowAddFilter(false)
            setNewFilter({
                name: '',
                conditions: [{ field: 'from', operator: 'contains', value: '' }],
                actions: [{ action: 'markRead' }],
                priority: 0,
            })
            fetchFilters()
            toast({ title: 'Filter created successfully', variant: 'success' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create filter'
            toast({ title: 'Failed to create filter', description: message, variant: 'destructive' })
        } finally {
            setIsSavingFilter(false)
        }
    }

    const handleDeleteFilter = async (id: string) => {
        if (!selectedMailboxId) return
        try {
            await apiFetch(`/api/mail/mailboxes/${selectedMailboxId}/filters/${id}`, { method: 'DELETE' })
            fetchFilters()
            toast({ title: 'Filter deleted successfully', variant: 'success' })
        } catch (error) {
            toast({ title: 'Failed to delete filter', variant: 'destructive' })
        }
    }

    const handleToggleFilter = async (id: string, isActive: boolean) => {
        if (!selectedMailboxId) return
        try {
            await apiFetch(`/api/mail/mailboxes/${selectedMailboxId}/filters/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive }),
            })
            fetchFilters()
        } catch (error) {
            toast({ title: 'Failed to update filter', variant: 'destructive' })
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        toast({ title: 'Settings saved successfully', variant: 'success' })
    }

    const addCondition = () => {
        setNewFilter({ ...newFilter, conditions: [...newFilter.conditions, { field: 'from', operator: 'contains', value: '' }] })
    }

    const removeCondition = (index: number) => {
        setNewFilter({ ...newFilter, conditions: newFilter.conditions.filter((_, i) => i !== index) })
    }

    const updateCondition = (index: number, field: keyof FilterCondition, value: string) => {
        const updated = [...newFilter.conditions]
        updated[index] = { ...updated[index], [field]: value }
        setNewFilter({ ...newFilter, conditions: updated })
    }

    const addAction = () => {
        setNewFilter({ ...newFilter, actions: [...newFilter.actions, { action: 'markRead' }] })
    }

    const removeAction = (index: number) => {
        setNewFilter({ ...newFilter, actions: newFilter.actions.filter((_, i) => i !== index) })
    }

    const updateAction = (index: number, field: keyof FilterAction, value: string) => {
        const updated = [...newFilter.actions]
        updated[index] = { ...updated[index], [field]: value }
        setNewFilter({ ...newFilter, actions: updated })
    }

    return (
        <MailLayout>
            <div className="h-full overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your email account settings
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                            ${activeTab === tab.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="flex-1">
                            {activeTab === 'accounts' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="w-5 h-5" />
                                                Connected Email Accounts
                                            </CardTitle>
                                            <CardDescription>
                                                Add external email accounts to send and receive emails
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {isLoadingMailboxes ? (
                                                <p className="text-gray-500">Loading accounts...</p>
                                            ) : mailboxes.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                                    <p className="text-gray-500 mb-4">No email accounts connected yet</p>
                                                    <Button onClick={() => setShowAddAccount(true)}>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Email Account
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {mailboxes.map((mb) => (
                                                        <div key={mb.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                    <Mail className="w-6 h-6 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium">{mb.email}</h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        {mb.isDefault && <span className="text-blue-600">Default • </span>}
                                                                        {mb.lastSyncAt ? `Last sync: ${new Date(mb.lastSyncAt).toLocaleString()}` : 'Not synced'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {mb.syncError ? (
                                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                                ) : (
                                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                                )}
                                                                <Button variant="outline" size="sm" onClick={fetchMailboxes}>
                                                                    <RefreshCw className="w-4 h-4" />
                                                                </Button>
                                                                <Button variant="outline" size="sm" onClick={() => handleDeleteMailbox(mb.id)}>
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button onClick={() => setShowAddAccount(true)} className="mt-4">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Email Account
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Server className="w-5 h-5" />
                                                How to Connect External Email
                                            </CardTitle>
                                            <CardDescription>
                                                Follow these instructions to connect your email provider
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Gmail</h4>
                                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <li><strong>SMTP:</strong> smtp.gmail.com</li>
                                                        <li><strong>IMAP:</strong> imap.gmail.com</li>
                                                        <li><strong>Port:</strong> 587 (SMTP) / 993 (IMAP)</li>
                                                        <li><strong>Security:</strong> TLS/SSL</li>
                                                        <li><strong>Note:</strong> Enable 2-Step Verification and use App Password</li>
                                                    </ul>
                                                </div>
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Outlook.com</h4>
                                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <li><strong>SMTP:</strong> smtp-mail.outlook.com</li>
                                                        <li><strong>IMAP:</strong> outlook.office365.com</li>
                                                        <li><strong>Port:</strong> 587 (SMTP) / 993 (IMAP)</li>
                                                        <li><strong>Security:</strong> TLS/SSL</li>
                                                        <li><strong>Note:</strong> Use your regular password</li>
                                                    </ul>
                                                </div>
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Yahoo</h4>
                                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <li><strong>SMTP:</strong> smtp.mail.yahoo.com</li>
                                                        <li><strong>IMAP:</strong> imap.mail.yahoo.com</li>
                                                        <li><strong>Port:</strong> 587 (SMTP) / 993 (IMAP)</li>
                                                        <li><strong>Security:</strong> TLS/SSL</li>
                                                        <li><strong>Note:</strong> Use App Password</li>
                                                    </ul>
                                                </div>
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">iCloud Mail</h4>
                                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <li><strong>SMTP:</strong> smtp.mail.me.com</li>
                                                        <li><strong>IMAP:</strong> imap.mail.me.com</li>
                                                        <li><strong>Port:</strong> 587 (SMTP) / 993 (IMAP)</li>
                                                        <li><strong>Security:</strong> TLS/SSL</li>
                                                        <li><strong>Note:</strong> Enable 2FA and use App Specific Password</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Notes</h4>
                                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                                                    <li>• Use your <strong>email address</strong> as username (e.g., yourname@gmail.com)</li>
                                                    <li>• For Gmail/Yahoo/iCloud, generate an <strong>App Password</strong> in your account security settings</li>
                                                    <li>• Make sure <strong>IMAP</strong> is enabled in your email provider settings</li>
                                                    <li>• Port 587 uses STARTTLS, Port 993 uses SSL/TLS</li>
                                                </ul>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <ExternalLink className="w-4 h-4" />
                                                <a 
                                                    href="https://support.google.com/mail/answer/7129" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="hover:text-blue-600 hover:underline"
                                                >
                                                    Learn more about enabling IMAP in Gmail
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {showAddAccount && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Add New Email Account</CardTitle>
                                                <CardDescription>
                                                    Enter your email account details
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div>
                                                    <h4 className="font-medium mb-4">Account Information</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Email Address</Label>
                                                            <Input
                                                                type="email"
                                                                value={newAccount.email}
                                                                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                                                                placeholder="your@email.com"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Display Name</Label>
                                                            <Input
                                                                value={newAccount.displayName}
                                                                onChange={(e) => setNewAccount({ ...newAccount, displayName: e.target.value })}
                                                                placeholder="Your Name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={newAccount.isDefault}
                                                                onCheckedChange={(checked) => setNewAccount({ ...newAccount, isDefault: checked })}
                                                            />
                                                            <Label>Set as default account</Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                                        <Server className="w-4 h-4" />
                                                        SMTP Settings (Sending)
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label>SMTP Host</Label>
                                                            <Input
                                                                value={newAccount.smtpHost}
                                                                onChange={(e) => setNewAccount({ ...newAccount, smtpHost: e.target.value })}
                                                                placeholder="smtp.gmail.com"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Port</Label>
                                                            <Input
                                                                type="number"
                                                                value={newAccount.smtpPort}
                                                                onChange={(e) => setNewAccount({ ...newAccount, smtpPort: e.target.value })}
                                                                placeholder="587"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Username (usually same as email)</Label>
                                                            <Input
                                                                value={newAccount.smtpUsername}
                                                                onChange={(e) => setNewAccount({ ...newAccount, smtpUsername: e.target.value })}
                                                                placeholder="your@email.com"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <Label>Password / App Password</Label>
                                                            <Input
                                                                type="password"
                                                                value={newAccount.smtpPassword}
                                                                onChange={(e) => setNewAccount({ ...newAccount, smtpPassword: e.target.value })}
                                                                placeholder="••••••••"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-6">
                                                            <Switch
                                                                checked={newAccount.smtpSecure}
                                                                onCheckedChange={(checked) => setNewAccount({ ...newAccount, smtpSecure: checked })}
                                                            />
                                                            <Label>Use SSL/TLS (Port 993/465)</Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                                        <Server className="w-4 h-4" />
                                                        IMAP Settings (Receiving)
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label>IMAP Host</Label>
                                                            <Input
                                                                value={newAccount.imapHost}
                                                                onChange={(e) => setNewAccount({ ...newAccount, imapHost: e.target.value })}
                                                                placeholder="imap.gmail.com"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Port</Label>
                                                            <Input
                                                                type="number"
                                                                value={newAccount.imapPort}
                                                                onChange={(e) => setNewAccount({ ...newAccount, imapPort: e.target.value })}
                                                                placeholder="993"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Username (usually same as email)</Label>
                                                            <Input
                                                                value={newAccount.imapUsername}
                                                                onChange={(e) => setNewAccount({ ...newAccount, imapUsername: e.target.value })}
                                                                placeholder="your@email.com"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <Label>Password / App Password</Label>
                                                            <Input
                                                                type="password"
                                                                value={newAccount.imapPassword}
                                                                onChange={(e) => setNewAccount({ ...newAccount, imapPassword: e.target.value })}
                                                                placeholder="••••••••"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-6">
                                                            <Switch
                                                                checked={newAccount.imapSecure}
                                                                onCheckedChange={(checked) => setNewAccount({ ...newAccount, imapSecure: checked })}
                                                            />
                                                            <Label>Use SSL/TLS (Port 993)</Label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={handleTestConnection}
                                                        disabled={isTesting || !newAccount.email || !newAccount.smtpHost || !newAccount.imapHost}
                                                    >
                                                        {isTesting ? 'Testing...' : 'Test Connection'}
                                                    </Button>
                                                    <Button 
                                                        onClick={handleAddAccount}
                                                        disabled={isSavingAccount || !newAccount.email || !newAccount.smtpHost || !newAccount.imapHost}
                                                    >
                                                        {isSavingAccount ? 'Adding...' : 'Add Account'}
                                                    </Button>
                                                    <Button variant="ghost" onClick={() => setShowAddAccount(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {activeTab === 'filters' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Filter className="w-5 h-5" />
                                                Email Filters
                                            </CardTitle>
                                            <CardDescription>
                                                Create rules to automatically organize your emails
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {mailboxes.length > 0 && (
                                                <div className="mb-4">
                                                    <Label>Select Account</Label>
                                                    <select
                                                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                        value={selectedMailboxId || ''}
                                                        onChange={(e) => setSelectedMailboxId(e.target.value)}
                                                    >
                                                        <option value="">Select an account...</option>
                                                        {mailboxes.map((mb) => (
                                                            <option key={mb.id} value={mb.id}>{mb.email}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {isLoadingFilters ? (
                                                <p className="text-gray-500">Loading filters...</p>
                                            ) : filters.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                                    <p className="text-gray-500 mb-4">No filters created yet</p>
                                                    {selectedMailboxId && (
                                                        <Button onClick={() => setShowAddFilter(true)}>
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Create Filter
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {filters.map((filter) => (
                                                        <div key={filter.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                            <div className="flex items-center gap-4">
                                                                <Switch
                                                                    checked={filter.isActive}
                                                                    onCheckedChange={(checked) => handleToggleFilter(filter.id, checked)}
                                                                />
                                                                <div>
                                                                    <h3 className="font-medium">{filter.name}</h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        {filter.conditions.length} condition(s), {filter.actions.length} action(s)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button variant="outline" size="sm" onClick={() => handleDeleteFilter(filter.id)}>
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button onClick={() => setShowAddFilter(true)} className="mt-4">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Create Filter
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {showAddFilter && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Create New Filter</CardTitle>
                                                <CardDescription>
                                                    Define conditions and actions for your filter
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div>
                                                    <Label>Filter Name</Label>
                                                    <Input
                                                        value={newFilter.name}
                                                        onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                                                        placeholder="e.g., Mark newsletters as read"
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="mb-2 block">Conditions (all must match)</Label>
                                                    <div className="space-y-2">
                                                        {newFilter.conditions.map((condition, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <select
                                                                    className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                                    value={condition.field}
                                                                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                                                                >
                                                                    <option value="from">From</option>
                                                                    <option value="to">To</option>
                                                                    <option value="subject">Subject</option>
                                                                    <option value="body">Body</option>
                                                                    <option value="hasAttachment">Has Attachment</option>
                                                                </select>
                                                                <select
                                                                    className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                                    value={condition.operator}
                                                                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                                                                >
                                                                    <option value="contains">contains</option>
                                                                    <option value="notContains">does not contain</option>
                                                                    <option value="equals">equals</option>
                                                                    <option value="startsWith">starts with</option>
                                                                    <option value="regex">matches regex</option>
                                                                </select>
                                                                {condition.field !== 'hasAttachment' && (
                                                                    <Input
                                                                        value={condition.value}
                                                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                                        placeholder="Value"
                                                                        className="flex-1"
                                                                    />
                                                                )}
                                                                {condition.field === 'hasAttachment' && (
                                                                    <select
                                                                        className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                                        value={condition.value}
                                                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                                    >
                                                                        <option value="yes">Yes</option>
                                                                        <option value="no">No</option>
                                                                    </select>
                                                                )}
                                                                <Button variant="ghost" size="sm" onClick={() => removeCondition(index)} disabled={newFilter.conditions.length === 1}>
                                                                    <Trash className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button variant="outline" size="sm" onClick={addCondition}>
                                                            <Plus className="w-4 h-4 mr-1" /> Add Condition
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="mb-2 block">Actions</Label>
                                                    <div className="space-y-2">
                                                        {newFilter.actions.map((action, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <select
                                                                    className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                                    value={action.action}
                                                                    onChange={(e) => updateAction(index, 'action', e.target.value)}
                                                                >
                                                                    <option value="markRead">Mark as read</option>
                                                                    <option value="markUnread">Mark as unread</option>
                                                                    <option value="markStarred">Star</option>
                                                                    <option value="unmarkStarred">Unstar</option>
                                                                    <option value="archive">Archive</option>
                                                                    <option value="markSpam">Mark as spam</option>
                                                                    <option value="markNotSpam">Mark as not spam</option>
                                                                </select>
                                                                <Button variant="ghost" size="sm" onClick={() => removeAction(index)} disabled={newFilter.actions.length === 1}>
                                                                    <Trash className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button variant="outline" size="sm" onClick={addAction}>
                                                            <Plus className="w-4 h-4 mr-1" /> Add Action
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button 
                                                        onClick={handleAddFilter}
                                                        disabled={isSavingFilter || !newFilter.name || newFilter.conditions.every(c => !c.value)}
                                                    >
                                                        {isSavingFilter ? 'Creating...' : 'Create Filter'}
                                                    </Button>
                                                    <Button variant="ghost" onClick={() => setShowAddFilter(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {activeTab === 'signatures' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PenTool className="w-5 h-5" />
                                                Email Signatures
                                            </CardTitle>
                                            <CardDescription>
                                                Create and manage email signatures for your accounts
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {mailboxes.length > 0 && (
                                                <div className="mb-4">
                                                    <Label>Select Account</Label>
                                                    <select
                                                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                        value={selectedMailboxId || ''}
                                                        onChange={(e) => setSelectedMailboxId(e.target.value)}
                                                    >
                                                        <option value="">Select an account...</option>
                                                        {mailboxes.map((mb) => (
                                                            <option key={mb.id} value={mb.id}>{mb.email}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {isLoadingSignatures ? (
                                                <p className="text-gray-500">Loading signatures...</p>
                                            ) : signatures.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <PenTool className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                                    <p className="text-gray-500 mb-4">No signatures created yet</p>
                                                    {selectedMailboxId && (
                                                        <Button onClick={() => setShowAddSignature(true)}>
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Create Signature
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {signatures.map((sig) => (
                                                        <div key={sig.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                                    <PenTool className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium">{sig.name}</h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        {sig.isDefault && <span className="text-blue-600">Default • </span>}
                                                                        Updated {new Date(sig.updatedAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setEditingSignature(sig)}>
                                                                    Edit
                                                                </Button>
                                                                {!sig.isDefault && (
                                                                    <Button variant="outline" size="sm" onClick={async () => {
                                                                        try {
                                                                            await apiFetch(`/api/mail/mailboxes/${selectedMailboxId}/signatures/${sig.id}`, {
                                                                                method: 'PUT',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ isDefault: true }),
                                                                            })
                                                                            fetchSignatures()
                                                                            toast({ title: 'Signature set as default', variant: 'success' })
                                                                        } catch {
                                                                            toast({ title: 'Failed to update signature', variant: 'destructive' })
                                                                        }
                                                                    }}>
                                                                        Set Default
                                                                    </Button>
                                                                )}
                                                                <Button variant="outline" size="sm" onClick={async () => {
                                                                    if (confirm('Delete this signature?')) {
                                                                        try {
                                                                            await apiFetch(`/api/mail/mailboxes/${selectedMailboxId}/signatures/${sig.id}`, { method: 'DELETE' })
                                                                            fetchSignatures()
                                                                            toast({ title: 'Signature deleted', variant: 'success' })
                                                                        } catch {
                                                                            toast({ title: 'Failed to delete signature', variant: 'destructive' })
                                                                        }
                                                                    }
                                                                }}>
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button onClick={() => setShowAddSignature(true)} className="mt-4">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Create Signature
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {(showAddSignature || editingSignature) && (
                                        <SignatureEditor
                                            mailboxId={selectedMailboxId!}
                                            signature={editingSignature}
                                            onSave={async (data) => {
                                                setIsSavingSignature(true)
                                                try {
                                                    const url = editingSignature
                                                        ? `/api/mail/mailboxes/${selectedMailboxId}/signatures/${editingSignature.id}`
                                                        : `/api/mail/mailboxes/${selectedMailboxId}/signatures`
                                                    await apiFetch(url, {
                                                        method: editingSignature ? 'PUT' : 'POST',
                                                        body: JSON.stringify(data),
                                                    })
                                                    setShowAddSignature(false)
                                                    setEditingSignature(null)
                                                    fetchSignatures()
                                                    toast({ title: editingSignature ? 'Signature updated' : 'Signature created', variant: 'success' })
                                                } catch {
                                                    toast({ title: 'Failed to save signature', variant: 'destructive' })
                                                } finally {
                                                    setIsSavingSignature(false)
                                                }
                                            }}
                                            onCancel={() => {
                                                setShowAddSignature(false)
                                                setEditingSignature(null)
                                            }}
                                            isSaving={isSavingSignature}
                                        />
                                    )}
                                </div>
                            )}

                            {activeTab !== 'accounts' && activeTab !== 'filters' && activeTab !== 'signatures' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Settings</CardTitle>
                                            <CardDescription>
                                                This section is under development
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-500">More settings coming soon...</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <Button variant="outline">Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MailLayout>
    )
}

function SignatureEditor({
    signature,
    onSave,
    onCancel,
    isSaving
}: {
    mailboxId: string
    signature: Signature | null
    onSave: (data: { name: string; content: string; isDefault: boolean }) => void
    onCancel: () => void
    isSaving: boolean
}) {
    const [name, setName] = React.useState(signature?.name || '')
    const [content, setContent] = React.useState(signature?.content || '')
    const [isDefault, setIsDefault] = React.useState(signature?.isDefault || false)

    React.useEffect(() => {
        if (signature) {
            setName(signature.name)
            setContent(signature.content)
            setIsDefault(signature.isDefault)
        }
    }, [signature])

    return (
        <Card>
            <CardHeader>
                <CardTitle>{signature ? 'Edit Signature' : 'Create New Signature'}</CardTitle>
                <CardDescription>
                    {signature ? 'Update your signature details' : 'Create a new email signature'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Signature Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Work, Personal"
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label>Signature Content</Label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Your signature..."
                        className="mt-1 w-full min-h-[200px] px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Tip: You can use HTML tags for formatting (e.g., &lt;b&gt;, &lt;i&gt;, &lt;a href="..."&gt;)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={isDefault}
                        onCheckedChange={setIsDefault}
                    />
                    <Label>Set as default signature</Label>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => onSave({ name, content, isDefault })}
                        disabled={isSaving || !name || !content}
                    >
                        {isSaving ? 'Saving...' : (signature ? 'Update' : 'Create')}
                    </Button>
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
