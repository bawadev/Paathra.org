'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { executeBookingTransition } from '@/lib/services/booking-workflow'
import { format, parseISO, isFuture, isToday } from 'date-fns'
import { Calendar, Clock, MapPin, Phone, Utensils, Users, Gift, Filter } from 'lucide-react'

export default function MyDonationsPage() {
  const { user, loading: authLoading } = useAuth()
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'monastery_approved':
        return 'Monastery Approved'
      case 'confirmed':
        return 'Confirmed'
      case 'pending':
        return 'Pending Approval'
      case 'cancelled':
        return 'Cancelled'
      case 'delivered':
        return 'Delivered'
      case 'not_delivered':
        return 'Not Delivered'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
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
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)] flex items-center gap-3">
          <div className="lotus-icon animate-spin"></div>
          Loading your donations...
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
      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              My Donations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your contributions and see the impact of your generosity
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading your donations...</p>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No donations yet
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Your donation journey begins with a single act of kindness. Start by finding monasteries near you.
                </p>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => window.location.href = '/donate'}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Make Your First Donation
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  Your Donation History
                </h2>
                <div className="text-sm text-gray-600">
                  {bookings.length} donation{bookings.length !== 1 ? 's' : ''} total
                  {upcomingCount > 0 && ` (${upcomingCount} upcoming)`}
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={cn(
                    filter === 'all' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                      : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                  )}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All Donations ({bookings.length})
                </Button>
                <Button
                  variant={filter === 'upcoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('upcoming')}
                  className={cn(
                    filter === 'upcoming' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                      : 'border-green-200 text-green-700 hover:bg-green-50'
                  )}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming ({upcomingCount})
                </Button>
                <Button
                  variant={filter === 'past' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('past')}
                  className={cn(
                    filter === 'past' 
                      ? 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600' 
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Past ({bookings.length - upcomingCount})
                </Button>
              </div>
              
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No {filter === 'upcoming' ? 'upcoming' : filter === 'past' ? 'past' : ''} donations found
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'upcoming' 
                      ? 'You have no upcoming donations scheduled.' 
                      : filter === 'past' 
                        ? 'You have no past donations recorded.' 
                        : 'No donations match your current filter.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Booking Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                              <Utensils className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-xl text-gray-900 mb-3">
                                {booking.donation_slots?.monasteries?.name || 'Unknown Monastery'}
                              </h3>
                              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-amber-600" />
                                  <span className="font-medium">
                                    {booking.donation_slots?.date
                                      ? format(parseISO(booking.donation_slots.date), 'MMMM d, yyyy')
                                      : 'Date not available'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                  <span className="font-medium">
                                    {booking.donation_slots?.time_slot || 'Time not available'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-amber-600" />
                                  <span>
                                    {booking.donation_slots?.max_donors || 0} donors capacity
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-amber-600" />
                                  <span className="truncate">
                                    {booking.donation_slots?.monasteries?.address || 'Location not available'}
                                  </span>
                                </div>
                              </div>
                              {booking.special_notes && (
                                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                                  <p className="text-sm text-gray-800">
                                    <strong>Your note:</strong> {booking.special_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col items-end gap-4">
                          <Badge 
                            variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'monastery_approved' ? 'secondary' :
                              booking.status === 'delivered' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              booking.status === 'cancelled' ? 'destructive' : 'outline'
                            }
                            className={cn(
                              "text-sm px-3 py-1.5",
                              booking.status === 'delivered' && "bg-green-100 text-green-800",
                              booking.status === 'confirmed' && "bg-blue-100 text-blue-800",
                              booking.status === 'monastery_approved' && "bg-amber-100 text-amber-800",
                              booking.status === 'pending' && "bg-gray-100 text-gray-800",
                              booking.status === 'cancelled' && "bg-red-100 text-red-800"
                            )}
                          >
                            {getStatusText(booking.status)}
                          </Badge>
                          
                          <div className="flex gap-3">
                            {booking.status === 'monastery_approved' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'confirm')}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, 'cancel')}
                                  className="text-sm border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancel')}
                                className="text-sm border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Cancel Request
                              </Button>
                            )}

                            {(booking.status === 'confirmed' || booking.status === 'delivered' || booking.status === 'not_delivered') && (
                              <div className="text-center text-xs">
                                {booking.status === 'confirmed' && (
                                  <div className="text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium">
                                    Ready for donation day
                                  </div>
                                )}
                                {booking.status === 'delivered' && (
                                  <div className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium"
                                  >
                                    Successfully delivered
                                  </div>
                                )}
                                {booking.status === 'not_delivered' && (
                                  <div className="text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full font-medium"
                                  >
                                    Not delivered
                                  </div>
                                )}
                              </div>
                            )}

                            {booking.donation_slots?.monasteries?.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-sm border-gray-300 text-gray-600 hover:bg-gray-50"
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                Contact
                              </Button>
                            )}
                          </div>
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
