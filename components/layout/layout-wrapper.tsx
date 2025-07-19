'use client'

import { ReactNode } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

interface LayoutWrapperProps {
  children: ReactNode
  showNavigation?: boolean
  showFooter?: boolean
  className?: string
}

/**
 * Consistent layout wrapper that ensures navigation, content, and footer
 * all use the same container width and padding system.
 */
export function LayoutWrapper({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  className = ''
}: LayoutWrapperProps) {
  return (
    <div className={`min-h-screen bg-[var(--bg-light)] ${className}`}>
      {showNavigation && <Navigation />}
      <div className="flex-1">
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
  )
}

/**
 * Consistent container component that matches navigation width
 */
export function Container({ 
  children, 
  className = '',
  size = 'default'
}: {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'narrow'
}) {
  const sizeClasses = {
    default: 'max-w-7xl',
    wide: 'max-w-[1400px]',
    narrow: 'max-w-4xl'
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}