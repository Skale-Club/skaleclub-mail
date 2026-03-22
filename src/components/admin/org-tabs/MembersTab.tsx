import { useState } from 'react'
import { Trash2, UserPlus, Users, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { getAccessToken } from './shared'

interface Member {
    id: string
    userId: string
    role: string
    user: {
        id: string
        email: string
        firstName: string | null
        lastName: string | null
    }
}

interface MembersTabProps {
    orgId: string
    members: Member[]
    isAdmin: boolean
    ownerId: string
    onRefresh: () => Promise<void>
}

function getRoleBadgeColor(role: string): string {
    switch (role) {
        case 'admin':
        case 'owner':
            return 'bg-primary text-primary-foreground'
        case 'member':
            return 'bg-secondary text-secondary-foreground'
        default:
            return 'bg-muted text-muted-foreground'
    }
}

export default function MembersTab({ orgId, members, isAdmin, ownerId, onRefresh }: MembersTabProps) {
    const [showAddMember, setShowAddMember] = useState(false)
    const [newMember, setNewMember] = useState({ email: '', role: 'member' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleAddMember() {
        setIsSubmitting(true)
        try {
            const token = await getAccessToken()
            const response = await fetch(`/api/organizations/${orgId}/members`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMember),
            })

            if (response.ok) {
                setNewMember({ email: '', role: 'member' })
                setShowAddMember(false)
                await onRefresh()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to add member')
            }
        } catch (error) {
            console.error('Error adding member:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleRemoveMember(userId: string) {
        if (!confirm('Remove this member from the organization?')) return

        try {
            const token = await getAccessToken()
            const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                await onRefresh()
            }
        } catch (error) {
            console.error('Error removing member:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Members</h3>
                    <p className="text-sm text-muted-foreground">Manage organization access and roles.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setShowAddMember(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                )}
            </div>

            {members.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No members found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                                {(member.user.firstName?.[0] || member.user.email[0]).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {[member.user.firstName, member.user.lastName].filter(Boolean).join(' ') || member.user.email}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{member.user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                                            {member.role}
                                        </span>
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            {member.userId !== ownerId && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => void handleRemoveMember(member.userId)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>Add Member</CardTitle>
                                    <CardDescription>Add a user to this organization.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddMember(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="memberEmail">Email</Label>
                                <Input
                                    id="memberEmail"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={newMember.email}
                                    onChange={(event) => setNewMember((current) => ({ ...current, email: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="memberRole">Role</Label>
                                <select
                                    id="memberRole"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={newMember.role}
                                    onChange={(event) => setNewMember((current) => ({ ...current, role: event.target.value }))}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowAddMember(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => void handleAddMember()} disabled={!newMember.email || isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add Member'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
