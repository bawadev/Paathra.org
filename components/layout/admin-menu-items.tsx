'use client'

import Link from 'next/link'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { BarChart3, Users, Building, Settings } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function AdminMenuItems() {
  return (
    <div className="grid gap-3 p-6 w-[500px] md:grid-cols-2">
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.ADMIN.DASHBOARD}
          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
        >
          <BarChart3 className="w-4 h-4" />
          <div>
            <div className="font-medium">Dashboard</div>
            <div className="text-sm text-gray-500">Platform overview</div>
          </div>
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.ADMIN.ANALYTICS}
          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
        >
          <BarChart3 className="w-4 h-4" />
          <div>
            <div className="font-medium">Analytics</div>
            <div className="text-sm text-gray-500">Detailed insights</div>
          </div>
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.ADMIN.USERS}
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
          href={ROUTES.ADMIN.MONASTERIES}
          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
        >
          <Building className="w-4 h-4" />
          <div>
            <div className="font-medium">Monasteries</div>
            <div className="text-sm text-gray-500">All monasteries</div>
          </div>
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.ADMIN.SETTINGS}
          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          <div>
            <div className="font-medium">Platform Settings</div>
            <div className="text-sm text-gray-500">System configuration</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </div>
  )
}
