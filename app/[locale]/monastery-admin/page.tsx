'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MonasteryAdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to upcoming bookings - authentication is handled by middleware
    router.push('/en/monastery-admin/upcoming-bookings')
  }, [router])

  return null
}
