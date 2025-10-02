/**
 * StatusBadge - Consistent status indicator using design system
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type StatusType =
  | 'pending'
  | 'monastery_approved'
  | 'confirmed'
  | 'delivered'
  | 'not_delivered'
  | 'cancelled'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
  cultural?: 'sinhala' | 'english' | 'universal'
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string, label?: string }> = {
  // Donation booking statuses
  pending: {
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Pending',
  },
  monastery_approved: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Monastery Approved',
  },
  confirmed: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Confirmed',
  },
  delivered: {
    variant: 'default',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Delivered',
  },
  not_delivered: {
    variant: 'destructive',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Not Delivered',
  },
  cancelled: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Cancelled',
  },
  // General statuses
  approved: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Approved',
  },
  rejected: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Rejected',
  },
  active: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Active',
  },
  inactive: {
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Inactive',
  },
  success: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
    label: 'Success',
  },
  error: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200',
    label: 'Error',
  },
  warning: {
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Warning',
  },
  info: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Info',
  },
}

export function StatusBadge({ status, className, cultural = 'universal' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
  const config = statusConfig[normalizedStatus] || {
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: status,
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'capitalize font-medium',
        config.className,
        cultural === 'sinhala' && 'text-sm px-3 py-1',
        cultural !== 'sinhala' && 'text-xs px-2 py-0.5',
        className
      )}
    >
      {config.label || status}
    </Badge>
  )
}

// Helper function to get status color
export function getStatusColor(status: StatusType | string): string {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
  const config = statusConfig[normalizedStatus]

  if (!config) return 'gray'

  if (config.className.includes('green')) return 'green'
  if (config.className.includes('blue')) return 'blue'
  if (config.className.includes('yellow')) return 'yellow'
  if (config.className.includes('red')) return 'red'
  if (config.className.includes('orange')) return 'orange'
  if (config.className.includes('emerald')) return 'emerald'

  return 'gray'
}
