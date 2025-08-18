'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CalendarSlotView } from '@/components/calendar-slot-view'
import { supabase } from '@/lib/supabase'
import { executeBookingTransition } from '@/lib/services/booking-workflow'
import { format, parseISO } from 'date-fns'
// Helper function to check role from database UserProfile
const hasRole = (profile: any, role: string) => {
  return profile?.user_types?.includes(role) ?? false
}
import {
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

export default function ManageBookingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
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
          donation_slots!inner(
            id,
            date,
            time_slot,
            monks_capacity,
            monks_fed,
            special_requirements,
            monastery_id
          ),
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

  const handleCreateGuestBooking = (date: Date, availableSlots: any[]) => {
    // Store the selected date and slots in sessionStorage for the guest booking page
    const bookingData = {
      selectedDate: date.toISOString(),
      availableSlots: availableSlots,
      monasteryId: monastery?.id,
      monasteryName: monastery?.name
    }
    
    sessionStorage.setItem('guestBookingPreselection', JSON.stringify(bookingData))
    
    // Extract locale from current pathname and navigate to guest bookings page
    const locale = pathname.split('/')[1] // Get locale from /[locale]/manage/bookings
    router.push(`/${locale}/manage/guest-bookings`)
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

            {/* Calendar View with Slot Management */}
            <CalendarSlotView
              monasteryId={monastery.id}
              bookings={filteredBookings.map(booking => ({
                ...booking,
                donation_slots: {
                  ...booking.donation_slots,
                  capacity: monastery.capacity
                },
                monasteries: { capacity: monastery.capacity }
              }))}
              onBookingAction={(bookingId, action) => updateBookingStatus(bookingId, action as any)}
              onCreateGuestBooking={handleCreateGuestBooking}
            />
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
