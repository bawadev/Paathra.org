'use client'

import { useEffect, useState } from 'react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Search, Eye, CheckCircle, XCircle, Building, MapPin, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer, PageHeader } from '@/lib/design-system'
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ui/responsive-table'

interface MonasteryWithAdmin extends Monastery {
  admin?: {
    full_name: string
    email: string
    phone?: string
  }
}

export default function MonasteryManagement() {
  const [monasteries, setMonasteries] = useState<MonasteryWithAdmin[]>([])
  const [filteredMonasteries, setFilteredMonasteries] = useState<MonasteryWithAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedMonastery, setSelectedMonastery] = useState<MonasteryWithAdmin | null>(null)

  useEffect(() => {
    fetchMonasteries()
  }, [])

  useEffect(() => {
    filterMonasteries()
  }, [monasteries, searchTerm, filterStatus])

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
      toast.error("Failed to fetch monasteries")
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

      toast.success(`Monastery ${newStatus} successfully`)
    } catch (error) {
      console.error('Error updating monastery:', error)
      toast.error("Failed to update monastery status")
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Define table columns
  const columns: ResponsiveTableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      priority: 'high',
      className: 'font-medium',
    },
    {
      key: 'address',
      label: 'Location',
      priority: 'low',
      render: (value) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: 'admin',
      label: 'Admin',
      priority: 'medium',
      render: (admin) => {
        if (admin) {
          return (
            <div>
              <p className="font-medium">{admin.full_name}</p>
              <p className="text-sm text-muted-foreground">{admin.email}</p>
            </div>
          )
        }
        return 'No admin assigned'
      },
    },
    {
      key: 'status',
      label: 'Status',
      priority: 'high',
      render: (status) => (
        <Badge variant={getStatusBadgeVariant(status || 'pending')}>
          {status || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Registered',
      priority: 'medium',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      priority: 'high',
      className: 'text-right',
      render: (_value, monastery: MonasteryWithAdmin) => (
        <div className="flex justify-end space-x-2">
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
                  Monastery Details and Review
                </DialogDescription>
              </DialogHeader>
              {selectedMonastery && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Basic Information</h4>
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
                      <h4 className="font-semibold mb-2">Admin Contact</h4>
                      {selectedMonastery.admin ? (
                        <div className="space-y-2">
                          <p><strong>Name:</strong> {selectedMonastery.admin.full_name}</p>
                          <p><strong>Email:</strong> {selectedMonastery.admin.email}</p>
                          {selectedMonastery.admin.phone && (
                            <p><strong>Phone:</strong> {selectedMonastery.admin.phone}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No admin assigned</p>
                      )}
                    </div>
                  </div>

                  {selectedMonastery.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm">{selectedMonastery.description}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Additional Details</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      <p><strong>Capacity:</strong> {selectedMonastery.capacity} people</p>
                      <p><strong>Status:</strong>
                        <Badge className="ml-2" variant={getStatusBadgeVariant(selectedMonastery.status || 'pending')}>
                          {selectedMonastery.status || 'pending'}
                        </Badge>
                      </p>
                    </div>
                    {selectedMonastery.dietary_requirements && selectedMonastery.dietary_requirements.length > 0 && (
                      <div className="mt-2">
                        <p><strong>Dietary Requirements:</strong></p>
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
                      Reject
                    </Button>
                    <Button
                      onClick={() => updateMonasteryStatus(selectedMonastery.id, 'approved')}
                      disabled={selectedMonastery.status === 'approved'}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

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
        title="Monastery Management"
        description="Review and manage monastery registrations"
        icon={Building}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">Total Monasteries</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold">{monasteries.length}</div>
          </CardContent>
        </div>
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold text-green-600">
              {monasteries.filter(m => m.status === 'approved').length}
            </div>
          </CardContent>
        </div>
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold text-yellow-600">
              {monasteries.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </div>
        <div className="dana-card !p-4">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold text-red-600">
              {monasteries.filter(m => m.status === 'rejected').length}
            </div>
          </CardContent>
        </div>
      </div>

      {/* Monasteries Table */}
      <div className="dana-card">
        <CardHeader className="pb-3">
          <CardTitle>Monasteries</CardTitle>
          <CardDescription>Review and approve monastery registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search monasteries by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ResponsiveTable
            columns={columns}
            data={filteredMonasteries}
            keyField="id"
            emptyMessage="No monasteries found."
          />
        </CardContent>
      </div>
    </PageContainer>
  )
}
