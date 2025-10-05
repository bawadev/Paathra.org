'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { Navigation } from '@/components/organisms/Navigation'
import { AuthForm } from '@/components/auth-form'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { executeBookingTransition } from '@/lib/services/booking-workflow'
import { format, parseISO, isFuture, isToday } from 'date-fns'
import { Calendar, Clock, MapPin, Phone, Utensils, Users, Gift, Filter } from 'lucide-react'
import type { BookingStatus } from '@/lib/design-system/tokens/colors'

export default function MyDonationsPage() {
  const t = useTranslations('MyDonations')
  const { user, loading: authLoading } = useAuthStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    if (user) {
      fetchMyBookings()
    }
  }, [user])

  const fetchMyBookings = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('donation_bookings')
      .select(`
        *,
        donation_slots!inner(
          *,
          monasteries!inner(*)
        )
      `)
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: string, action: 'confirm' | 'cancel') => {
    if (!user) return

    const result = await executeBookingTransition({
      bookingId,
      transition: action,
      userId: user.id,
      userRole: 'donor',
    })

    if (result.success) {
      fetchMyBookings() // Refresh the list
    } else {
      console.error('Failed to update booking:', result.error)
      // You might want to show a toast error here
    }
  }

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return bookings.filter(booking => {
      if (!booking.donation_slots?.date) return false
      
      const bookingDate = parseISO(booking.donation_slots.date)
      const isUpcoming = isFuture(bookingDate) || isToday(bookingDate)
      
      if (filter === 'upcoming') {
        return isUpcoming
      } else if (filter === 'past') {
        return !isUpcoming
      }
      
      return true
    })
  }

  const filteredBookings = getFilteredBookings()
  const upcomingCount = bookings.filter(booking => {
    if (!booking.donation_slots?.date) return false
    const bookingDate = parseISO(booking.donation_slots.date)
    return isFuture(bookingDate) || isToday(bookingDate)
  }).length

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574] mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">{t('loadingDonations')}</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 lg:pt-36 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full shadow-lg">
              <Gift className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574] mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">{t('loadingDonations')}</p>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-[#D4A574]/20 to-[#EA8B6F]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-[#D4A574]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {t('noDonationsYet')}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {t('donationJourneyStarts')}
              </p>
              <Button
                className="bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => window.location.href = '/donate'}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t('makeFirstDonation')}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  {t('yourDonationHistory')}
                </h2>
                <div className="text-sm text-gray-600">
                  {bookings.length} {bookings.length !== 1 ? t('donationsTotal') : t('donationTotal')}
                  {upcomingCount > 0 && ` (${upcomingCount} ${t('upcoming').toLowerCase()})`}
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={cn(
                    "min-h-[44px] justify-start sm:justify-center text-sm",
                    filter === 'all'
                      ? 'bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F]'
                      : 'border-[#D4A574]/40 text-[#C69564] hover:bg-[#D4A574]/10'
                  )}
                >
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('allDonations')} ({bookings.length})</span>
                </Button>
                <Button
                  variant={filter === 'upcoming' ? 'default' : 'outline'}
                  onClick={() => setFilter('upcoming')}
                  className={cn(
                    "min-h-[44px] justify-start sm:justify-center text-sm",
                    filter === 'upcoming'
                      ? 'bg-gradient-to-r from-compassion-500 to-compassion-600 hover:from-compassion-600 hover:to-compassion-700'
                      : 'border-compassion-200 text-compassion-700 hover:bg-compassion-50'
                  )}
                >
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('upcoming')} ({upcomingCount})</span>
                </Button>
                <Button
                  variant={filter === 'past' ? 'default' : 'outline'}
                  onClick={() => setFilter('past')}
                  className={cn(
                    "min-h-[44px] justify-start sm:justify-center text-sm",
                    filter === 'past'
                      ? 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('past')} ({bookings.length - upcomingCount})</span>
                </Button>
              </div>
              
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#D4A574]/20 to-[#EA8B6F]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-[#D4A574]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {filter === 'upcoming' ? t('noUpcomingDonations') : filter === 'past' ? t('noPastDonations') : t('noDonationsFilter')}
                  </h3>
                  <p className="text-gray-600 text-base">
                    {filter === 'upcoming'
                      ? t('noUpcomingScheduled')
                      : filter === 'past'
                        ? t('noPastRecorded')
                        : t('noMatchingFilter')}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md rounded-2xl bg-white">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col gap-4">
                        {/* Header with Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full flex items-center justify-center flex-shrink-0">
                              <Utensils className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base md:text-xl text-gray-900 mb-1 break-words">
                                {booking.donation_slots?.monasteries?.name || 'Unknown Monastery'}
                              </h3>
                            </div>
                          </div>
                          <StatusBadge
                            type="booking"
                            status={booking.status as BookingStatus}
                            className="min-h-[32px] flex-shrink-0"
                          />
                        </div>

                        {/* Booking Details */}
                        <div className="grid gap-3 text-sm text-gray-600 pl-0 md:pl-0">
                          <div className="flex items-start gap-2 min-h-[24px]">
                            <Calendar className="w-4 h-4 text-[#D4A574] mt-0.5 flex-shrink-0" />
                            <span className="font-medium break-words">
                              {booking.donation_slots?.date
                                ? format(parseISO(booking.donation_slots.date), 'MMMM d, yyyy')
                                : 'Date not available'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 min-h-[24px]">
                            <Clock className="w-4 h-4 text-[#D4A574] mt-0.5 flex-shrink-0" />
                            <span className="font-medium">
                              {booking.donation_slots?.time_slot || 'Time not available'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 min-h-[24px]">
                            <Users className="w-4 h-4 text-[#D4A574] mt-0.5 flex-shrink-0" />
                            <span>
                              {booking.donation_slots?.max_donors || 0} {t('donorsCapacity')}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 min-h-[24px]">
                            <MapPin className="w-4 h-4 text-[#D4A574] mt-0.5 flex-shrink-0" />
                            <span className="break-words">
                              {booking.donation_slots?.monasteries?.address || 'Location not available'}
                            </span>
                          </div>
                        </div>

                        {/* Special Notes */}
                        {booking.special_notes && (
                          <div className="p-3 bg-[#D4A574]/10 rounded-lg border border-[#D4A574]/20">
                            <p className="text-sm text-gray-800 break-words">
                              <strong>{t('yourNote')}</strong> {booking.special_notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                          {booking.status === 'monastery_approved' && (
                            <>
                              <Button
                                onClick={() => updateBookingStatus(booking.id, 'confirm')}
                                className="flex-1 sm:flex-none min-h-[44px] bg-gradient-to-r from-compassion-500 to-compassion-600 hover:from-compassion-600 hover:to-compassion-700 text-white text-sm font-medium"
                              >
                                {t('confirmButton')}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancel')}
                                className="flex-1 sm:flex-none min-h-[44px] text-sm border-accent-300 text-accent-600 hover:bg-accent-50"
                              >
                                {t('cancelButton')}
                              </Button>
                            </>
                          )}

                          {booking.status === 'pending' && (
                            <Button
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'cancel')}
                              className="w-full sm:w-auto min-h-[44px] text-sm border-accent-300 text-accent-600 hover:bg-accent-50"
                            >
                              {t('cancelRequestButton')}
                            </Button>
                          )}

                          {(booking.status === 'confirmed' || booking.status === 'delivered' || booking.status === 'not_delivered') && (
                            <div className="flex justify-center sm:justify-start w-full">
                              {booking.status === 'confirmed' && (
                                <div className="text-trust-700 bg-trust-50 px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm">
                                  {t('readyForDonationDay')}
                                </div>
                              )}
                              {booking.status === 'delivered' && (
                                <div className="text-compassion-700 bg-compassion-50 px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm">
                                  {t('successfullyDelivered')}
                                </div>
                              )}
                              {booking.status === 'not_delivered' && (
                                <div className="text-accent-700 bg-accent-50 px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm">
                                  {t('notDeliveredStatus')}
                                </div>
                              )}
                            </div>
                          )}

                          {booking.donation_slots?.monasteries?.phone && (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto min-h-[44px] text-sm border-gray-300 text-gray-600 hover:bg-gray-50"
                              onClick={() => window.open(`tel:${booking.donation_slots?.monasteries?.phone}`)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              {t('contactButton')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
