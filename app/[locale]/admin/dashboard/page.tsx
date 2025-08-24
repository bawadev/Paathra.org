'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import { 
  Users, 
  Building, 
  Calendar, 
  TrendingUp, 
  AlertCircle
} from 'lucide-react'
import { getUserTypeDisplayName, UserType } from '@/types/auth'

interface UserProfile {
  id: string
  full_name: string
  email: string
  user_types: string[]
  created_at: string
  avatar_url?: string
}

interface Booking {
  id: string
  donation_date: string
  status: string
  food_type: string
  estimated_servings: number
  created_at: string
  user_profiles?: {
    full_name: string
  }
  donation_slots?: {
    monasteries?: {
      name: string
    }
  }
}

interface DashboardStats {
  totalUsers: number
  totalDonors: number
  totalMonasteries: number
  totalBookings: number
  pendingMonasteries: number
  todayBookings: number
  recentUsers: UserProfile[]
  recentBookings: Booking[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch all users first to count donors properly
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('user_types')

      // Count donors (users with donor type)
      const totalDonors = allUsers?.filter((user: { user_types?: string[] }) => 
        user.user_types?.includes('donor')
      ).length || 0

      // Fetch total monasteries
      const { count: totalMonasteries } = await supabase
        .from('monasteries')
        .select('*', { count: 'exact', head: true })

      // Fetch pending monasteries
      const { count: pendingMonasteries } = await supabase
        .from('monasteries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch total bookings
      const { count: totalBookings } = await supabase
        .from('donation_bookings')
        .select('*', { count: 'exact', head: true })

      // Fetch today's bookings
      const today = new Date().toISOString().split('T')[0]
      const { count: todayBookings } = await supabase
        .from('donation_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('donation_date', today)
        .lt('donation_date', `${today}T23:59:59`)

      // Fetch recent users (last 10)
      const { data: recentUsers } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch recent bookings (last 10)
      const { data: recentBookings } = await supabase
        .from('donation_bookings')
        .select(`
          *,
          user_profiles (full_name),
          donation_slots (
            date,
            monasteries (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalUsers: totalUsers || 0,
        totalDonors,
        totalMonasteries: totalMonasteries || 0,
        totalBookings: totalBookings || 0,
        pendingMonasteries: pendingMonasteries || 0,
        todayBookings: todayBookings || 0,
        recentUsers: recentUsers || [],
        recentBookings: recentBookings || []
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="pt-32 pb-20 px-5">
        <div className="container-dana">
        {/* Dashboard Header */}
        <div className="card-dana gradient-primary text-white p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span>🛡️</span>
                Admin Dashboard
              </h1>
              <p className="text-white/90 text-lg">
                Monitor and manage the Dana platform
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats?.todayBookings || 0}</div>
              <div className="text-white/80">Today&apos;s Bookings</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="card-dana group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-dark)]">Total Users</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-dark)]">{stats?.totalUsers}</div>
              <p className="text-sm text-[var(--text-light)]">
                +{stats?.recentUsers.length} new this week
              </p>
            </CardContent>
          </Card>

          <Card className="card-dana group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-dark)]">Monasteries</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-dark)]">{stats?.totalMonasteries}</div>
              {stats?.pendingMonasteries && stats.pendingMonasteries > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  <p className="text-sm text-yellow-600">
                    {stats.pendingMonasteries} pending approval
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-dana group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-dark)]">Total Donations</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--accent-color)] to-[var(--primary-color)] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-dark)]">{stats?.totalBookings}</div>
              <p className="text-sm text-[var(--text-light)]">
                {stats?.todayBookings} today
              </p>
            </CardContent>
          </Card>

          <Card className="card-dana group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-dark)]">Active Donors</CardTitle>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-[var(--primary-color)] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-dark)]">{stats?.totalDonors}</div>
              <p className="text-sm text-[var(--text-light)]">
                {stats?.totalUsers && stats?.totalDonors 
                  ? Math.round((stats.totalDonors / stats.totalUsers) * 100)
                  : 0}% of total users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Recent Users */}
          <Card className="card-dana">
            <CardHeader>
              <CardTitle className="text-[var(--text-dark)] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Users
              </CardTitle>
              <CardDescription className="text-[var(--text-light)]">Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-[var(--bg-light)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--text-dark)]">{user.full_name}</p>
                      <p className="text-sm text-[var(--text-light)]">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {getUserTypeDisplayName(user.user_types[0] as UserType)}
                      </Badge>
                      <p className="text-xs text-[var(--text-light)]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="card-dana">
            <CardHeader>
              <CardTitle className="text-[var(--text-dark)] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Bookings
              </CardTitle>
              <CardDescription className="text-[var(--text-light)]">Latest donation bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-[var(--bg-light)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--text-dark)]">
                        {booking.user_profiles?.full_name}
                      </p>
                      <p className="text-sm text-[var(--text-light)]">
                        {booking.donation_slots?.monasteries?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {booking.status}
                      </Badge>
                      <p className="text-xs text-[var(--text-light)]">
                        {new Date(booking.donation_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </div>
  )
}
