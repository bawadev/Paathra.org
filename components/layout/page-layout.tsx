/**
 * Reusable Page Layout Component
 * 
 * Provides consistent layout structure for all pages including:
 * - Navigation
 * - Footer
 * - Loading states
 * - Responsive containers
 */

'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { LoadingSpinner } from '@/components/loading'

interface PageLayoutProps {
  children?: React.ReactNode
  loading?: boolean
  className?: string
  showNavigation?: boolean
  showFooter?: boolean
  loadingText?: string
}

export function PageLayout({ 
  children, 
  loading = false, 
  className = '',
  showNavigation = true,
  showFooter = true,
  loadingText = 'Loading...'
}: PageLayoutProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        {showNavigation && <Navigation />}
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          </div>
        </div>
        {showFooter && <Footer />}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[var(--bg-light)] ${className}`}>
      {showNavigation && <Navigation />}
      {children}
      {showFooter && <Footer />}
    </div>
  )
}

/**
 * Main content wrapper with consistent padding and container
 */
export function MainContent({ 
  children, 
  className = '',
  pt = 32,
  pb = 20
}: {
  children: React.ReactNode
  className?: string
  pt?: number
  pb?: number
}) {
  return (
    <main className={`pt-${pt} pb-${pb} px-5 ${className}`}>
      <div className="container-dana">
        {children}
      </div>
    </main>
  )
}

/**
 * Hero section with consistent styling
 */
export function HeroSection({ 
  title, 
  subtitle, 
  icon,
  className = ''
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <section className="pt-32 pb-20 px-5">
      <div className="container-dana">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            {icon && <div className="mr-3">{icon}</div>}
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="gradient-text fade-in-1">{title}</span>
            </h1>
          </div>
          {subtitle && (
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto fade-in-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}