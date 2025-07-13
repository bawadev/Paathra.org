'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { DonationMenuItems } from '@/components/layout/donation-menu-items'
import { ManageMenuItems } from '@/components/layout/manage-menu-items'
import { AdminMenuItems } from '@/components/layout/admin-menu-items'
import { UserMenu } from '@/components/layout/user-menu'
import { hasRole, isSuperAdmin } from '@/types/auth'
import { APP_CONFIG, ROUTES, USER_ROLES } from '@/lib/constants'

export function Navigation() {
  const { user, profile } = useAuth()

  if (!user) return null

  const isMonasteryAdmin = hasRole(profile, USER_ROLES.MONASTERY_ADMIN)
  const isSuperAdminUser = isSuperAdmin(profile)

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href={ROUTES.HOME} className="text-xl font-bold text-orange-600">
              {APP_CONFIG.name}
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                {/* Donations Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Donations</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <DonationMenuItems />
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Monasteries Link */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={ROUTES.MONASTERIES} className="px-3 py-2 rounded-md hover:bg-gray-100">
                      Monasteries
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Create Monastery Link (for non-monastery admins) */}
                {!isMonasteryAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href={ROUTES.MANAGE.MONASTERY} className="px-3 py-2 rounded-md hover:bg-gray-100 text-blue-600">
                        Create Monastery
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* Manage Menu (for monastery admins) */}
                {isMonasteryAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ManageMenuItems />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Admin Menu (for super admins) */}
                {isSuperAdminUser && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <AdminMenuItems />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu */}
          <UserMenu profile={profile} />
        </div>
      </div>
    </nav>
  )
}
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/bookings"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <Users className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Bookings</div>
                              <div className="text-sm text-gray-500">View and manage bookings</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/monastery"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <Building className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Monastery Info</div>
                              <div className="text-sm text-gray-500">Update monastery details</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {isSuperAdmin(profile) && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Dashboard</div>
                              <div className="text-sm text-gray-500">System overview & analytics</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/users"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <Users className="w-4 h-4" />
                            <div>
                              <div className="font-medium">User Management</div>
                              <div className="text-sm text-gray-500">Manage all users</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/monasteries"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <Building className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Monasteries</div>
                              <div className="text-sm text-gray-500">Approve & manage monasteries</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/analytics"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Analytics</div>
                              <div className="text-sm text-gray-500">Detailed reports & metrics</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/settings"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <Shield className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Settings</div>
                              <div className="text-sm text-gray-500">System configuration</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{profile?.full_name}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
