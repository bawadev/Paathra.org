'use client'

import { useEffect, useState } from 'react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase, UserProfile } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import { Search, Edit, Trash2, Filter, Users } from 'lucide-react'
import { toast } from 'sonner'
import { UserType, hasRole, getUserTypeDisplayName } from '@/types/auth'
import { PageContainer, PageHeader, StatCard } from '@/lib/design-system'
import { useTranslations } from 'next-intl'

export default function UserManagement() {
  const t = useTranslations('Admin.users')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

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
      toast.error(t('fetchError'))
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

      toast.success(t('userTypeUpdated'))
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(t('updateError'))
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(users.filter(user => user.id !== userId))
      toast.success(t('userDeleted'))
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(t('deleteError'))
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <PageContainer gradient maxWidth="xl">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={Users}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title={t('totalUsers')}
          value={users.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title={t('donors')}
          value={users.filter(u => hasRole(u, 'donor')).length}
          variant="trust"
        />
        <StatCard
          title={t('monasteryAdmins')}
          value={users.filter(u => hasRole(u, 'monastery_admin')).length}
          variant="secondary"
        />
        <StatCard
          title={t('platformAdmins')}
          value={users.filter(u => hasRole(u, 'super_admin')).length}
          variant="accent"
        />
      </div>

      {/* Filters and Search */}
      <div className="dana-card">
        <CardHeader className="pb-3">
          <CardTitle>{t('usersTable')}</CardTitle>
          <CardDescription>{t('viewManageUsers')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allUsers')}</SelectItem>
                  <SelectItem value="donor">{t('donors')}</SelectItem>
                  <SelectItem value="monastery_admin">{t('monasteryAdmins')}</SelectItem>
                  <SelectItem value="super_admin">{t('platformAdmins')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('phone')}</TableHead>
                  <TableHead>{t('joined')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
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
                    <TableCell>{user.phone || t('notProvided')}</TableCell>
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
                              <DialogTitle>{t('editUserType')}</DialogTitle>
                              <DialogDescription>
                                {t('changeUserType', { name: user.full_name })}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>{t('currentType')}</Label>
                                <p className="text-sm text-muted-foreground">
                                  {getUserTypesString(user)}
                                </p>
                              </div>
                              <div>
                                <Label>{t('newType')}</Label>
                                <Select
                                  defaultValue={getPrimaryUserType(user)}
                                  onValueChange={(value) => updateUserType(user.id, value as UserType)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="donor">{t('donor')}</SelectItem>
                                    <SelectItem value="monastery_admin">{t('monasteryAdmin')}</SelectItem>
                                    <SelectItem value="super_admin">{t('platformAdmin')}</SelectItem>
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
                      {t('noUsersFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
    </PageContainer>
  )
}
