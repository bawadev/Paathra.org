import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

/**
 * Stat Card Component
 *
 * Dashboard stat cards with support for icons, trends, and cultural variants.
 * Uses the design system Card component as base.
 *
 * @example
 * <StatCard
 *   title="Total Donations"
 *   value="127"
 *   description="This month"
 *   icon={DollarSign}
 *   trend={{ value: 12, direction: "up" }}
 * />
 */

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The stat title
   */
  title: string
  /**
   * The stat value (number or string)
   */
  value: string | number
  /**
   * Optional description or context
   */
  description?: string
  /**
   * Optional icon component (Lucide icon)
   */
  icon?: LucideIcon
  /**
   * Optional trend information
   */
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
    label?: string
  }
  /**
   * Gradient variant for the card
   */
  gradient?: "default" | "primary" | "success" | "warning" | "error" | "trust" | "spiritual"
  /**
   * Card size variant
   */
  size?: "sm" | "md" | "lg"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Whether to show loading state
   */
  isLoading?: boolean
}

/**
 * Get gradient classes based on variant
 */
function getGradientClasses(gradient?: StatCardProps['gradient']): string {
  switch (gradient) {
    case "primary":
      return "bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800"
    case "success":
      return "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
    case "warning":
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800"
    case "error":
      return "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800"
    case "trust":
      return "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
    case "spiritual":
      return "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
    default:
      return ""
  }
}

/**
 * Get icon color classes based on gradient
 */
function getIconColorClasses(gradient?: StatCardProps['gradient']): string {
  switch (gradient) {
    case "primary":
      return "text-primary-600 dark:text-primary-400"
    case "success":
      return "text-green-600 dark:text-green-400"
    case "warning":
      return "text-yellow-600 dark:text-yellow-400"
    case "error":
      return "text-red-600 dark:text-red-400"
    case "trust":
      return "text-blue-600 dark:text-blue-400"
    case "spiritual":
      return "text-purple-600 dark:text-purple-400"
    default:
      return "text-muted-foreground"
  }
}

/**
 * Get trend color classes
 */
function getTrendColorClasses(direction: "up" | "down" | "neutral"): string {
  switch (direction) {
    case "up":
      return "text-green-600 dark:text-green-400"
    case "down":
      return "text-red-600 dark:text-red-400"
    case "neutral":
      return "text-muted-foreground"
  }
}

/**
 * Skeleton loader for stat card
 */
function StatCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
    </div>
  )
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      title,
      value,
      description,
      icon: Icon,
      trend,
      gradient,
      size = "md",
      cultural,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const cardClasses = cn(
      "transition-all duration-200 hover:shadow-md",
      gradient && getGradientClasses(gradient),
      className
    )

    const iconClasses = cn(
      "shrink-0",
      size === "sm" && "h-8 w-8",
      size === "md" && "h-10 w-10",
      size === "lg" && "h-12 w-12",
      getIconColorClasses(gradient)
    )

    const valueClasses = cn(
      "font-bold tracking-tight",
      size === "sm" && "text-2xl",
      size === "md" && "text-3xl",
      size === "lg" && "text-4xl"
    )

    return (
      <Card
        ref={ref}
        className={cardClasses}
        cultural={cultural}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && (
            <Icon className={iconClasses} aria-hidden="true" />
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <div className="space-y-1">
              <div className={valueClasses}>{value}</div>
              {(description || trend) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {trend && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        getTrendColorClasses(trend.direction)
                      )}
                    >
                      {trend.direction === "up" && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      )}
                      {trend.direction === "down" && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                          />
                        </svg>
                      )}
                      {trend.value > 0 && "+"}
                      {trend.value}%{trend.label && ` ${trend.label}`}
                    </span>
                  )}
                  {description && <span>{description}</span>}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = "StatCard"

export { StatCard }
