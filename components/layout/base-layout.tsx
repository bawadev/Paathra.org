'use client'

import { Navigation } from '@/components/organisms/Navigation/Navigation'
import { Footer } from '@/components/organisms/Footer/Footer'

interface BaseLayoutProps {
  children: React.ReactNode
  hideNavigation?: boolean
  hideFooter?: boolean
}

export function BaseLayout({ children, hideNavigation = false, hideFooter = false }: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNavigation && <Navigation />}
      <main className="pt-20 flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}