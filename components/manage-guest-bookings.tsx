'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Clock, Phone, User, Calendar, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuestBooking {
  id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  food_type: string
  estimated_servings: number
  special_notes?: string
  contact_phone: string
  created_at: string
  donation_slot: {
    date: string
    time_slot: string
    meal_type: string
    monasteries: {
      name: string
    }
  }
  guest_profile: {
    full_name: string
    phone: string
    email?: string
    address?: string
    notes?: string
  }
}

interface ManageGuestBookingsProps {
  monasteryId: string
}

export function ManageGuestBookings({ monasteryId }: ManageGuestBookingsProps) {
  const [guestBookings, setGuestBookings] = useState<GuestBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuestBookings()
  }, [monasteryId])

  const fetchGuestBookings = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('guest_bookings')
      .select(`
        *,
        donation_slot:donation_slots!donation_slot_id(
          date,
          time_slot,
          meal_type,
          monasteries!monastery_id(name)
        ),
        guest_profile:guest_profiles!guest_profile_id(*)
      `)
      .eq('donation_slot.monastery_id', monasteryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching guest bookings:', error)
      toast.error("Failed to load guest bookings")
    } else {
      setGuestBookings(data || [])
    }
    
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('guest_bookings')
      .update({ 
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
        delivered_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', bookingId)

    if (error) {
      toast.error("Failed to update booking status")
    } else {
      toast.success("Booking status updated successfully")
      fetchGuestBookings()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading guest bookings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guest Bookings Management</CardTitle>
          <CardDescription>
            View and manage all phone bookings for your monastery
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guestBookings.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No guest bookings yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Create a guest booking from the "Create Guest Booking" tab
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Guest Info */}
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{booking.guest_profile.full_name}</span>
                        <Phone className="w-3 h-3 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">
                          {formatPhone(booking.guest_profile.phone)}
                        </span>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Booking Details</span>
                          </div>
                          <div className="space-y-1 text-gray-600">
                            <div>
                              <strong>Date:</strong>{' '}
                              {format(new Date(booking.donation_slot.date), 'MMMM d, yyyy')}
                            </div>
                            <div>
                              <strong>Time:</strong> {booking.donation_slot.time_slot}
                            </div>
                            <div>
                              <strong>Meal:</strong> {booking.donation_slot.meal_type}
                            </div>
                            <div>
                              <strong>Food Type:</strong> {booking.food_type}
                            </div>
                            <div>
                              <strong>Servings:</strong> {booking.estimated_servings}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Guest Details</span>
                          </div>
                          <div className="space-y-1 text-gray-600">
                            {booking.guest_profile.email && (
                              <div>
                                <strong>Email:</strong> {booking.guest_profile.email}
                              </div>
                            )}
                            {booking.guest_profile.address && (
                              <div>
                                <strong>Address:</strong> {booking.guest_profile.address}
                              </div>
                            )}
                            <div>
                              <strong>Contact:</strong> {booking.contact_phone}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Notes */}
                      {booking.special_notes && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">Special Notes</span>
                          </div>
                          <p className="text-sm text-gray-600">{booking.special_notes}</p>
                        </div>
                      )}

                      {/* Guest Profile Notes */}
                      {booking.guest_profile.notes && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-sm text-blue-700">Guest Notes</span>
                          </div>
                          <p className="text-sm text-blue-600">{booking.guest_profile.notes}</p>
                        </div>
                      )}

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between pt-3">
                        <Badge className={cn(getStatusColor(booking.status), 'flex items-center space-x-1')}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </Badge>

                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}