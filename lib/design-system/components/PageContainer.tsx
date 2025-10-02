/**
 * PageContainer - Consistent page wrapper using design system
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { spacingTokens } from '../tokens'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  gradient?: boolean
  cultural?: 'sinhala' | 'english' | 'universal'
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  '2xl': 'max-w-[1600px]',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'px-4 py-6',
  md: 'px-5 py-8',
  lg: 'px-6 py-12',
}

export function PageContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  gradient = false,
  cultural = 'universal',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full',
        gradient
          ? 'bg-gradient-to-br from-background via-primary-50/30 to-accent-50/20'
          : 'bg-background',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          cultural === 'sinhala' && 'space-y-6',
          cultural === 'english' && 'space-y-4',
          cultural === 'universal' && 'space-y-5'
        )}
      >
        {children}
      </div>
    </div>
  )
}
