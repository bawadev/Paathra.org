'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default function AdminDashboardSimple() {
  // Mock data for testing
  const mockStats = {
    totalUsers: 150,
    totalDonors: 120,
    totalMonasteries: 25,
    totalBookings: 380,
    pendingMonasteries: 3,
    todayBookings: 12,
    recentUsers: [
      { full_name: 'John Doe', user_type: 'donor', created_at: '2025-01-10T10:00:00Z' },
      { full_name: 'Jane Smith', user_type: 'monastery_admin', created_at: '2025-01-09T15:30:00Z' },
      { full_name: 'Bob Wilson', user_type: 'donor', created_at: '2025-01-08T09:15:00Z' }
    ],
    recentBookings: [
      { 
        donor: { full_name: 'Alice Johnson' }, 
        food_type: 'Rice & Curry',
        status: 'confirmed',
        donation_slot: { 
          date: '2025-01-15', 
          time_slot: '12:00 PM',
          monastery: { name: 'Peaceful Monastery' }
        }
      },
      { 
        donor: { full_name: 'Mike Brown' }, 
        food_type: 'Vegetable Soup',
        status: 'pending',
        donation_slot: { 
          date: '2025-01-16', 
          time_slot: '6:00 PM',
          monastery: { name: 'Mountain Retreat' }
        }
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="pt-32 pb-20 px-5">
        <div className="container-dana">
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
            <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.recentUsers.length} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monasteries</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalMonasteries}</div>
            {mockStats.pendingMonasteries > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <p className="text-xs text-yellow-600">
                  {mockStats.pendingMonasteries} pending approval
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
            <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.todayBookings} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalDonors}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStats.totalDonors / mockStats.totalUsers) * 100)}% of total users
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
              {mockStats.recentUsers.map((user, index) => (
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
              {mockStats.recentBookings.map((booking, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {booking.donor.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.donation_slot.monastery.name} • {booking.food_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.donation_slot.date} at {booking.donation_slot.time_slot}
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

      {/* Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Admin Dashboard Test Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-green-700">
            <p className="font-medium">✅ All components are rendering correctly!</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Cards and layouts working</li>
              <li>• Icons loading properly</li>
              <li>• Badges and buttons functioning</li>
              <li>• Grid layouts responsive</li>
              <li>• Mock data displaying correctly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
