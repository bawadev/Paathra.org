'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, DonationBooking } from '@/lib/supabase'
import { executeBookingTransition } from '@/lib/services/booking-workflow'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, MapPin, Phone, Utensils, Users } from 'lucide-react'

export default function MyDonationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<DonationBooking[]>([])
  const [loading, setLoading] = useState(true)

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
        donation_slot:donation_slots(
          *,
          monastery:monasteries(*)
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
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="gradient-text">My Donations</span>
            </h1>
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto">
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
              <div className="flex items-center gap-3 text-[var(--text-light)]">
                <div className="lotus-icon animate-spin"></div>
                <span className="text-lg">Loading your donations...</span>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="card-dana max-w-2xl mx-auto p-12">
                <Calendar className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-[var(--text-dark)] mb-4">
                  No donations yet
                </h3>
                <p className="text-[var(--text-light)] mb-8 text-lg">
                  Your donation journey begins with a single act of kindness. Start by finding monasteries near you.
                </p>
                <Button className="btn-dana-primary large">
                  <Calendar className="w-5 h-5 mr-2" />
                  Make Your First Donation
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">
                  Your Donation History ({bookings.length})
                </h2>
              </div>
              
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card-dana p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-[var(--text-dark)] mb-2">
                              {booking.donation_slot?.monastery?.name || 'Unknown Monastery'}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-[var(--text-light)]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[var(--primary-color)]" />
                                <span>
                                  {booking.donation_slot?.date
                                    ? format(parseISO(booking.donation_slot.date), 'MMMM d, yyyy')
                                    : 'Date not available'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[var(--primary-color)]" />
                                <span>
                                  {booking.donation_slot?.time_slot || 'Time not available'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[var(--primary-color)]" />
                                <span>{booking.donation_slot?.max_donors || 0} donors capacity</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                                <span>{booking.donation_slot?.monastery?.address || 'Location not available'}</span>
                              </div>
                            </div>
                            {booking.special_notes && (
                              <div className="mt-3 p-3 bg-[var(--bg-light)] rounded-lg">
                                <p className="text-sm text-[var(--text-dark)]">
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
                          className="text-sm px-3 py-1"
                        >
                          {getStatusText(booking.status)}
                        </Badge>
                        
                        <div className="flex gap-3">
                          {booking.status === 'monastery_approved' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'confirm')}
                                className="btn-dana-primary text-sm"
                              >
                                Confirm Donation
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancel')}
                                className="text-sm border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
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
                              className="text-sm border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
                            >
                              Cancel Request
                            </Button>
                          )}

                          {(booking.status === 'confirmed' || booking.status === 'delivered' || booking.status === 'not_delivered') && (
                            <div className="text-center">
                              {booking.status === 'confirmed' && (
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  Ready for donation day
                                </div>
                              )}
                              {booking.status === 'delivered' && (
                                <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                  Successfully delivered
                                </div>
                              )}
                              {booking.status === 'not_delivered' && (
                                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                  Not delivered
                                </div>
                              )}
                            </div>
                          )}

                          {booking.donation_slot?.monastery?.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm border-[var(--secondary-color)] text-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-white"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
