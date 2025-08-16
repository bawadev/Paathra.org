'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, DonationBooking, Monastery } from '@/lib/supabase'
import { format, parseISO, isToday, isFuture } from 'date-fns'
import { hasRole } from '@/types/auth'
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  Building,
  Utensils,
  Phone,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  todayBookings: number
  upcomingBookings: number
  totalGuestBookings: number
  pendingGuestBookings: number
}

export default function MonasteryDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [monastery, setMonastery] = useState<Monastery | null>(null)
  const [recentBookings, setRecentBookings] = useState<DonationBooking[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    totalGuestBookings: 0,
    pendingGuestBookings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && hasRole(profile, 'monastery_admin')) {
      fetchMonasteryData()
    }
  }, [user, profile])

  const fetchMonasteryData = async () => {
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
      
      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('donation_bookings')
        .select(`
          *,
          donation_slot:donation_slots!slot_id(*),
          donor:user_profiles!user_id(full_name, email, phone)
        `)
        .eq('donation_slot.monastery_id', monasteryData.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch guest bookings
      const { data: guestBookingsData } = await supabase
        .from('guest_bookings')
        .select(`
          *,
          donation_slot:donation_slots!donation_slot_id(*),
          guest_profile:guest_profiles!guest_profile_id(*)
        `)
        .eq('donation_slot.monastery_id', monasteryData.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentBookings(bookingsData || [])

      // Calculate stats
      if (bookingsData || guestBookingsData) {
        const totalBookings = bookingsData?.length || 0
        const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0
        const todayBookings = bookingsData?.filter(b => 
          b.booking_date && isToday(parseISO(b.booking_date))
        ).length || 0
        const upcomingBookings = bookingsData?.filter(b => 
          b.booking_date && isFuture(parseISO(b.booking_date)) && b.status !== 'cancelled'
        ).length || 0

        const totalGuestBookings = guestBookingsData?.length || 0
        const pendingGuestBookings = guestBookingsData?.filter(b => b.status === 'pending').length || 0

        setStats({
          totalBookings,
          pendingBookings,
          todayBookings,
          upcomingBookings,
          totalGuestBookings,
          pendingGuestBookings
        })
      }
    }
    
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('donation_bookings')
      .update({ 
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null
      })
      .eq('id', bookingId)

    if (!error) {
      fetchMonasteryData() // Refresh data
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

  if (!hasRole(profile, 'monastery_admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-gray-600">
                This dashboard is only available to monastery administrators.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {monastery ? `${monastery.name} - Dashboard` : 'Monastery Dashboard'}
          </h1>
          <p className="text-gray-600">
            Manage your monastery's donation bookings and settings.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading dashboard...</div>
        ) : !monastery ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Monastery Found</h3>
              <p className="text-gray-600 mb-6">
                You don't seem to be associated with a monastery yet.
              </p>
              <Button asChild>
                <Link href="/manage/monastery">Set Up Monastery</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">Need approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayBookings}</div>
                  <p className="text-xs text-muted-foreground">Donations today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
                  <p className="text-xs text-muted-foreground">Future bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Guest Bookings</CardTitle>
                  <Phone className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalGuestBookings}</div>
                  <p className="text-xs text-muted-foreground">Phone bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Guests</CardTitle>
                  <UserPlus className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingGuestBookings}</div>
                  <p className="text-xs text-muted-foreground">Need approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your monastery and donation slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/manage/bookings" className="flex flex-col items-center space-y-2">
                      <Users className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Manage Bookings</div>
                        <div className="text-sm text-gray-500">View and approve donations</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/manage/slots" className="flex flex-col items-center space-y-2">
                      <Calendar className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Donation Slots</div>
                        <div className="text-sm text-gray-500">Create and manage time slots</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/manage/monastery" className="flex flex-col items-center space-y-2">
                      <Building className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Monastery Info</div>
                        <div className="text-sm text-gray-500">Update details and settings</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/manage/guest-bookings" className="flex flex-col items-center space-y-2">
                      <Phone className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Guest Bookings</div>
                        <div className="text-sm text-gray-500">Phone-based reservations</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Donation Bookings</CardTitle>
                <CardDescription>
                  Latest booking requests for your monastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{booking.food_type}</h4>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-4">
                                <span><strong>Food:</strong> {booking.food_type}</span>
                                <span><strong>Quantity:</strong> {booking.quantity}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(parseISO(booking.booking_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {booking.special_instructions && (
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                  <strong>Notes:</strong> {booking.special_instructions}
                                </div>
                              )}
                            </div>
                          </div>

                          {booking.status === 'pending' && (
                            <div className="flex space-x-2">
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
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {recentBookings.length > 5 && (
                      <div className="text-center pt-4">
                        <Button asChild variant="outline">
                          <Link href="/manage/bookings">View All Bookings</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
