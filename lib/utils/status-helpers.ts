/**
 * Status Helper Utilities
 * Utilities for mapping donation booking statuses to colors, labels, and badges
 */

import { colorTokens } from '@/lib/design-system/tokens/colors'

// Donation booking status type
export type DonationStatus =
  | 'pending'
  | 'monastery_approved'
  | 'confirmed'
  | 'delivered'
  | 'not_delivered'
  | 'cancelled'

// Status configuration mapping
export const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'accent',
    bgColor: 'bg-accent-100',
    textColor: 'text-accent-800',
    borderColor: 'border-accent-200',
    hoverBgColor: 'hover:bg-accent-200',
    icon: 'Clock',
    variant: 'pending' as const,
    oklchColor: colorTokens.accent[500],
  },
  monastery_approved: {
    label: 'Monastery Approved',
    color: 'trust',
    bgColor: 'bg-trust-100',
    textColor: 'text-trust-800',
    borderColor: 'border-trust-200',
    hoverBgColor: 'hover:bg-trust-200',
    icon: 'CheckCircle',
    variant: 'approved' as const,
    oklchColor: colorTokens.trust[500],
  },
  confirmed: {
    label: 'Confirmed',
    color: 'compassion',
    bgColor: 'bg-compassion-100',
    textColor: 'text-compassion-800',
    borderColor: 'border-compassion-200',
    hoverBgColor: 'hover:bg-compassion-200',
    icon: 'CheckCircle2',
    variant: 'confirmed' as const,
    oklchColor: colorTokens.compassion[500],
  },
  delivered: {
    label: 'Delivered',
    color: 'compassion',
    bgColor: 'bg-compassion-500',
    textColor: 'text-white',
    borderColor: 'border-compassion-300',
    hoverBgColor: 'hover:bg-compassion-600',
    icon: 'Package',
    variant: 'delivered' as const,
    oklchColor: colorTokens.compassion[500],
  },
  not_delivered: {
    label: 'Not Delivered',
    color: 'destructive',
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
    borderColor: 'border-destructive',
    hoverBgColor: 'hover:bg-destructive/20',
    icon: 'XCircle',
    variant: 'notDelivered' as const,
    oklchColor: colorTokens.semantic.error,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'neutral',
    bgColor: 'bg-neutral-200',
    textColor: 'text-neutral-700',
    borderColor: 'border-neutral-300',
    hoverBgColor: 'hover:bg-neutral-300',
    icon: 'Ban',
    variant: 'cancelled' as const,
    oklchColor: colorTokens.neutral[500],
  },
} as const

// Get status color (Tailwind class)
export function getStatusColor(status: DonationStatus): string {
  return statusConfig[status]?.color || 'neutral'
}

// Get status background color (Tailwind class)
export function getStatusBgColor(status: DonationStatus): string {
  return statusConfig[status]?.bgColor || 'bg-neutral-100'
}

// Get status text color (Tailwind class)
export function getStatusTextColor(status: DonationStatus): string {
  return statusConfig[status]?.textColor || 'text-neutral-700'
}

// Get status border color (Tailwind class)
export function getStatusBorderColor(status: DonationStatus): string {
  return statusConfig[status]?.borderColor || 'border-neutral-200'
}

// Get status hover background color (Tailwind class)
export function getStatusHoverBgColor(status: DonationStatus): string {
  return statusConfig[status]?.hoverBgColor || 'hover:bg-neutral-200'
}

// Get status label (human-readable)
export function getStatusLabel(status: DonationStatus): string {
  return statusConfig[status]?.label || status
}

// Get status icon name
export function getStatusIcon(status: DonationStatus): string {
  return statusConfig[status]?.icon || 'Circle'
}

// Get status badge variant
export function getStatusBadgeVariant(status: DonationStatus): typeof statusConfig[DonationStatus]['variant'] {
  return statusConfig[status]?.variant || 'pending'
}

// Get status OKLCH color value
export function getStatusOklchColor(status: DonationStatus): string {
  return statusConfig[status]?.oklchColor || colorTokens.neutral[500]
}

// Get full status configuration
export function getStatusConfig(status: DonationStatus) {
  return statusConfig[status] || statusConfig.pending
}

