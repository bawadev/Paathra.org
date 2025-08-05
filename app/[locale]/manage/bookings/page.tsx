'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { executeBookingTransition } from '@/lib/services/booking-workflow'
import { format, parseISO } from 'date-fns'
// Helper function to check role from database UserProfile
const hasRole = (profile: any, role: string) => {
  return profile?.role === role
}
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Phone,
  Mail,
  Utensils
} from 'lucide-react'

export default function ManageBookingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [monastery, setMonastery] = useState<any | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [receivedStatusDialog, setReceivedStatusDialog] = useState<{
    isOpen: boolean
    bookingId: string
    receivedStatus: 'delivered' | 'not_delivered' | null
  }>({
    isOpen: false,
    bookingId: '',
    receivedStatus: null
  })
  const [monasteryNotes, setMonasteryNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (user && hasRole(profile, 'monastery_admin')) {
      fetchData()
    }
  }, [user, profile])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    
    // Fetch monastery
    const { data: monasteryData } = await supabase
      .from('monasteries')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (monasteryData) {
      setMonastery(monasteryData)
      
      // Fetch all bookings for this monastery
      const { data: bookingsData } = await supabase
        .from('donation_bookings')
        .select(`
          *,
          donation_slots!inner(*),
          user_profiles!inner(full_name, email, phone)
        `)
        .eq('donation_slots.monastery_id', monasteryData.id)
        .order('created_at', { ascending: false })

      setBookings(bookingsData || [])
    }
    
    setLoading(false)
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.food_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId: string, action: 'approve' | 'cancel' | 'markDelivered' | 'markNotDelivered' | 'reopen') => {
    if (!user) return

    const transitionData: any = {
      bookingId,
      transition: action,
      userId: user.id,
      userRole: 'monastery_admin' as const,
    }

    if (action === 'markDelivered' || action === 'markNotDelivered') {
      transitionData.data = { delivery_notes: monasteryNotes }
    }

    const result = await executeBookingTransition(transitionData)

    if (result.success) {
      fetchData() // Refresh data
      if (action === 'markDelivered' || action === 'markNotDelivered') {
        closeReceivedStatusDialog()
      }
    } else {
      console.error('Failed to update booking:', result.error)
      // You might want to show a toast error here
    }
  }

  const openReceivedStatusDialog = (bookingId: string, receivedStatus: 'delivered' | 'not_delivered') => {
    setReceivedStatusDialog({
      isOpen: true,
      bookingId,
      receivedStatus
    })
    setMonasteryNotes('')
  }

  const closeReceivedStatusDialog = () => {
    setReceivedStatusDialog({
      isOpen: false,
      bookingId: '',
      receivedStatus: null
    })
    setMonasteryNotes('')
  }

  const updateReceivedStatus = async () => {
    if (!receivedStatusDialog.receivedStatus || !receivedStatusDialog.bookingId || !user) return

    const action = receivedStatusDialog.receivedStatus === 'delivered' ? 'markDelivered' : 'markNotDelivered'
    
    const transitionData = {
      bookingId: receivedStatusDialog.bookingId,
      transition: action,
      userId: user.id,
      userRole: 'monastery_admin' as const,
      data: { delivery_notes: monasteryNotes }
    }

    const result = await executeBookingTransition(transitionData)

    if (result.success) {
      fetchData() // Refresh data
      closeReceivedStatusDialog()
    } else {
      console.error('Failed to update booking:', result.error)
      // You might want to show a toast error here
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'monastery_approved':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      case 'not_delivered':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'monastery_approved':
        return <CheckCircle className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'not_delivered':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !hasRole(profile, 'monastery_admin')) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Bookings</h1>
          <p className="text-gray-600">
            View and manage donation bookings for {monastery?.name}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by donor name, food type, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="monastery_approved">Monastery Approved</SelectItem>
                      <SelectItem value="confirmed">Donor Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="not_delivered">Not Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bookings List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Donation Bookings ({filteredBookings.length})
                </CardTitle>
                <CardDescription>
                  All donation requests for your monastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                    <p>
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'No donation bookings yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-medium">{booking.user_profiles?.full_name}</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(booking.status)}
                                    <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                                  </div>
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                Booked {format(parseISO(booking.created_at), 'MMM d, yyyy h:mm a')}
                              </div>
                            </div>

                            {/* Donation Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>
                                    <strong>Date:</strong> {format(parseISO(booking.donation_slots?.date || ''), 'MMMM d, yyyy')}
                                  </span>
                                </div>
                                
                                <div className="flex items-center text-sm">
                                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>
                                    <strong>Time:</strong> {format(
                                      parseISO(`2000-01-01T${booking.donation_slots?.time_slot}`),
                                      'h:mm a'
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center text-sm">
                                  <Utensils className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>Food:</strong> {booking.food_type}</span>
                                </div>

                                <div className="flex items-center text-sm">
                                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>Quantity:</strong> {booking.quantity}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>Email:</strong> {booking.user_profiles?.email}</span>
                                </div>

                                {booking.contact_phone && (
                                  <div className="flex items-center text-sm">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    <span><strong>Phone:</strong> {booking.contact_phone}</span>
                                  </div>
                                )}

                              </div>
                            </div>

                            {/* Special Instructions */}
                            {booking.special_instructions && (
                              <div className="bg-blue-50 p-3 rounded-md">
                                <strong className="text-sm text-blue-800">Special Instructions:</strong>
                                <p className="text-sm text-blue-700 mt-1">{booking.special_instructions}</p>
                              </div>
                            )}

                            {/* Special Requirements for the slot */}
                            {booking.donation_slots?.special_requirements && (
                              <div className="bg-yellow-50 p-3 rounded-md">
                                <strong className="text-sm text-yellow-800">Slot Requirements:</strong>
                                <p className="text-sm text-yellow-700 mt-1">{booking.donation_slots.special_requirements}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="ml-6 flex flex-col space-y-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, 'cancel')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </>
                            )}

                            {booking.status === 'monastery_approved' && (
                              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded text-center">
                                Waiting for donor confirmation
                              </div>
                            )}

                            {booking.status === 'confirmed' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => openReceivedStatusDialog(booking.id, 'delivered')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Received
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openReceivedStatusDialog(booking.id, 'not_delivered')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Not Received
                                </Button>
                              </>
                            )}

                            {(booking.status === 'delivered' || booking.status === 'not_delivered') && (
                              <div className="space-y-2">
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status === 'delivered' ? 'Delivered' : 'Not Delivered'}
                                </Badge>
                                {booking.delivery_notes && (
                                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Notes:</strong> {booking.delivery_notes}
                                  </div>
                                )}
                              </div>
                            )}

                            {booking.status === 'cancelled' && booking.created_at > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'reopen')}
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Reopen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Delivery Status Dialog */}
      <Dialog open={receivedStatusDialog.isOpen} onOpenChange={closeReceivedStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mark Donation as {receivedStatusDialog.receivedStatus === 'delivered' ? 'Received' : 'Not Received'}
            </DialogTitle>
            <DialogDescription>
              {receivedStatusDialog.receivedStatus === 'delivered' 
                ? 'Confirm that the donation was successfully received'
                : 'Mark that the donation was not received as expected'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="monastery-notes" className="text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                id="monastery-notes"
                placeholder={
                  receivedStatusDialog.receivedStatus === 'delivered'
                    ? 'Add any notes about the donation received...'
                    : 'Please explain why the donation was not received...'
                }
                value={monasteryNotes}
                onChange={(e) => setMonasteryNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReceivedStatusDialog}>
              Cancel
            </Button>
            <Button
              onClick={updateReceivedStatus}
              className={
                receivedStatusDialog.receivedStatus === 'delivered'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              Confirm {receivedStatusDialog.receivedStatus === 'delivered' ? 'Received' : 'Not Received'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
