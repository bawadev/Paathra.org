import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Status Badge Component
 *
 * Auto-maps booking statuses to appropriate colors and styles.
 * Supports different sizes and cultural variants.
 *
 * @example
 * <StatusBadge status="confirmed" />
 * <StatusBadge status="pending" size="lg" />
 * <StatusBadge status="cancelled" variant="outline" />
 */

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-colors",
  {
    variants: {
      status: {
        // Booking statuses
        pending: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmed: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        monastery_approved: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        delivered: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        not_delivered: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        cancelled: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        completed: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",

        // Generic statuses
        active: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        inactive: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        draft: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        published: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        archived: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",

        // Success/Error states
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        error: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",

        // Custom neutral
        default: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      variant: {
        solid: "",
        outline: "bg-transparent border-current",
        subtle: "",
      },
    },
    defaultVariants: {
      status: "default",
      size: "md",
      variant: "solid",
    },
    compoundVariants: [
      // Outline variants
      {
        status: "pending",
        variant: "outline",
        className: "bg-transparent border-yellow-600 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400",
      },
      {
        status: "confirmed",
        variant: "outline",
        className: "bg-transparent border-green-600 text-green-700 dark:border-green-500 dark:text-green-400",
      },
      {
        status: "cancelled",
        variant: "outline",
        className: "bg-transparent border-red-600 text-red-700 dark:border-red-500 dark:text-red-400",
      },
      {
        status: "monastery_approved",
        variant: "outline",
        className: "bg-transparent border-blue-600 text-blue-700 dark:border-blue-500 dark:text-blue-400",
      },
    ],
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof statusBadgeVariants>, 'status'> {
  /**
   * The status to display. Auto-maps to appropriate colors.
   */
  status: string
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode
}

/**
 * Maps a status string to a valid status variant.
 * Handles various status formats and returns appropriate color mapping.
 */
function getStatusVariant(status: string): VariantProps<typeof statusBadgeVariants>['status'] {
  const normalizedStatus = status.toLowerCase().trim()

  // Direct mappings
  const statusMap: Record<string, VariantProps<typeof statusBadgeVariants>['status']> = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'monastery_approved': 'monastery_approved',
    'delivered': 'delivered',
    'not_delivered': 'not_delivered',
    'cancelled': 'cancelled',
    'completed': 'completed',
    'active': 'active',
    'inactive': 'inactive',
    'draft': 'draft',
    'published': 'published',
    'archived': 'archived',
    'success': 'success',
    'warning': 'warning',
    'error': 'error',
    'info': 'info',
  }

  return statusMap[normalizedStatus] || 'default'
}

/**
 * Formats a status string for display.
 * Converts snake_case to Title Case.
 */
function formatStatusText(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size, variant, icon, children, ...props }, ref) => {
    const statusVariant = getStatusVariant(status)
    const displayText = children || formatStatusText(status)

    return (
      <span
        ref={ref}
        data-slot="status-badge"
        data-status={status}
        className={cn(
          statusBadgeVariants({ status: statusVariant, size, variant }),
          className
        )}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {displayText}
      </span>
    )
  }
)

StatusBadge.displayName = "StatusBadge"

export { StatusBadge, statusBadgeVariants, getStatusVariant, formatStatusText }
