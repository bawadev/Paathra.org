'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { AuthForm } from '@/components/auth-form'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { user, profile, loading: authLoading } = useAuthStore()
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
        const pendingBookings = bookingsData?.filter((b: any) => b.status === 'pending').length || 0
        const todayBookings = bookingsData?.filter((b: any) => 
          b.booking_date && isToday(parseISO(b.booking_date))
        ).length || 0
        const upcomingBookings = bookingsData?.filter((b: any) => 
          b.booking_date && isFuture(parseISO(b.booking_date)) && b.status !== 'cancelled'
        ).length || 0

        const totalGuestBookings = guestBookingsData?.length || 0
        const pendingGuestBookings = guestBookingsData?.filter((b: any) => b.status === 'pending').length || 0

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
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)] flex items-center gap-3">
          <div className="lotus-icon animate-spin"></div>
          Loading monastery dashboard...
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (!hasRole(profile, 'monastery_admin')) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="pt-32 pb-20">
            <div className="dana-card max-w-2xl mx-auto p-12 text-center">
              <AlertCircle className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-[var(--text-dark)] mb-4">Access Restricted</h3>
              <p className="text-[var(--text-light)] text-lg">
                This dashboard is only available to monastery administrators.
              </p>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-32 pb-12">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="gradient-text">
                {monastery ? `${monastery.name} - Dashboard` : 'Monastery Dashboard'}
              </span>
            </h1>
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto">
              Manage your monastery's donation bookings and settings
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex items-center gap-3 text-[var(--text-light)]">
              <div className="lotus-icon animate-spin"></div>
              <span className="text-lg">Loading dashboard data...</span>
            </div>
          </div>
        ) : !monastery ? (
          <div className="text-center py-20">
            <div className="dana-card max-w-2xl mx-auto p-12">
              <Building className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-[var(--text-dark)] mb-4">No Monastery Found</h3>
              <p className="text-[var(--text-light)] mb-8 text-lg">
                You don't seem to be associated with a monastery yet.
              </p>
              <Button asChild className="dana-button dana-button-primary">
                <Link href="/manage/monastery">Set Up Monastery</Link>
              </Button>
            </div>
          </div>
        ) : (
          <section className="pb-20">
            <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="dana-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-[var(--text-light)]">Total Bookings</h3>
                  <TrendingUp className="h-4 w-4 text-[var(--primary-color)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-dark)]">{stats.totalBookings}</div>
                  <p className="text-xs text-[var(--text-light)]">All time</p>
                </div>
              </div>

              <div className="dana-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-[var(--text-light)]">Pending</h3>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-dark)]">{stats.pendingBookings}</div>
                  <p className="text-xs text-[var(--text-light)]">Need approval</p>
                </div>
              </div>

              <div className="dana-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-[var(--text-light)]">Today</h3>
                  <Calendar className="h-4 w-4 text-[var(--primary-color)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-dark)]">{stats.todayBookings}</div>
                  <p className="text-xs text-[var(--text-light)]">Donations today</p>
                </div>
              </div>

              <div className="dana-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-[var(--text-light)]">Upcoming</h3>
                  <Clock className="h-4 w-4 text-[var(--accent-color)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-dark)]">{stats.upcomingBookings}</div>
                  <p className="text-xs text-[var(--text-light)]">Future bookings</p>
                </div>
              </div>

              <div className="dana-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-[var(--text-light)]">Guest Bookings</h3>
                  <Phone className="h-4 w-4 text-[var(--primary-color)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-dark)]">{stats.totalGuestBookings}</div>
                  <p className="text-xs text-[var(--text-light)]">Phone bookings</p>
                </div>
              </div>

              <div className="dana-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-[var(--text-light)]">Pending Guests</h3>
                  <UserPlus className="h-4 w-4 text-[var(--accent-color)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-dark)]">{stats.pendingGuestBookings}</div>
                  <p className="text-xs text-[var(--text-light)]">Need approval</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dana-card p-8">
              <h2 className="text-2xl font-semibold text-[var(--text-dark)] mb-2">Quick Actions</h2>
              <p className="text-[var(--text-light)] mb-6">
                Manage your monastery and donation slots
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/manage/bookings" className="dana-card p-6 hover:shadow-xl transition-all duration-300 text-center group">
                  <Users className="w-8 h-8 text-[var(--primary-color)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[var(--text-dark)] mb-1">Manage Bookings</div>
                  <div className="text-sm text-[var(--text-light)]">View and approve donations</div>
                </Link>

                <Link href="/manage/slots" className="dana-card p-6 hover:shadow-xl transition-all duration-300 text-center group">
                  <Calendar className="w-8 h-8 text-[var(--primary-color)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[var(--text-dark)] mb-1">Donation Slots</div>
                  <div className="text-sm text-[var(--text-light)]">Create and manage time slots</div>
                </Link>

                <Link href="/manage/monastery" className="dana-card p-6 hover:shadow-xl transition-all duration-300 text-center group">
                  <Building className="w-8 h-8 text-[var(--primary-color)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[var(--text-dark)] mb-1">Monastery Info</div>
                  <div className="text-sm text-[var(--text-light)]">Update details and settings</div>
                </Link>

                <Link href="/manage/guest-bookings" className="dana-card p-6 hover:shadow-xl transition-all duration-300 text-center group">
                  <Phone className="w-8 h-8 text-[var(--primary-color)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[var(--text-dark)] mb-1">Guest Bookings</div>
                  <div className="text-sm text-[var(--text-light)]">Phone-based reservations</div>
                </Link>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="dana-card p-8">
              <h2 className="text-2xl font-semibold text-[var(--text-dark)] mb-2">Recent Donation Bookings</h2>
              <p className="text-[var(--text-light)] mb-6">
                Latest booking requests for your monastery
              </p>
              <div>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-4 opacity-50" />
                    <p className="text-[var(--text-light)] text-lg">No recent bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="dana-card p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-semibold text-[var(--text-dark)]">{booking.food_type}</h4>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>

                            <div className="text-sm text-[var(--text-light)] space-y-2">
                              <div className="flex items-center space-x-4">
                                <span><strong>Food:</strong> {booking.food_type}</span>
                                <span><strong>Quantity:</strong> {booking.quantity}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-[var(--primary-color)]" />
                                <span>
                                  {format(parseISO(booking.booking_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {booking.special_instructions && (
                                <div className="bg-[var(--bg-light)] p-3 rounded-lg text-sm">
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
                                className="dana-button dana-button-primary"
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
                      <div className="text-center pt-6">
                        <Button asChild className="dana-button dana-button-secondary">
                          <Link href="/manage/bookings">View All Bookings</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
