'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase, UserProfile } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import { Search, Edit, Trash2, UserPlus, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { UserType, hasRole, getUserTypeDisplayName } from '@/types/auth'

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Helper function to get the primary user type (highest priority)
  const getPrimaryUserType = (user: UserProfile): UserType => {
    if (hasRole(user, 'super_admin')) return 'super_admin'
    if (hasRole(user, 'monastery_admin')) return 'monastery_admin'
    return 'donor'
  }

  // Helper function to get all user types as a comma-separated string
  const getUserTypesString = (user: UserProfile): string => {
    return user.user_types.map(type => getUserTypeDisplayName(type)).join(', ')
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterType])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by user type
    if (filterType !== 'all') {
      filtered = filtered.filter(user => hasRole(user, filterType as UserType))
    }

    setFilteredUsers(filtered)
  }

  const updateUserType = async (userId: string, newUserType: UserType) => {
    try {
      // For now, we'll replace the user_types array with just the selected type
      // In a more sophisticated system, you might want to add/remove roles individually
      const { error } = await supabase
        .from('user_profiles')
        .update({ user_types: [newUserType] })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, user_types: [newUserType] } : user
      ))

      toast.success("User type updated successfully")
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error("Failed to update user type")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(users.filter(user => user.id !== userId))
      toast.success("User deleted successfully")
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error("Failed to delete user")
    }
  }

  const getUserTypeBadgeVariant = (userType: UserType) => {
    switch (userType) {
      case 'super_admin':
        return 'destructive'
      case 'monastery_admin':
        return 'secondary'
      case 'donor':
        return 'default'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="pt-32 pb-20 px-5">
        <div className="container-dana">
          <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users in the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => hasRole(u, 'donor')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monastery Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => hasRole(u, 'monastery_admin')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => hasRole(u, 'super_admin')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="donor">Donors</SelectItem>
                  <SelectItem value="monastery_admin">Monastery Admins</SelectItem>
                  <SelectItem value="super_admin">Platform Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getUserTypeBadgeVariant(getPrimaryUserType(user))}>
                        {getUserTypeDisplayName(getPrimaryUserType(user))}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.phone || 'Not provided'}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User Type</DialogTitle>
                              <DialogDescription>
                                Change the user type for {user.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Current Type</Label>
                                <p className="text-sm text-muted-foreground">
                                  {getUserTypesString(user)}
                                </p>
                              </div>
                              <div>
                                <Label>New Type</Label>
                                <Select 
                                  defaultValue={getPrimaryUserType(user)}
                                  onValueChange={(value) => updateUserType(user.id, value as UserType)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="donor">Donor</SelectItem>
                                    <SelectItem value="monastery_admin">Monastery Admin</SelectItem>
                                    <SelectItem value="super_admin">Platform Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          disabled={hasRole(user, 'super_admin') && users.filter(u => hasRole(u, 'super_admin')).length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