// Check if status is positive/successful
export function isPositiveStatus(status: DonationStatus): boolean {
  return ['monastery_approved', 'confirmed', 'delivered'].includes(status)
}

// Check if status is negative/failed
export function isNegativeStatus(status: DonationStatus): boolean {
  return ['not_delivered', 'cancelled'].includes(status)
}

// Check if status is pending/in-progress
export function isPendingStatus(status: DonationStatus): boolean {
  return status === 'pending'
}

// Check if status is final (no further changes expected)
export function isFinalStatus(status: DonationStatus): boolean {
  return ['delivered', 'not_delivered', 'cancelled'].includes(status)
}

// Get status progress percentage (for progress bars)
export function getStatusProgress(status: DonationStatus): number {
  const progressMap: Record<DonationStatus, number> = {
    pending: 20,
    monastery_approved: 40,
    confirmed: 60,
    delivered: 100,
    not_delivered: 0,
    cancelled: 0,
  }
  return progressMap[status] || 0
}

// Get next possible statuses (for workflow)
export function getNextStatuses(status: DonationStatus): DonationStatus[] {
  const workflowMap: Record<DonationStatus, DonationStatus[]> = {
    pending: ['monastery_approved', 'cancelled'],
    monastery_approved: ['confirmed', 'cancelled'],
    confirmed: ['delivered', 'not_delivered', 'cancelled'],
    delivered: [],
    not_delivered: [],
    cancelled: [],
  }
  return workflowMap[status] || []
}

// Status transition validation
export function canTransitionTo(currentStatus: DonationStatus, targetStatus: DonationStatus): boolean {
  const allowedTransitions = getNextStatuses(currentStatus)
  return allowedTransitions.includes(targetStatus)
}

// Get status timeline order
export function getStatusOrder(status: DonationStatus): number {
  const orderMap: Record<DonationStatus, number> = {
    pending: 1,
    monastery_approved: 2,
    confirmed: 3,
    delivered: 4,
    not_delivered: 5,
    cancelled: 6,
  }
  return orderMap[status] || 0
}

// Compare statuses by timeline order
export function compareStatuses(status1: DonationStatus, status2: DonationStatus): number {
  return getStatusOrder(status1) - getStatusOrder(status2)
}

// Sort statuses by timeline order
export function sortStatuses(statuses: DonationStatus[]): DonationStatus[] {
  return [...statuses].sort(compareStatuses)
}

// Localized status labels (can be expanded with i18n)
export const statusLabels = {
  en: {
    pending: 'Pending Approval',
    monastery_approved: 'Monastery Approved',
    confirmed: 'Confirmed',
    delivered: 'Successfully Delivered',
    not_delivered: 'Not Delivered',
    cancelled: 'Cancelled',
  },
  si: {
    pending: 'අනුමැතිය බලාපොරොත්තුවෙන්',
    monastery_approved: 'විහාරස්ථානයෙන් අනුමත',
    confirmed: 'තහවුරු කළ',
    delivered: 'සාර්ථකව බෙදා හරින ලදී',
    not_delivered: 'බෙදා හරින ලද නැත',
    cancelled: 'අවලංගු කරන ලදී',
  },
} as const

// Get localized status label
export function getLocalizedStatusLabel(
  status: DonationStatus,
  locale: 'en' | 'si' = 'en'
): string {
  return statusLabels[locale]?.[status] || statusLabels.en[status]
}

// Status descriptions for tooltips/help text
export const statusDescriptions = {
  pending: 'Your donation request is awaiting monastery approval.',
  monastery_approved: 'The monastery has approved your donation request.',
  confirmed: 'Your donation has been confirmed and is scheduled for delivery.',
  delivered: 'Your donation has been successfully delivered to the monastery.',
  not_delivered: 'The donation could not be delivered. Please contact the monastery.',
  cancelled: 'This donation booking has been cancelled.',
} as const

// Get status description
export function getStatusDescription(status: DonationStatus): string {
  return statusDescriptions[status] || ''
}

// Type guard for DonationStatus
export function isDonationStatus(value: string): value is DonationStatus {
  return Object.keys(statusConfig).includes(value)
}

// Parse status from string with fallback
export function parseStatus(value: string | null | undefined): DonationStatus {
  if (!value || !isDonationStatus(value)) {
    return 'pending'
  }
  return value
}
