'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { UserProfile } from '@/lib/supabase'

interface UserMenuProps {
  profile: UserProfile | null
}

export function UserMenu({ profile }: UserMenuProps) {
  const { signOut } = useAuth()

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:inline-block">
          {profile?.full_name || 'User'}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="flex items-center space-x-1"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden md:inline-block">Sign Out</span>
      </Button>
    </div>
  )
}
