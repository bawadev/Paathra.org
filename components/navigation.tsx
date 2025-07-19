'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Calendar, Users, Building, LogOut, User, Shield, BarChart3 } from 'lucide-react'
import { hasRole, isSuperAdmin } from '@/types/auth'

export function Navigation() {
  const { user, profile, signOut } = useAuth()

  if (!user) return null

  return (
    <nav className="navbar-fixed glass-effect shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold text-[var(--primary-color)] hover:scale-105 transition-transform">
              <div className="lotus-icon"></div>
              <span>Dana</span>
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Donations</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/donate"
                          className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                        >
                          <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <div>
                            <div className="font-medium">Make Donation</div>
                            <div className="text-sm text-gray-500">Book a donation slot</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/my-donations"
                          className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                        >
                          <User className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <div>
                            <div className="font-medium">My Donations</div>
                            <div className="text-sm text-gray-500">View your bookings</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/monasteries" className="px-3 py-2 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300">
                      Monasteries
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {!hasRole(profile, 'monastery_admin') && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/manage/monastery" className="px-3 py-2 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] text-[var(--primary-color)] transition-all duration-300">
                        Create Monastery
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {hasRole(profile, 'monastery_admin') && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/slots"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">Donation Slots</div>
                              <div className="text-sm text-gray-500">Manage available slots</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/bookings"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <Users className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">Bookings</div>
                              <div className="text-sm text-gray-500">View and manage bookings</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/monastery"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <Building className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
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
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <BarChart3 className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">Dashboard</div>
                              <div className="text-sm text-gray-500">System overview & analytics</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/users"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <Users className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">User Management</div>
                              <div className="text-sm text-gray-500">Manage all users</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/monasteries"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <Building className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">Monasteries</div>
                              <div className="text-sm text-gray-500">Approve & manage monasteries</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/analytics"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <BarChart3 className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">Analytics</div>
                              <div className="text-sm text-gray-500">Detailed reports & metrics</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/settings"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all duration-300"
                          >
                            <Shield className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
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
