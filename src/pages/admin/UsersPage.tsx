import { useEffect, useMemo, useState } from 'react'
import { Mail, Plus, Search, Shield, Trash2, UserCog } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { apiFetch, matchesSearch } from './helpers'

type UserRecord = {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    isAdmin: boolean
    emailVerified: boolean
    createdAt: string
    lastLoginAt: string | null
}

const emptyCreate = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
    sendInvite: true,
}

const emptyEdit = {
    firstName: '',
    lastName: '',
    isAdmin: false,
    emailVerified: false,
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
    const [createForm, setCreateForm] = useState(emptyCreate)
    const [editForm, setEditForm] = useState(emptyEdit)

    useEffect(() => {
        void fetchUsers()
    }, [])

    async function fetchUsers() {
        setIsLoading(true)
        try {
            const data = await apiFetch<{ users: UserRecord[] }>('/api/users')
            setUsers(data.users || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            setUsers([])
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateUser() {
        try {
            const data = await apiFetch<{ user: UserRecord }>('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
            })
            setUsers((current) => [data.user, ...current])
            setCreateForm(emptyCreate)
            setShowCreateModal(false)
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to create user')
        }
    }

    function openEditModal(user: UserRecord) {
        setEditingUser(user)
        setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
        })
    }

    async function handleUpdateUser() {
        if (!editingUser) {
            return
        }

        try {
            const data = await apiFetch<{ user: UserRecord }>(`/api/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            })
            setUsers((current) => current.map((user) => user.id === editingUser.id ? data.user : user))
            setEditingUser(null)
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to update user')
        }
    }

    async function handleResendInvite(userId: string) {
        try {
            await apiFetch(`/api/users/${userId}/resend-invite`, { method: 'POST' })
            window.alert('Invitation sent.')
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to resend invitation')
        }
    }

    async function handleDeleteUser(userId: string) {
        if (!window.confirm('Delete this user?')) {
            return
        }

        try {
            await apiFetch(`/api/users/${userId}`, { method: 'DELETE' })
            setUsers((current) => current.filter((user) => user.id !== userId))
            if (editingUser?.id === userId) {
                setEditingUser(null)
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to delete user')
        }
    }

    const filteredUsers = useMemo(
        () =>
            users.filter((user) =>
                matchesSearch(user.email, searchQuery) ||
                matchesSearch(user.firstName || '', searchQuery) ||
                matchesSearch(user.lastName || '', searchQuery)
            ),
        [users, searchQuery]
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage administrator access and invitations.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New User
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-10"
                            placeholder="Search by email or name"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User directory</CardTitle>
                    <CardDescription>{filteredUsers.length} users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <p className="py-8 text-center text-muted-foreground">Loading users...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">No users found.</p>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="rounded-lg border p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{user.email}</span>
                                            {user.isAdmin && (
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'No profile name'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Created {new Date(user.createdAt).toLocaleDateString()}
                                            {user.lastLoginAt ? ` - Last login ${new Date(user.lastLoginAt).toLocaleString()}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                                            <UserCog className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleResendInvite(user.id)}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Resend invite
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Create user</CardTitle>
                            <CardDescription>Create a user directly or send an invitation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field label="Email">
                                <Input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                                />
                            </Field>
                            <Field label="Password">
                                <Input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                                />
                            </Field>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="First name">
                                    <Input
                                        value={createForm.firstName}
                                        onChange={(event) => setCreateForm((current) => ({ ...current, firstName: event.target.value }))}
                                    />
                                </Field>
                                <Field label="Last name">
                                    <Input
                                        value={createForm.lastName}
                                        onChange={(event) => setCreateForm((current) => ({ ...current, lastName: event.target.value }))}
                                    />
                                </Field>
                            </div>
                            <Toggle
                                label="Administrator"
                                checked={createForm.isAdmin}
                                onChange={(checked) => setCreateForm((current) => ({ ...current, isAdmin: checked }))}
                            />
                            <Toggle
                                label="Send invite instead of keeping password"
                                checked={createForm.sendInvite}
                                onChange={(checked) => setCreateForm((current) => ({ ...current, sendInvite: checked }))}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateUser} disabled={!createForm.email || !createForm.password}>
                                    Create user
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Edit user</CardTitle>
                            <CardDescription>{editingUser.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="First name">
                                    <Input
                                        value={editForm.firstName}
                                        onChange={(event) => setEditForm((current) => ({ ...current, firstName: event.target.value }))}
                                    />
                                </Field>
                                <Field label="Last name">
                                    <Input
                                        value={editForm.lastName}
                                        onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))}
                                    />
                                </Field>
                            </div>
                            <Toggle
                                label="Administrator"
                                checked={editForm.isAdmin}
                                onChange={(checked) => setEditForm((current) => ({ ...current, isAdmin: checked }))}
                            />
                            <Toggle
                                label="Email verified"
                                checked={editForm.emailVerified}
                                onChange={(checked) => setEditForm((current) => ({ ...current, emailVerified: checked }))}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateUser}>Save changes</Button>
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

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}) {
    return (
        <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span>{label}</span>
            <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        </label>
    )
}
