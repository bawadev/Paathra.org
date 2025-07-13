'use client'

import Link from 'next/link'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Calendar, User } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function DonationMenuItems() {
  return (
    <div className="grid gap-3 p-6 w-[400px]">
      <NavigationMenuLink asChild>
        <Link
          href={ROUTES.DONATE}
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
          href={ROUTES.MY_DONATIONS}
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
  )
}
