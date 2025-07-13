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
