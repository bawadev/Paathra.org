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
import { Calendar, Users, Building, LogOut, User } from 'lucide-react'

export function Navigation() {
  const { user, profile, signOut } = useAuth()

  if (!user) return null

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-orange-600">
              Dhaana
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
                          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                        >
                          <Calendar className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Make Donation</div>
                            <div className="text-sm text-gray-500">Book a donation slot</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/my-donations"
                          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" />
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
                    <Link href="/monasteries" className="px-3 py-2 rounded-md hover:bg-gray-100">
                      Monasteries
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {profile?.user_type !== 'monastery_admin' && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/manage/monastery" className="px-3 py-2 rounded-md hover:bg-gray-100 text-blue-600">
                        Create Monastery
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {profile?.user_type === 'monastery_admin' && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/slots"
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
                          >
                            <Calendar className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Donation Slots</div>
                              <div className="text-sm text-gray-500">Manage available slots</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
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
