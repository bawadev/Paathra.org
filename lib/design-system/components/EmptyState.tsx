/**
 * EmptyState - Consistent empty state component using design system
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  className?: string
  cultural?: 'sinhala' | 'english' | 'universal'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  cultural = 'universal',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        cultural === 'sinhala' && 'py-16 px-6',
        cultural !== 'sinhala' && 'py-12 px-4',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'rounded-full bg-muted flex items-center justify-center mb-4',
            cultural === 'sinhala' && 'w-20 h-20',
            cultural !== 'sinhala' && 'w-16 h-16'
          )}
        >
          <Icon
            className={cn(
              'text-muted-foreground',
              cultural === 'sinhala' && 'w-10 h-10',
              cultural !== 'sinhala' && 'w-8 h-8'
            )}
          />
        </div>
      )}
      <h3
        className={cn(
          'font-semibold text-foreground mb-2',
          cultural === 'sinhala' && 'text-2xl',
          cultural !== 'sinhala' && 'text-xl'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-muted-foreground max-w-md mb-6',
            cultural === 'sinhala' && 'text-lg leading-relaxed',
            cultural !== 'sinhala' && 'text-base leading-normal'
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          size={cultural === 'sinhala' ? 'lg' : 'default'}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
