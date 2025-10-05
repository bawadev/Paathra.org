/**
 * StatCard - Consistent stat/metric card using design system
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'trust' | 'spiritual'
  cultural?: 'sinhala' | 'english' | 'universal'
  className?: string
}

const variantGradients = {
  default: 'from-neutral-500 to-neutral-600',
  primary: 'from-primary-500 to-primary-600',
  secondary: 'from-secondary-500 to-secondary-600',
  accent: 'from-accent-500 to-accent-600',
  trust: 'from-trust-500 to-trust-600',
  spiritual: 'from-spiritual-500 to-spiritual-600',
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  cultural = 'universal',
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'dana-card group hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3
          className={cn(
            'font-medium text-muted-foreground',
            cultural === 'sinhala' && 'text-base',
            cultural !== 'sinhala' && 'text-sm'
          )}
        >
          {title}
        </h3>
        {Icon && (
          <div
            className={cn(
              'rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform',
              'bg-gradient-to-r',
              variantGradients[variant],
              cultural === 'sinhala' && 'w-14 h-14',
              cultural !== 'sinhala' && 'w-12 h-12'
            )}
          >
            <Icon
              className={cn(
                'text-white',
                cultural === 'sinhala' && 'w-7 h-7',
                cultural !== 'sinhala' && 'w-6 h-6'
              )}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'font-bold text-foreground',
            cultural === 'sinhala' && 'text-4xl mb-2',
            cultural !== 'sinhala' && 'text-3xl mb-1'
          )}
        >
          {value}
        </div>
        {description && (
          <p
            className={cn(
              'text-muted-foreground',
              cultural === 'sinhala' && 'text-base',
              cultural !== 'sinhala' && 'text-sm'
            )}
          >
            {description}
          </p>
        )}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 mt-2',
              cultural === 'sinhala' && 'text-base',
              cultural !== 'sinhala' && 'text-sm'
            )}
          >
            <span
              className={cn(
                'font-medium',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'neutral' && 'text-gray-600'
              )}
            >
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.direction === 'neutral' && '→'} {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
