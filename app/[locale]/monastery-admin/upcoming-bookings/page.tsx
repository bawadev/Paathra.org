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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('UpcomingBookings')
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

      const slotIds = slots?.map((slot: { id: string }) => slot.id) || []

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
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 sm:border-3 border-[#D4A574]/30 border-t-[#D4A574]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <Alert variant="destructive" className="shadow-elegant">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!monasteryConfig) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <Alert className="shadow-elegant border-[#D4A574]/20">
          <AlertCircle className="h-4 w-4 text-[#D4A574]" />
          <AlertDescription className="text-sm sm:text-base">
            {t('noMonasteryAccess')}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const needsActionBookings = filterBookingsByStatus('needs_action')
  const confirmedBookings = filterBookingsByStatus('confirmed')

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            {monasteryConfig.name} - {t('subtitle')}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ConfirmationSettings
            monasteryConfig={monasteryConfig}
            onConfigUpdated={(updatedConfig) => {
              setMonasteryConfig(updatedConfig)
              fetchBookings(updatedConfig.id, updatedConfig.confirmation_days_config.reminder_days)
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100/50 shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-red-600/80">{t('needsAction')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">{needsActionBookings.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-md">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50 shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600/80">{t('confirmed')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{confirmedBookings.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#D4A574]/10 to-[#EA8B6F]/10 border border-[#D4A574]/20 shadow-elegant hover:shadow-elegant-lg transition-all duration-300">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#D4A574]">{t('totalUpcoming')}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent">{bookings.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-xl shadow-md">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upcoming')}
          className={activeTab === 'upcoming'
            ? 'bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white shadow-elegant text-sm sm:text-base'
            : 'border-[#D4A574]/30 hover:bg-[#D4A574]/10 hover:border-[#D4A574]/60 text-sm sm:text-base'
          }
        >
          {t('allUpcoming')} ({bookings.length})
        </Button>
        <Button
          variant={activeTab === 'needs_action' ? 'default' : 'outline'}
          onClick={() => setActiveTab('needs_action')}
          className={activeTab === 'needs_action'
            ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-elegant text-sm sm:text-base'
            : 'border-red-300 hover:bg-red-50 hover:border-red-400 text-sm sm:text-base'
          }
        >
          {t('needsAction')} ({needsActionBookings.length})
        </Button>
        <Button
          variant={activeTab === 'confirmed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('confirmed')}
          className={activeTab === 'confirmed'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-elegant text-sm sm:text-base'
            : 'border-green-300 hover:bg-green-50 hover:border-green-400 text-sm sm:text-base'
          }
        >
          {t('confirmed')} ({confirmedBookings.length})
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
  const t = useTranslations('UpcomingBookings')

  if (bookings.length === 0) {
    return (
      <Card className="shadow-elegant border-[#D4A574]/20">
        <CardContent className="py-8 sm:py-12 text-center px-4">
          <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-[#D4A574]/60 mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">{t('noBookings')}</p>
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
          <Card key={booking.id} className={`shadow-elegant hover:shadow-elegant-lg transition-all duration-300 ${
            priority === 'urgent' ? 'border-red-500/50 bg-gradient-to-br from-red-50 to-orange-50' :
            priority === 'important' ? 'border-orange-500/50 bg-gradient-to-br from-orange-50 to-yellow-50' :
            'border-[#D4A574]/20'
          }`}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                <div className="flex-1">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4A574]" />
                      <span className="text-sm sm:text-base">{format(new Date(booking.donation_date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <Badge variant={
                      priority === 'urgent' ? 'destructive' :
                      priority === 'important' ? 'secondary' :
                      'outline'
                    } className="self-start sm:self-auto text-xs">
                      {daysUntil === 0 ? t('today') :
                       daysUntil === 1 ? t('tomorrow') :
                       t('daysAway', { count: daysUntil })}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    {booking.donation_slots.time_slot}
                  </p>
                </div>
                <Badge variant={
                  confirmationStatus === 'confirmed' ? 'default' :
                  confirmationStatus === 'needs_approval' ? 'destructive' :
                  'secondary'
                } className={`self-start sm:self-auto text-xs sm:text-sm ${
                  confirmationStatus === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  confirmationStatus === 'needs_approval' ? 'bg-gradient-to-r from-red-500 to-orange-600' :
                  'bg-gradient-to-r from-orange-400 to-yellow-500'
                }`}>
                  {confirmationStatus === 'confirmed' ? t('statusConfirmed') :
                   confirmationStatus === 'needs_approval' ? t('statusNeedsApproval') :
                   confirmationStatus === 'needs_1_day_confirmation' ? t('statusNeeds1Day') :
                   confirmationStatus === 'needs_5_day_confirmation' ? t('statusNeeds5Day') :
                   t('statusUnknown')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              {/* Donor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100/50">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base text-blue-900 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('donorInfo')}
                  </h4>
                  <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
                    <p className="text-gray-700"><strong>{t('name')}:</strong> {booking.donor.full_name}</p>
                    <p className="flex items-center gap-1.5 text-gray-600">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{booking.donor.email}</span>
                    </p>
                    {(booking.donor.phone || booking.contact_phone) && (
                      <p className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        {booking.donor.phone || booking.contact_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#D4A574]/10 to-[#EA8B6F]/10 p-3 sm:p-4 rounded-xl border border-[#D4A574]/20">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#D4A574]" />
                    {t('donationDetails')}
                  </h4>
                  <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
                    <p className="text-gray-700"><strong>{t('foodType')}:</strong> {booking.food_type}</p>
                    <p className="flex items-center gap-1.5 text-gray-600">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {t('servingsFor', { servings: booking.estimated_servings, monks: booking.monks_to_feed })}
                    </p>
                    <p className="text-gray-700"><strong>{t('status')}:</strong> {booking.status}</p>
                  </div>
                </div>
              </div>

              {booking.special_notes && (
                <div className="bg-amber-50 border border-amber-200/50 p-3 sm:p-4 rounded-xl">
                  <h4 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base text-amber-900">{t('specialNotes')}</h4>
                  <p className="text-xs sm:text-sm text-amber-800">{booking.special_notes}</p>
                </div>
              )}

              {/* Confirmation History */}
              <div>
                <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{t('confirmationStatus')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                    booking.monastery_approved_at
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    <p className="font-semibold text-xs sm:text-sm">{t('monasteryApproval')}</p>
                    <p className="mt-0.5">{booking.monastery_approved_at ?
                      format(new Date(booking.monastery_approved_at), 'MMM d, h:mm a') :
                      t('pending')}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                    booking.confirmed_5_days_at
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    <p className="font-semibold text-xs sm:text-sm">{t('fiveDayConfirmation')}</p>
                    <p className="mt-0.5">{booking.confirmed_5_days_at ?
                      format(new Date(booking.confirmed_5_days_at), 'MMM d, h:mm a') :
                      t('pending')}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                    booking.confirmed_1_day_at
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    <p className="font-semibold text-xs sm:text-sm">{t('oneDayConfirmation')}</p>
                    <p className="mt-0.5">{booking.confirmed_1_day_at ?
                      format(new Date(booking.confirmed_1_day_at), 'MMM d, h:mm a') :
                      t('pending')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                {confirmationStatus === 'needs_approval' && (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsConfirmed(booking.id, 'monastery_approval')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-elegant text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {t('approveBooking')}
                  </Button>
                )}

                {confirmationStatus === 'needs_5_day_confirmation' && (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsConfirmed(booking.id, '5_day')}
                    className="bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white shadow-elegant text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {t('mark5DayConfirmed')}
                  </Button>
                )}

                {confirmationStatus === 'needs_1_day_confirmation' && (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsConfirmed(booking.id, '1_day')}
                    className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-elegant text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {t('mark1DayConfirmed')}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${booking.donor.phone || booking.contact_phone}`)}
                  disabled={!booking.donor.phone && !booking.contact_phone}
                  className="border-[#D4A574]/30 hover:bg-[#D4A574]/10 hover:border-[#D4A574]/60 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {t('callDonor')}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`mailto:${booking.donor.email}`)}
                  className="border-[#D4A574]/30 hover:bg-[#D4A574]/10 hover:border-[#D4A574]/60 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {t('emailDonor')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
