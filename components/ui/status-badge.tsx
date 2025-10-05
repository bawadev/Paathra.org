import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Truck,
  Shield,
  Building,
  Heart,
  LucideIcon
} from 'lucide-react'
import {
  getBookingStatusColor,
  getMonasteryStatusColor,
  getUserRoleColor,
  type BookingStatus,
  type MonasteryStatus,
  type UserRole
} from '@/lib/design-system/tokens/colors'
import { cn } from '@/lib/utils'

/**
 * Status Badge Component
 *
 * Reusable badge component with icons for booking, monastery, and user role statuses.
 * Uses the centralized color system from the design system.
 *
 * @example
 * <StatusBadge type="booking" status="confirmed" />
 * <StatusBadge type="monastery" status="approved" />
 * <StatusBadge type="user_role" status="donor" showIcon={false} />
 */

// Icon mapping for booking statuses
const bookingStatusIcons: Record<BookingStatus, LucideIcon> = {
  delivered: Truck,
  confirmed: CheckCircle,
  monastery_approved: Clock,
  pending: Clock,
  cancelled: Ban,
  not_delivered: XCircle,
}

// Icon mapping for monastery statuses
const monasteryStatusIcons: Record<MonasteryStatus, LucideIcon> = {
  approved: CheckCircle,
  pending: Clock,
  rejected: XCircle,
}

// Icon mapping for user roles
const userRoleIcons: Record<UserRole, LucideIcon> = {
  super_admin: Shield,
  monastery_admin: Building,
  donor: Heart,
}

// Display labels for booking statuses
const bookingStatusLabels: Record<BookingStatus, string> = {
  delivered: 'Delivered',
  confirmed: 'Confirmed',
  monastery_approved: 'Monastery Approved',
  pending: 'Pending',
  cancelled: 'Cancelled',
  not_delivered: 'Not Delivered',
}

// Display labels for monastery statuses
const monasteryStatusLabels: Record<MonasteryStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
}

// Display labels for user roles
const userRoleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  monastery_admin: 'Monastery Admin',
  donor: 'Donor',
}

type StatusBadgeProps = {
  className?: string
  showIcon?: boolean
  showLabel?: boolean
} & (
  | { type: 'booking'; status: BookingStatus }
  | { type: 'monastery'; status: MonasteryStatus }
  | { type: 'user_role'; status: UserRole }
)

export function StatusBadge({
  className,
  showIcon = true,
  showLabel = true,
  ...props
}: StatusBadgeProps) {
  // Get the appropriate icon, label, and color based on type
  const { Icon, label, colorClasses } = React.useMemo(() => {
    if (props.type === 'booking') {
      const status = props.status as BookingStatus
      return {
        Icon: bookingStatusIcons[status],
        label: bookingStatusLabels[status],
        colorClasses: getBookingStatusColor(status).badge,
      }
    } else if (props.type === 'monastery') {
      const status = props.status as MonasteryStatus
      return {
        Icon: monasteryStatusIcons[status],
        label: monasteryStatusLabels[status],
        colorClasses: getMonasteryStatusColor(status).badge,
      }
    } else {
      const status = props.status as UserRole
      return {
        Icon: userRoleIcons[status],
        label: userRoleLabels[status],
        colorClasses: getUserRoleColor(status).badge,
      }
    }
  }, [props])

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 border font-medium',
        colorClasses,
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3.5 w-3.5" />}
      {showLabel && <span>{label}</span>}
    </Badge>
  )
}
