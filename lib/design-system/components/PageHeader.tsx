/**
 * PageHeader - Consistent page header using design system
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
  gradient?: boolean
  cultural?: 'sinhala' | 'english' | 'universal'
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
  gradient = false,
  cultural = 'universal',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8',
        gradient && 'bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl p-8 shadow-lg',
        !gradient && 'border-b border-border pb-6',
        cultural === 'sinhala' && 'space-y-3',
        cultural === 'english' && 'space-y-2',
        cultural === 'universal' && 'space-y-2.5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex-1 space-y-2">
          <h1
            className={cn(
              'font-bold flex items-center gap-3',
              gradient ? 'text-white' : 'text-foreground',
              cultural === 'sinhala' && 'text-4xl',
              cultural === 'english' && 'text-3xl',
              cultural === 'universal' && 'text-3xl'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'shrink-0',
                  cultural === 'sinhala' && 'w-8 h-8',
                  cultural !== 'sinhala' && 'w-7 h-7'
                )}
              />
            )}
            <span>{title}</span>
          </h1>
          {description && (
            <p
              className={cn(
                gradient ? 'text-white/90' : 'text-muted-foreground',
                cultural === 'sinhala' && 'text-lg leading-relaxed',
                cultural !== 'sinhala' && 'text-base leading-normal'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 hidden sm:block">{action}</div>}
      </div>
    </div>
  )
}
