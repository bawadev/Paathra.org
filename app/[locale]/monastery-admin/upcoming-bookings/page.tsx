'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Phone, Mail, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConfirmationSettings } from '@/components/monastery/confirmation-settings'

interface DonationBooking {
  id: string
  donation_date: string
  food_type: string
  estimated_servings: number
  monks_to_feed: number
  status: string
  special_notes?: string
  contact_phone?: string
  confirmed_5_days_at?: string
  confirmed_1_day_at?: string
  monastery_approved_at?: string
  donation_slots: {
    time_slot: string
  }
  donor: {
    full_name: string
    email: string
    phone?: string
  }
}

interface MonasteryConfig {
  id: string
  name: string
  confirmation_days_config: {
    reminder_days: number[]
    require_monastery_approval: boolean
  }
}

export default function UpcomingBookingsPage() {
  const { user, profile } = useAuthStore()
  const [bookings, setBookings] = useState<DonationBooking[]>([])
  const [monasteryConfig, setMonasteryConfig] = useState<MonasteryConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('upcoming')

  // Fetch monastery configuration and bookings
  useEffect(() => {
    if (!user || !profile) return

    fetchMonasteryData()
  }, [user, profile])

  const fetchMonasteryData = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, get the monastery that this user administers
      const { data: monastery, error: monasteryError } = await supabase
        .from('monasteries')
        .select('id, name, confirmation_days_config')
        .eq('admin_id', user?.id)
        .single()

      if (monasteryError) {
        throw new Error('Could not find monastery for this user')
      }

      setMonasteryConfig(monastery)

      // Fetch upcoming bookings for this monastery
      await fetchBookings(monastery.id, monastery.confirmation_days_config.reminder_days)
    } catch (err) {
      console.error('Error fetching monastery data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load monastery data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (monasteryId: string, reminderDays: number[]) => {
    try {
      const today = new Date()
      const maxDaysAhead = Math.max(...reminderDays, 7) // At least 7 days
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + maxDaysAhead)

      // First get the donation slots for this monastery
      const { data: slots, error: slotsError } = await supabase
        .from('donation_slots')
        .select('id')
        .eq('monastery_id', monasteryId)

      if (slotsError) throw slotsError

      const slotIds = slots?.map(slot => slot.id) || []

      if (slotIds.length === 0) {
        setBookings([])
        return
      }

      // Then get bookings for those slots
      const { data: bookings, error } = await supabase
        .from('donation_bookings')
        .select(`
          id,
          donation_date,
          food_type,
          estimated_servings,
          monks_to_feed,
          status,
          special_notes,
          contact_phone,
          confirmed_5_days_at,
          confirmed_1_day_at,
          monastery_approved_at,
          donation_slots!donation_bookings_donation_slot_id_fkey (
            time_slot
          ),
          donor:user_profiles!donation_bookings_donor_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .in('donation_slot_id', slotIds)
        .gte('donation_date', today.toISOString().split('T')[0])
        .lte('donation_date', endDate.toISOString().split('T')[0])
        .in('status', ['pending', 'monastery_approved', 'confirmed'])
        .order('donation_date', { ascending: true })

      if (error) {
        throw error
      }

      setBookings((bookings as any) || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    }
  }

  const markAsConfirmed = async (bookingId: string, confirmationType: '5_day' | '1_day' | 'monastery_approval') => {
    try {
      const updates: any = {
        updated_at: new Date().toISOString()
      }

      if (confirmationType === '5_day') {
        updates.confirmed_5_days_at = new Date().toISOString()
      } else if (confirmationType === '1_day') {
        updates.confirmed_1_day_at = new Date().toISOString()
      } else if (confirmationType === 'monastery_approval') {
        updates.monastery_approved_at = new Date().toISOString()
        updates.monastery_approved_by = user?.id
        updates.status = 'monastery_approved'
      }

      const { error } = await supabase
        .from('donation_bookings')
        .update(updates)
        .eq('id', bookingId)

      if (error) throw error

      // Log the confirmation
      await supabase
        .from('booking_confirmations')
        .insert({
          booking_id: bookingId,
          reminder_type: confirmationType,
          sent_by: user?.id,
          method: 'manual',
          notes: `Manually confirmed by monastery representative`
        })

      // Refresh bookings
      if (monasteryConfig) {
        await fetchBookings(monasteryConfig.id, monasteryConfig.confirmation_days_config.reminder_days)
      }
    } catch (err) {
      console.error('Error marking as confirmed:', err)
      setError('Failed to update confirmation status')
    }
  }

  const getBookingPriority = (booking: DonationBooking) => {
    const daysUntilDonation = differenceInDays(new Date(booking.donation_date), new Date())
    const reminderDays = monasteryConfig?.confirmation_days_config.reminder_days || [5, 1]
    
    if (daysUntilDonation <= 1) return 'urgent'
    if (reminderDays.includes(daysUntilDonation)) return 'important'
    return 'normal'
  }

  const getConfirmationStatus = (booking: DonationBooking) => {
    const daysUntilDonation = differenceInDays(new Date(booking.donation_date), new Date())
    const reminderDays = monasteryConfig?.confirmation_days_config.reminder_days || [5, 1]
    
    if (booking.status === 'pending' && monasteryConfig?.confirmation_days_config.require_monastery_approval) {
      return 'needs_approval'
    }
    
    if (daysUntilDonation <= 1 && !booking.confirmed_1_day_at) {
      return 'needs_1_day_confirmation'
    }
    
    if (reminderDays.includes(daysUntilDonation) && daysUntilDonation === 5 && !booking.confirmed_5_days_at) {
      return 'needs_5_day_confirmation'
    }
    
    return 'confirmed'
  }

  const filterBookingsByStatus = (status: string) => {
    return bookings.filter(booking => {
      const confirmationStatus = getConfirmationStatus(booking)
      
      switch (status) {
        case 'needs_action':
          return ['needs_approval', 'needs_1_day_confirmation', 'needs_5_day_confirmation'].includes(confirmationStatus)
        case 'confirmed':
          return confirmationStatus === 'confirmed'
        case 'upcoming':
        default:
          return true
      }
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!monasteryConfig) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't appear to be an administrator of any monastery. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const needsActionBookings = filterBookingsByStatus('needs_action')
  const confirmedBookings = filterBookingsByStatus('confirmed')

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Donation Bookings</h1>
          <p className="text-muted-foreground mt-2">
            {monasteryConfig.name} - Manage confirmations and contact donors
          </p>
        </div>
        <ConfirmationSettings 
          monasteryConfig={monasteryConfig}
          onConfigUpdated={(updatedConfig) => {
            setMonasteryConfig(updatedConfig)
            fetchBookings(updatedConfig.id, updatedConfig.confirmation_days_config.reminder_days)
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Action</p>
                <p className="text-2xl font-bold text-red-600">{needsActionBookings.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Upcoming</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upcoming')}
        >
          All Upcoming ({bookings.length})
        </Button>
        <Button
          variant={activeTab === 'needs_action' ? 'default' : 'outline'}
          onClick={() => setActiveTab('needs_action')}
        >
          Needs Action ({needsActionBookings.length})
        </Button>
        <Button
          variant={activeTab === 'confirmed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('confirmed')}
        >
          Confirmed ({confirmedBookings.length})
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && (
          <BookingsList 
            bookings={filterBookingsByStatus('upcoming')}
            monasteryConfig={monasteryConfig}
            onMarkAsConfirmed={markAsConfirmed}
            getConfirmationStatus={getConfirmationStatus}
            getBookingPriority={getBookingPriority}
          />
        )}
        
        {activeTab === 'needs_action' && (
          <BookingsList 
            bookings={needsActionBookings}
            monasteryConfig={monasteryConfig}
            onMarkAsConfirmed={markAsConfirmed}
            getConfirmationStatus={getConfirmationStatus}
            getBookingPriority={getBookingPriority}
          />
        )}
        
        {activeTab === 'confirmed' && (
          <BookingsList 
            bookings={confirmedBookings}
            monasteryConfig={monasteryConfig}
            onMarkAsConfirmed={markAsConfirmed}
            getConfirmationStatus={getConfirmationStatus}
            getBookingPriority={getBookingPriority}
          />
        )}
      </div>
    </div>
  )
}

interface BookingsListProps {
  bookings: DonationBooking[]
  monasteryConfig: MonasteryConfig
  onMarkAsConfirmed: (bookingId: string, type: '5_day' | '1_day' | 'monastery_approval') => void
  getConfirmationStatus: (booking: DonationBooking) => string
  getBookingPriority: (booking: DonationBooking) => string
}

function BookingsList({ 
  bookings, 
  monasteryConfig: _, // Unused parameter but kept for interface compatibility
  onMarkAsConfirmed, 
  getConfirmationStatus, 
  getBookingPriority 
}: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No bookings found for this period.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const daysUntil = differenceInDays(new Date(booking.donation_date), new Date())
        const confirmationStatus = getConfirmationStatus(booking)
        const priority = getBookingPriority(booking)

        return (
          <Card key={booking.id} className={`${
            priority === 'urgent' ? 'border-red-500 bg-red-50' :
            priority === 'important' ? 'border-orange-500 bg-orange-50' :
            'border-gray-200'
          }`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {format(new Date(booking.donation_date), 'EEEE, MMMM d, yyyy')}
                    <Badge variant={
                      priority === 'urgent' ? 'destructive' :
                      priority === 'important' ? 'secondary' :
                      'outline'
                    }>
                      {daysUntil === 0 ? 'Today' : 
                       daysUntil === 1 ? 'Tomorrow' : 
                       `${daysUntil} days`}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.donation_slots.time_slot}
                  </p>
                </div>
                <Badge variant={
                  confirmationStatus === 'confirmed' ? 'default' :
                  confirmationStatus === 'needs_approval' ? 'destructive' :
                  'secondary'
                }>
                  {confirmationStatus === 'confirmed' ? 'Confirmed' :
                   confirmationStatus === 'needs_approval' ? 'Needs Approval' :
                   confirmationStatus === 'needs_1_day_confirmation' ? 'Needs 1-Day Confirmation' :
                   confirmationStatus === 'needs_5_day_confirmation' ? 'Needs 5-Day Confirmation' :
                   'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Donor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Donor Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {booking.donor.full_name}</p>
                    <p className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {booking.donor.email}
                    </p>
                    {(booking.donor.phone || booking.contact_phone) && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {booking.donor.phone || booking.contact_phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Donation Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Food Type:</strong> {booking.food_type}</p>
                    <p className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {booking.estimated_servings} servings for {booking.monks_to_feed} monks
                    </p>
                    <p><strong>Status:</strong> {booking.status}</p>
                  </div>
                </div>
              </div>

              {booking.special_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Special Notes</h4>
                  <p className="text-sm bg-gray-50 p-2 rounded">{booking.special_notes}</p>
                </div>
              )}

              {/* Confirmation History */}
              <div>
                <h4 className="font-semibold mb-2">Confirmation Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className={`p-2 rounded ${booking.monastery_approved_at ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    <p className="font-semibold">Monastery Approval</p>
                    <p>{booking.monastery_approved_at ? 
                      format(new Date(booking.monastery_approved_at), 'MMM d, h:mm a') : 
                      'Pending'}</p>
                  </div>
                  <div className={`p-2 rounded ${booking.confirmed_5_days_at ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    <p className="font-semibold">5-Day Confirmation</p>
                    <p>{booking.confirmed_5_days_at ? 
                      format(new Date(booking.confirmed_5_days_at), 'MMM d, h:mm a') : 
                      'Pending'}</p>
                  </div>
                  <div className={`p-2 rounded ${booking.confirmed_1_day_at ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    <p className="font-semibold">1-Day Confirmation</p>
                    <p>{booking.confirmed_1_day_at ? 
                      format(new Date(booking.confirmed_1_day_at), 'MMM d, h:mm a') : 
                      'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {confirmationStatus === 'needs_approval' && (
                  <Button 
                    size="sm" 
                    onClick={() => onMarkAsConfirmed(booking.id, 'monastery_approval')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve Booking
                  </Button>
                )}
                
                {confirmationStatus === 'needs_5_day_confirmation' && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onMarkAsConfirmed(booking.id, '5_day')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Mark 5-Day Confirmed
                  </Button>
                )}
                
                {confirmationStatus === 'needs_1_day_confirmation' && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onMarkAsConfirmed(booking.id, '1_day')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Mark 1-Day Confirmed
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`tel:${booking.donor.phone || booking.contact_phone}`)}
                  disabled={!booking.donor.phone && !booking.contact_phone}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call Donor
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${booking.donor.email}`)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email Donor
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
