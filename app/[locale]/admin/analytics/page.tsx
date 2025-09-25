'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/organisms/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  Calendar,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalDonors: number
  totalMonasteries: number
  totalBookings: number
  totalDonations: number
  userGrowth: {
    thisMonth: number
    lastMonth: number
    percentage: number
  }
  bookingGrowth: {
    thisMonth: number
    lastMonth: number
    percentage: number
  }
  monasteryGrowth: {
    thisMonth: number
    lastMonth: number
    percentage: number
  }
  recentActivity: Array<{
    id: string
    donor?: { full_name: string }
    donation_slot?: {
      monastery?: { name: string }
      date: string
    }
    food_type: string
    status: string
    created_at: string
  }>
  topMonasteries: Array<{
    id: string
    name: string
    donation_slots: Array<{
      donation_bookings: Array<{ count: number }>
    }>
  }>
  userTypeDistribution: {
    donors: number
    monasteryAdmins: number
    superAdmins: number
  }
  bookingStatusDistribution: {
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Fetch total counts
      const [
        { count: totalUsers },
        { count: totalMonasteries },
        { count: totalBookings }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('monasteries').select('*', { count: 'exact', head: true }),
        supabase.from('donation_bookings').select('*', { count: 'exact', head: true })
      ])

      // Get donor count separately since we need to check array contains
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('user_types')
      
      const totalDonors = allUsers?.filter((u: { user_types?: string[] }) => u.user_types?.includes('donor')).length || 0

      // Fetch growth data
      const [
        { count: usersThisMonth },
        { count: usersLastMonth },
        { count: bookingsThisMonth },
        { count: bookingsLastMonth },
        { count: monasteriesThisMonth },
        { count: monasteriesLastMonth }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart.toISOString()),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', lastMonthEnd.toISOString()),
        supabase.from('donation_bookings').select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart.toISOString()),
        supabase.from('donation_bookings').select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', lastMonthEnd.toISOString()),
        supabase.from('monasteries').select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart.toISOString()),
        supabase.from('monasteries').select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', lastMonthEnd.toISOString())
      ])

      // Calculate percentage growth
      const userGrowthPercentage = usersLastMonth ? ((usersThisMonth || 0) - (usersLastMonth || 0)) / (usersLastMonth || 1) * 100 : 0
      const bookingGrowthPercentage = bookingsLastMonth ? ((bookingsThisMonth || 0) - (bookingsLastMonth || 0)) / (bookingsLastMonth || 1) * 100 : 0
      const monasteryGrowthPercentage = monasteriesLastMonth ? ((monasteriesThisMonth || 0) - (monasteriesLastMonth || 0)) / (monasteriesLastMonth || 1) * 100 : 0

      // Fetch user type distribution
      const { data: userTypes } = await supabase
        .from('user_profiles')
        .select('user_types')

      const userTypeDistribution = {
        donors: userTypes?.filter((u: { user_types?: string[] }) => u.user_types?.includes('donor')).length || 0,
        monasteryAdmins: userTypes?.filter((u: { user_types?: string[] }) => u.user_types?.includes('monastery_admin')).length || 0,
        superAdmins: userTypes?.filter((u: { user_types?: string[] }) => u.user_types?.includes('super_admin')).length || 0
      }

      // Fetch booking status distribution
      const { data: bookingStatuses } = await supabase
        .from('donation_bookings')
        .select('status')

      const bookingStatusDistribution = {
        pending: bookingStatuses?.filter((b: { status: string }) => b.status === 'pending').length || 0,
        confirmed: bookingStatuses?.filter((b: { status: string }) => b.status === 'confirmed').length || 0,
        completed: bookingStatuses?.filter((b: { status: string }) => b.status === 'completed').length || 0,
        cancelled: bookingStatuses?.filter((b: { status: string }) => b.status === 'cancelled').length || 0
      }

      // Fetch top monasteries by booking count
      const { data: topMonasteries } = await supabase
        .from('monasteries')
        .select(`
          id,
          name,
          donation_slots!inner(
            donation_bookings(count)
          )
        `)
        .limit(5)

      // Fetch recent activity
      const { data: recentActivity } = await supabase
        .from('donation_bookings')
        .select(`
          *,
          donor:user_profiles!donation_bookings_donor_id_fkey(full_name),
          donation_slot:donation_slots!donation_bookings_donation_slot_id_fkey(
            date,
            monastery:monasteries!donation_slots_monastery_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setData({
        totalUsers: totalUsers || 0,
        totalDonors: totalDonors || 0,
        totalMonasteries: totalMonasteries || 0,
        totalBookings: totalBookings || 0,
        totalDonations: totalBookings || 0, // Assuming each booking is a donation
        userGrowth: {
          thisMonth: usersThisMonth || 0,
          lastMonth: usersLastMonth || 0,
          percentage: userGrowthPercentage
        },
        bookingGrowth: {
          thisMonth: bookingsThisMonth || 0,
          lastMonth: bookingsLastMonth || 0,
          percentage: bookingGrowthPercentage
        },
        monasteryGrowth: {
          thisMonth: monasteriesThisMonth || 0,
          lastMonth: monasteriesLastMonth || 0,
          percentage: monasteryGrowthPercentage
        },
        recentActivity: recentActivity || [],
        topMonasteries: topMonasteries || [],
        userTypeDistribution,
        bookingStatusDistribution
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(1)}%`
  }

  const getGrowthIcon = (percentage: number) => {
    return percentage >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getGrowthColor = (percentage: number) => {
    return percentage >= 0 ? 'text-green-600' : 'text-red-600'
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
          <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights and platform metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics with Growth */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(data?.userGrowth.percentage || 0)}
              <span className={getGrowthColor(data?.userGrowth.percentage || 0)}>
                {formatPercentage(data?.userGrowth.percentage || 0)}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monasteries</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalMonasteries}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(data?.monasteryGrowth.percentage || 0)}
              <span className={getGrowthColor(data?.monasteryGrowth.percentage || 0)}>
                {formatPercentage(data?.monasteryGrowth.percentage || 0)}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalBookings}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getGrowthIcon(data?.bookingGrowth.percentage || 0)}
              <span className={getGrowthColor(data?.bookingGrowth.percentage || 0)}>
                {formatPercentage(data?.bookingGrowth.percentage || 0)}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalDonors}</div>
            <p className="text-xs text-muted-foreground">
              {data?.totalUsers && data?.totalDonors 
                ? Math.round((data.totalDonors / data.totalUsers) * 100)
                : 0}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Type Distribution</CardTitle>
            <CardDescription>Breakdown of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Donors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.userTypeDistribution.donors}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalUsers ? Math.round((data.userTypeDistribution.donors / data.totalUsers) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Monastery Admins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.userTypeDistribution.monasteryAdmins}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalUsers ? Math.round((data.userTypeDistribution.monasteryAdmins / data.totalUsers) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Platform Admins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.userTypeDistribution.superAdmins}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalUsers ? Math.round((data.userTypeDistribution.superAdmins / data.totalUsers) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
            <CardDescription>Current status of all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.bookingStatusDistribution.pending}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalBookings ? Math.round((data.bookingStatusDistribution.pending / data.totalBookings) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.bookingStatusDistribution.confirmed}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalBookings ? Math.round((data.bookingStatusDistribution.confirmed / data.totalBookings) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.bookingStatusDistribution.completed}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalBookings ? Math.round((data.bookingStatusDistribution.completed / data.totalBookings) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Cancelled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{data?.bookingStatusDistribution.cancelled}</span>
                  <span className="text-muted-foreground">
                    ({data?.totalBookings ? Math.round((data.bookingStatusDistribution.cancelled / data.totalBookings) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.donor?.full_name} made a donation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.donation_slot?.monastery?.name} • {activity.food_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={
                  activity.status === 'confirmed' ? 'default' :
                  activity.status === 'pending' ? 'secondary' :
                  activity.status === 'cancelled' ? 'destructive' : 'outline'
                }>
                  {activity.status}
                </Badge>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
