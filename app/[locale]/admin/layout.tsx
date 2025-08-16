'use client'

import { useAuth } from '@/lib/auth-context'
import { BaseLayout } from '@/components/layout/base-layout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/loading'
import { isSuperAdmin } from '@/types/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth')
        return
      }
      
      if (!isSuperAdmin(profile)) {
        router.push('/')
        return
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || !isSuperAdmin(profile)) {
    return null
  }

  return (
    <BaseLayout>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </BaseLayout>
  )
}
