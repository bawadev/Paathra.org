'use client'

import Link from 'next/link'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Calendar, Users, Building, BarChart3 } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function ManageMenuItems() {
  return (
    <div className="grid gap-3 p-6 w-[400px]">
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.MANAGE.SLOTS}
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
          href={ROUTES.MANAGE.BOOKINGS}
          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
        >
          <Users className="w-4 h-4" />
          <div>
            <div className="font-medium">View Bookings</div>
            <div className="text-sm text-gray-500">See donation bookings</div>
          </div>
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.MANAGE.MONASTERY}
          className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50"
        >
          <Building className="w-4 h-4" />
          <div>
            <div className="font-medium">Monastery Settings</div>
            <div className="text-sm text-gray-500">Update monastery info</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </div>
  )
}
