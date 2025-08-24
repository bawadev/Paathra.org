'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserType, hasRole, isSuperAdmin, getUserTypeDisplayName } from '@/types/auth'

export default function NavigationTest() {
  const [selectedUser, setSelectedUser] = useState<'user1' | 'user2' | 'user3'>('user1')

  // All users now have all roles available
  const mockUsers = {
    user1: {
      user: { id: '1', email: 'john@test.com' },
      profile: { 
        id: '1',
        full_name: 'John Doe', 
        email: 'john@test.com',
        avatar_url: undefined,
        user_types: ['donor', 'monastery_admin', 'super_admin'] as UserType[],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    user2: {
      user: { id: '2', email: 'jane@test.com' },
      profile: { 
        id: '2',
        full_name: 'Jane Smith',
        email: 'jane@test.com',
        avatar_url: undefined,
        user_types: ['donor', 'monastery_admin', 'super_admin'] as UserType[],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    user3: {
      user: { id: '3', email: 'admin@test.com' },
      profile: { 
        id: '3',
        full_name: 'Admin User',
        email: 'admin@test.com', 
        avatar_url: undefined,
        user_types: ['donor', 'monastery_admin', 'super_admin'] as UserType[],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  const currentUser = mockUsers[selectedUser]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mock Navigation */}
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold text-orange-600">Dhaana</span>
              
              {/* Admin Menu Test - All users should see this now */}
              {isSuperAdmin(currentUser.profile) && (
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-2 rounded-md bg-green-100 text-green-800 text-sm font-medium">
                    ✅ Admin Menu Available
                  </span>
                  <div className="flex space-x-2">
                    <Badge variant="outline">Dashboard</Badge>
                    <Badge variant="outline">Users</Badge>
                    <Badge variant="outline">Monasteries</Badge>
                    <Badge variant="outline">Analytics</Badge>
                    <Badge variant="outline">Settings</Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {currentUser.profile.full_name} (All Roles)
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Multi-Role User Test</h1>
            <p className="text-muted-foreground">
              All users now have all three roles: Donor, Monastery Admin, and Super Admin
            </p>
          </div>

          {/* User Switcher */}
          <Card>
            <CardHeader>
              <CardTitle>Switch Test User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  variant={selectedUser === 'user1' ? 'default' : 'outline'}
                  onClick={() => setSelectedUser('user1')}
                >
                  John Doe
                </Button>
                <Button 
                  variant={selectedUser === 'user2' ? 'default' : 'outline'}
                  onClick={() => setSelectedUser('user2')}
                >
                  Jane Smith
                </Button>
                <Button 
                  variant={selectedUser === 'user3' ? 'default' : 'outline'}
                  onClick={() => setSelectedUser('user3')}
                >
                  Admin User
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current User Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current User Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Full Name:</span>
                  <span className="font-medium">{currentUser.profile.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{currentUser.profile.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>All User Types:</span>
                  <div className="flex space-x-1">
                    {currentUser.profile.user_types.map((type) => (
                      <Badge key={type} variant="default">
                        {getUserTypeDisplayName(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Is Donor</div>
                    <Badge variant={hasRole(currentUser.profile, 'donor') ? 'default' : 'secondary'}>
                      {hasRole(currentUser.profile, 'donor') ? '✅ Yes' : '❌ No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Is Monastery Admin</div>
                    <Badge variant={hasRole(currentUser.profile, 'monastery_admin') ? 'default' : 'secondary'}>
                      {hasRole(currentUser.profile, 'monastery_admin') ? '✅ Yes' : '❌ No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Is Super Admin</div>
                    <Badge variant={isSuperAdmin(currentUser.profile) ? 'default' : 'secondary'}>
                      {isSuperAdmin(currentUser.profile) ? '✅ Yes' : '❌ No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All users should have admin access now */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Full Access Granted!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-700 space-y-2">
                <p>All users now have complete access to:</p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium">Donor Features</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Make food donations</li>
                      <li>Book donation slots</li>
                      <li>View donation history</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Monastery Admin Features</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Manage donation slots</li>
                      <li>View & manage bookings</li>
                      <li>Update monastery info</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Super Admin Features</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Admin dashboard</li>
                      <li>User management</li>
                      <li>System analytics</li>
                      <li>Global settings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links for Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                <Button asChild variant="outline" className="h-auto p-3">
                  <a href="/admin/dashboard" className="text-left">
                    <div className="font-medium">Admin Dashboard</div>
                    <div className="text-xs text-gray-500">Real admin dashboard</div>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-3">
                  <a href="/admin/users" className="text-left">
                    <div className="font-medium">User Management</div>
                    <div className="text-xs text-gray-500">Manage all users</div>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-3">
                  <a href="/admin/monasteries" className="text-left">
                    <div className="font-medium">Monastery Management</div>
                    <div className="text-xs text-gray-500">Manage monasteries</div>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-3">
                  <a href="/manage" className="text-left">
                    <div className="font-medium">Monastery Admin</div>
                    <div className="text-xs text-gray-500">Monastery management</div>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-3">
                  <a href="/donate" className="text-left">
                    <div className="font-medium">Make Donation</div>
                    <div className="text-xs text-gray-500">Book a donation slot</div>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-auto p-3">
                  <a href="/" className="text-left">
                    <div className="font-medium">Home Page</div>
                    <div className="text-xs text-gray-500">Return to main page</div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
