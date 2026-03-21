import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Users, Plus, Search, MoreHorizontal, Trash2, Edit, Shield, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    isAdmin: boolean
    emailVerified: boolean
    createdAt: string
    lastLoginAt: string | null
    organizations?: {
        id: string
        name: string
        role: string
    }[]
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
        isAdmin: false,
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleUpdateUser = async (id: string, updates: Partial<User>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            if (response.ok) {
                const data = await response.json()
                setUsers(users.map(u => u.id === id ? data.user : u))
                setShowEditModal(false)
                setSelectedUser(null)
            }
        } catch (error) {
            console.error('Error updating user:', error)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setUsers(users.filter(u => u.id !== id))
            }
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    const handleToggleAdmin = async (id: string, isAdmin: boolean) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAdmin }),
            })

            if (response.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, isAdmin } : u))
            }
        } catch (error) {
            console.error('Error updating user admin status:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">
                        Manage system users and their </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New User
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Users List */}
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Admin</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Verified</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Login</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No users found. Create a user to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.email}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.organizations?.length || 0} organizations
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                variant={user.isAdmin ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleToggleAdmin(user.id, !user.isAdmin)}
                                            >
                                                {user.isAdmin ? (
                                                    <Shield className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Shield className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.emailVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.emailVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500">
                                                {user.lastLoginAt
                                                    ? new Date(user.lastLoginAt).toLocaleDateString()
                                                    : 'Never'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setEditData({
                                                        firstName: user.firstName || '',
                                                        lastName: user.lastName || '',
                                                        isAdmin: user.isAdmin,
                                                    })
                                                    setShowEditModal(true)
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
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
        </div>
    )
}

{/* Edit User Modal */ }
{
    showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit User</CardTitle>
                        <CardDescription>
                            Update user information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={editData.firstName}
                                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={editData.lastName}
                                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isAdmin"
                                checked={editData.isAdmin}
                                onChange={(e) => setEditData({ ...editData, isAdmin: e.target.checked })}
                            />
                            <Label htmlFor="isAdmin">Administrator</Label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => {
                                setShowEditModal(false)
                                setSelectedUser(null)
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={() => handleUpdateUser(selectedUser.id, editData)}>
                                Save Changes
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
