'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import { 
  Users, 
  Building, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalDonors: number
  totalMonasteries: number
  totalBookings: number
  pendingMonasteries: number
  todayBookings: number
  recentUsers: any[]
  recentBookings: any[]
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

      // Fetch total donors
      const { count: totalDonors } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'donor')

      // Fetch total monasteries
      const { count: totalMonasteries } = await supabase
        .from('monasteries')
        .select('*', { count: 'exact', head: true })

      // Fetch total bookings
      const { count: totalBookings } = await supabase
        .from('donation_bookings')
        .select('*', { count: 'exact', head: true })

      // Fetch pending monasteries (assuming there's a status field)
      const { count: pendingMonasteries } = await supabase
        .from('monasteries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch today's bookings
      const today = new Date().toISOString().split('T')[0]
      const { count: todayBookings } = await supabase
        .from('donation_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('user_profiles')
        .select('full_name, user_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent bookings
      const { data: recentBookings } = await supabase
        .from('donation_bookings')
        .select(`
          *,
          donor:user_profiles!donation_bookings_donor_id_fkey(full_name),
          donation_slot:donation_slots!donation_bookings_donation_slot_id_fkey(
            date,
            time_slot,
            monastery:monasteries!donation_slots_monastery_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalUsers: totalUsers || 0,
        totalDonors: totalDonors || 0,
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
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage the Dhaana platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentUsers.length} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monasteries</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMonasteries}</div>
            {stats?.pendingMonasteries && stats.pendingMonasteries > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <p className="text-xs text-yellow-600">
                  {stats.pendingMonasteries} pending approval
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayBookings} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDonors}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalUsers && stats?.totalDonors 
                ? Math.round((stats.totalDonors / stats.totalUsers) * 100)
                : 0}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={user.user_type === 'donor' ? 'default' : 'secondary'}>
                    {user.user_type === 'donor' ? 'Donor' : 'Monastery Admin'}
                  </Badge>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p className="text-sm text-muted-foreground">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Latest donation bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentBookings.map((booking, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {booking.donor?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.donation_slot?.monastery?.name} • {booking.food_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.donation_slot?.date} at {booking.donation_slot?.time_slot}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'pending' ? 'secondary' :
                      booking.status === 'cancelled' ? 'destructive' : 'outline'
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <p className="text-sm text-muted-foreground">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Building className="h-6 w-6 mb-2" />
              <span>Review Monasteries</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <PieChart className="h-6 w-6 mb-2" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <AlertCircle className="h-6 w-6 mb-2" />
              <span>System Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
