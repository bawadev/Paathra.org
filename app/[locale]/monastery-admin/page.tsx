'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function MonasteryAdminPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        router.push('/auth')
        return
      }

      // Check if user has monastery admin role
      if (!profile.user_types?.includes('monastery_admin')) {
        router.push('/')
        return
      }

      // Redirect to upcoming bookings
      router.push('/monastery-admin/upcoming-bookings')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    )
  }

  return null
}
