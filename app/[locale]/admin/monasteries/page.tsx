'use client'

import { useEffect, useState } from 'react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase, Monastery } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import { Search, Eye, CheckCircle, XCircle, Building, MapPin, Phone, Mail, UserPlus, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { UserProfile } from '@/lib/supabase'
import { PageContainer, PageHeader } from '@/lib/design-system'
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ui/responsive-table'
import { useTranslations } from 'next-intl'

interface MonasteryWithAdmin extends Monastery {
  admin?: {
    full_name: string
    email: string
    phone?: string
  }
}

export default function MonasteryManagement() {
  const t = useTranslations('Admin.monasteries')
  const [monasteries, setMonasteries] = useState<MonasteryWithAdmin[]>([])
  const [filteredMonasteries, setFilteredMonasteries] = useState<MonasteryWithAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedMonastery, setSelectedMonastery] = useState<MonasteryWithAdmin | null>(null)

  // Admin assignment state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [monasteryToAssign, setMonasteryToAssign] = useState<MonasteryWithAdmin | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  useEffect(() => {
    fetchMonasteries()
  }, [])

  useEffect(() => {
    filterMonasteries()
  }, [monasteries, searchTerm, filterStatus])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (userSearchTerm) {
        searchUsers(userSearchTerm)
      } else {
        setSearchedUsers([])
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [userSearchTerm])

  const fetchMonasteries = async () => {
    try {
      const { data, error } = await supabase
        .from('monasteries')
        .select(`
          *,
          admin:user_profiles!monasteries_admin_id_fkey(
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMonasteries(data || [])
    } catch (error) {
      console.error('Error fetching monasteries:', error)
      toast.error(t('fetchError'))
    } finally {
      setLoading(false)
    }
  }

  const filterMonasteries = () => {
    let filtered = monasteries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(monastery =>
        monastery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        monastery.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(monastery => monastery.status === filterStatus)
    }

    setFilteredMonasteries(filtered)
  }

  const updateMonasteryStatus = async (monasteryId: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('monasteries')
        .update({ status: newStatus })
        .eq('id', monasteryId)

      if (error) throw error

      setMonasteries(monasteries.map(monastery =>
        monastery.id === monasteryId ? { ...monastery, status: newStatus } : monastery
      ))

      toast.success(t('statusUpdated', { status: newStatus }))
    } catch (error) {
      console.error('Error updating monastery:', error)
      toast.error(t('updateError'))
    }
  }

  // Search users by name or phone
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchedUsers([])
      return
    }

    setSearchingUsers(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error
      setSearchedUsers(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error(t('fetchError'))
    } finally {
      setSearchingUsers(false)
    }
  }

  // Assign admin to monastery
  const assignAdmin = async (userId: string) => {
    if (!monasteryToAssign) return

    try {
      const { error } = await supabase
        .from('monasteries')
        .update({ admin_id: userId })
        .eq('id', monasteryToAssign.id)

      if (error) throw error

      // Update local state
      await fetchMonasteries()
      setAssignDialogOpen(false)
      setUserSearchTerm('')
      setSearchedUsers([])
      toast.success(t('assignSuccess'))
    } catch (error) {
      console.error('Error assigning admin:', error)
      toast.error(t('assignError'))
    }
  }

  // Remove admin from monastery
  const unassignAdmin = async (monasteryId: string) => {
    if (!confirm(t('unassignConfirm'))) return

    try {
      const { error } = await supabase
        .from('monasteries')
        .update({ admin_id: null })
        .eq('id', monasteryId)

      if (error) throw error

      await fetchMonasteries()
      toast.success(t('unassignSuccess'))
    } catch (error) {
      console.error('Error removing admin:', error)
      toast.error(t('unassignError'))
    }
  }

  // Define table columns
  const columns: ResponsiveTableColumn[] = [
    {
      key: 'name',
      label: t('name'),
      priority: 'high',
      className: 'font-medium max-w-[150px] break-words',
    },
    {
      key: 'address',
      label: t('location'),
      priority: 'medium',
      className: 'max-w-[200px]',
      render: (value) => (
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span className="break-words">{value}</span>
        </div>
      ),
    },
    {
      key: 'admin',
      label: t('admin'),
      priority: 'medium',
      className: 'max-w-[180px]',
      render: (admin) => {
        if (admin) {
          return (
            <div className="space-y-0.5">
              <p className="font-medium break-words">{admin.full_name}</p>
              <p className="text-sm text-muted-foreground break-all">{admin.email}</p>
            </div>
          )
        }
        return <span className="text-muted-foreground italic">{t('noAdminAssigned')}</span>
      },
    },
    {
      key: 'status',
      label: t('status'),
      priority: 'high',
      render: (status) => (
        <StatusBadge
          type="monastery"
          status={(status || 'pending') as 'approved' | 'pending' | 'rejected'}
        />
      ),
    },
    {
      key: 'created_at',
      label: t('registered'),
      priority: 'medium',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: t('actions'),
      priority: 'high',
      className: 'text-right min-w-fit',
      render: (_value, monastery: MonasteryWithAdmin) => (
        <div className="flex justify-end space-x-2 flex-nowrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedMonastery(monastery)}>
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedMonastery?.name}</DialogTitle>
                <DialogDescription>
                  {t('monasteryDetails')}
                </DialogDescription>
              </DialogHeader>
              {selectedMonastery && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">{t('basicInformation')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedMonastery.name}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedMonastery.address}</span>
                        </div>
                        {selectedMonastery.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedMonastery.phone}</span>
                          </div>
                        )}
                        {selectedMonastery.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedMonastery.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{t('adminContact')}</h4>
                      {selectedMonastery.admin ? (
                        <div className="space-y-2">
                          <p><strong>Name:</strong> {selectedMonastery.admin.full_name}</p>
                          <p><strong>Email:</strong> {selectedMonastery.admin.email}</p>
                          {selectedMonastery.admin.phone && (
                            <p><strong>Phone:</strong> {selectedMonastery.admin.phone}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('noAdminAssigned')}</p>
                      )}
                    </div>
                  </div>

                  {selectedMonastery.description && (
                    <div>
                      <h4 className="font-semibold mb-2">{t('description')}</h4>
                      <p className="text-sm">{selectedMonastery.description}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">{t('additionalDetails')}</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      <p><strong>{t('capacity')}:</strong> {selectedMonastery.capacity} {t('people')}</p>
                      <p className="flex items-center gap-2"><strong>{t('status')}:</strong>
                        <StatusBadge
                          type="monastery"
                          status={(selectedMonastery.status || 'pending') as 'approved' | 'pending' | 'rejected'}
                        />
                      </p>
                    </div>
                    {selectedMonastery.dietary_requirements && selectedMonastery.dietary_requirements.length > 0 && (
                      <div className="mt-2">
                        <p><strong>{t('dietaryRequirements')}:</strong></p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedMonastery.dietary_requirements.map((req, index) => (
                            <Badge key={index} variant="outline">{req}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => updateMonasteryStatus(selectedMonastery.id, 'rejected')}
                      disabled={selectedMonastery.status === 'rejected'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('reject')}
                    </Button>
                    <Button
                      onClick={() => updateMonasteryStatus(selectedMonastery.id, 'approved')}
                      disabled={selectedMonastery.status === 'approved'}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('approve')}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Assign/Unassign Admin Button */}
          {monastery.admin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unassignAdmin(monastery.id)}
              title={t('unassignAdmin')}
              className="gap-2"
            >
              <UserMinus className="h-4 w-4" />
              <span className="hidden md:inline">{t('unassignAdmin')}</span>
            </Button>
          ) : (
            <Dialog open={assignDialogOpen && monasteryToAssign?.id === monastery.id} onOpenChange={(open) => {
              setAssignDialogOpen(open)
              if (!open) {
                setMonasteryToAssign(null)
                setUserSearchTerm('')
                setSearchedUsers([])
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMonasteryToAssign(monastery)
                    setAssignDialogOpen(true)
                  }}
                  title={t('assignAdmin')}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden md:inline">{t('assignAdmin')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('assignAdminTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('assignAdminDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder={t('searchUsers')}
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="mb-3"
                    />
                  </div>

                  {searchingUsers && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('searchingUsers')}
                    </div>
                  )}

                  {!searchingUsers && searchedUsers.length === 0 && userSearchTerm.length >= 2 && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('noUsersFound')}
                    </div>
                  )}

                  {!searchingUsers && searchedUsers.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => assignAdmin(user.id)}
                        >
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.phone && (
                              <p className="text-sm text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                          <Button size="sm" variant="ghost">
                            {t('selectUser')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {monastery.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateMonasteryStatus(monastery.id, 'approved')}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateMonasteryStatus(monastery.id, 'rejected')}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

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
        icon={Building}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">{t('totalMonasteries')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold">{monasteries.length}</div>
          </CardContent>
        </div>
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">{t('approved')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold text-compassion-700">
              {monasteries.filter(m => m.status === 'approved').length}
            </div>
          </CardContent>
        </div>
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">{t('pendingReview')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold text-primary-700">
              {monasteries.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </div>
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">{t('rejected')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold text-accent-700">
              {monasteries.filter(m => m.status === 'rejected').length}
            </div>
          </CardContent>
        </div>
      </div>

      {/* Monasteries Table */}
      <div className="dana-card">
        <CardHeader className="pb-3">
          <CardTitle>{t('monasteriesTable')}</CardTitle>
          <CardDescription>{t('reviewApprove')}</CardDescription>
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

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="pending">{t('pending')}</SelectItem>
                <SelectItem value="approved">{t('approved')}</SelectItem>
                <SelectItem value="rejected">{t('rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ResponsiveTable
            columns={columns}
            data={filteredMonasteries}
            keyField="id"
            emptyMessage={t('noMonasteriesFound')}
          />
        </CardContent>
      </div>
    </PageContainer>
  )
}
