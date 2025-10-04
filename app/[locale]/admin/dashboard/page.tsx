'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/loading'
import {
  Users,
  Building,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react'
import { getUserTypeDisplayName, UserType, hasRole } from '@/types/auth'
import { PageContainer, PageHeader, StatCard, StatusBadge } from '@/lib/design-system'
import { useTranslations } from 'next-intl'

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
  const { user, profile, loading: authLoading } = useAuthStore()
  const router = useRouter()
  const t = useTranslations('Admin.dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication and role
    if (!authLoading) {
      if (!user) {
        router.push('/en/auth')
      } else if (profile && !hasRole(profile, 'super_admin')) {
        // User is authenticated but not a super admin
        router.push('/en')
      } else if (profile && hasRole(profile, 'super_admin')) {
        // User is authenticated and is a super admin
        fetchDashboardStats()
      }
    }
  }, [user, profile, authLoading, router])

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
      console.error(t('fetchError'), error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading || (user && !profile && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return null // Will redirect in useEffect
  }

  // User authenticated but not super admin
  if (profile && !hasRole(profile, 'super_admin')) {
    return null // Will redirect in useEffect
  }

  // Loading dashboard data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <PageContainer gradient maxWidth="xl">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={Shield}
        gradient
        action={
          <div className="text-right">
            <div className="text-2xl font-bold">{stats?.todayBookings || 0}</div>
            <div className="text-white/80">{t('todayBookings')}</div>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title={t('totalUsers')}
          value={stats?.totalUsers || 0}
          description={t('newThisWeek', { count: stats?.recentUsers.length || 0 })}
          icon={Users}
          variant="primary"
        />

        <StatCard
          title={t('monasteries')}
          value={stats?.totalMonasteries || 0}
          description={
            stats?.pendingMonasteries && stats.pendingMonasteries > 0
              ? t('pendingApproval', { count: stats.pendingMonasteries })
              : t('allApproved')
          }
          icon={Building}
          variant="secondary"
        />

        <StatCard
          title={t('totalDonations')}
          value={stats?.totalBookings || 0}
          description={t('today', { count: stats?.todayBookings || 0 })}
          icon={Calendar}
          variant="accent"
        />

        <StatCard
          title={t('activeDonors')}
          value={stats?.totalDonors || 0}
          description={t('percentOfUsers', {
            percent: stats?.totalUsers && stats?.totalDonors
              ? Math.round((stats.totalDonors / stats.totalUsers) * 100)
              : 0
          })}
          icon={TrendingUp}
          variant="trust"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Users */}
        <div className="dana-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('recentUsers')}
            </CardTitle>
            <CardDescription>{t('latestRegistrations')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {getUserTypeDisplayName(user.user_types[0] as UserType)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>

        {/* Recent Bookings */}
        <div className="dana-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('recentBookings')}
            </CardTitle>
            <CardDescription>{t('latestDonationBookings')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {booking.user_profiles?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.donation_slots?.monasteries?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={booking.status} className="mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.donation_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    </PageContainer>
  )
}
