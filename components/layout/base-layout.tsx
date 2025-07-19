'use client'

import { Navigation } from '@/components/navigation'

interface BaseLayoutProps {
  children: React.ReactNode
  hideNavigation?: boolean
}

export function BaseLayout({ children, hideNavigation = false }: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && <Navigation />}
      <main className="pt-20">
        {children}
      </main>
    </div>
  )
}