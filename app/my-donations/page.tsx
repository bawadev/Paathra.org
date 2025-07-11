'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, DonationBooking } from '@/lib/supabase'
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

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('donation_bookings')
      .update({ status })
      .eq('id', bookingId)

    if (!error) {
      fetchMyBookings() // Refresh the list
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
          <p className="text-gray-600">
            Track your donation bookings and their status.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your donations...</div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No donations yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any donation bookings yet. Start by booking your first donation!
              </p>
              <Button asChild>
                <a href="/donate">Make Your First Donation</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.donation_slot?.monastery?.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(parseISO(booking.donation_slot?.date || ''), 'MMMM d, yyyy')}
                        </span>
                        <Clock className="w-4 h-4 ml-4" />
                        <span>
                          {format(
                            parseISO(`2000-01-01T${booking.donation_slot?.time_slot}`),
                            'h:mm a'
                          )}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Utensils className="w-4 h-4 mr-2" />
                        <span><strong>Food:</strong> {booking.food_type}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span><strong>Servings:</strong> {booking.estimated_servings}</span>
                      </div>
                      {booking.contact_phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span><strong>Contact:</strong> {booking.contact_phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                        <span>{booking.donation_slot?.monastery?.address}</span>
                      </div>
                    </div>
                  </div>

                  {booking.special_notes && (
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <strong className="text-sm">Special Notes:</strong>
                      <p className="text-sm text-gray-600 mt-1">{booking.special_notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
