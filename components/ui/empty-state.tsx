import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Empty State Component
 *
 * Displays a centered empty state with an icon, message, description, and optional action.
 * Uses design system typography and follows cultural spacing conventions.
 *
 * @example
 * <EmptyState
 *   icon={Inbox}
 *   message="No donations yet"
 *   description="Start by creating your first donation booking"
 *   action={{
 *     label: "Create Donation",
 *     onClick: () => router.push('/donate')
 *   }}
 * />
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon component (Lucide icon)
   */
  icon?: LucideIcon
  /**
   * Primary message/heading
   */
  message: string
  /**
   * Optional description text
   */
  description?: string
  /**
   * Optional action button
   */
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
    icon?: LucideIcon
  }
  /**
   * Size variant for the empty state
   */
  size?: "sm" | "md" | "lg"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Additional actions (secondary buttons)
   */
  secondaryActions?: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
  }>
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon: Icon,
      message,
      description,
      action,
      secondaryActions,
      size = "md",
      cultural,
      ...props
    },
    ref
  ) => {
    const iconClasses = cn(
      "mx-auto text-muted-foreground/40",
      size === "sm" && "h-12 w-12",
      size === "md" && "h-16 w-16",
      size === "lg" && "h-20 w-20"
    )

    const containerClasses = cn(
      "flex flex-col items-center justify-center text-center",
      size === "sm" && "space-y-3 py-8",
      size === "md" && "space-y-4 py-12",
      size === "lg" && "space-y-6 py-16",
      cultural === "sinhala" && "space-y-5",
      className
    )

    const messageClasses = cn(
      "font-semibold text-foreground",
      size === "sm" && "text-base",
      size === "md" && "text-lg",
      size === "lg" && "text-xl",
      cultural === "sinhala" && "text-xl"
    )

    const descriptionClasses = cn(
      "text-muted-foreground max-w-md mx-auto",
      size === "sm" && "text-sm",
      size === "md" && "text-base",
      size === "lg" && "text-lg",
      cultural === "sinhala" && "text-base leading-relaxed"
    )

    const ActionIcon = action?.icon

    return (
      <div
        ref={ref}
        className={containerClasses}
        role="status"
        aria-live="polite"
        {...props}
      >
        {Icon && (
          <div
            className={cn(
              "rounded-full bg-muted/50 p-4",
              size === "sm" && "p-3",
              size === "lg" && "p-5"
            )}
            aria-hidden="true"
          >
            <Icon className={iconClasses} />
          </div>
        )}

        <div className="space-y-2">
          <h3 className={messageClasses}>{message}</h3>
          {description && (
            <p className={descriptionClasses}>{description}</p>
          )}
        </div>

        {(action || secondaryActions) && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {action && (
              <Button
                variant={action.variant || "default"}
                onClick={action.onClick}
                size={size === "lg" ? "lg" : "default"}
                leftIcon={ActionIcon ? <ActionIcon className="h-4 w-4" /> : undefined}
              >
                {action.label}
              </Button>
            )}

            {secondaryActions?.map((secondaryAction, index) => (
              <Button
                key={index}
                variant={secondaryAction.variant || "outline"}
                onClick={secondaryAction.onClick}
                size={size === "lg" ? "lg" : "default"}
              >
                {secondaryAction.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

/**
 * Empty State Card Variant
 * Wraps the empty state in a card for better visual containment
 */
interface EmptyStateCardProps extends EmptyStateProps {
  /**
   * Whether to show a border
   */
  bordered?: boolean
}

const EmptyStateCard = React.forwardRef<HTMLDivElement, EmptyStateCardProps>(
  ({ className, bordered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg bg-card",
          bordered && "border border-border",
          className
        )}
      >
        <EmptyState {...props} />
      </div>
    )
  }
)

EmptyStateCard.displayName = "EmptyStateCard"

/**
 * Empty State Inline Variant
 * Compact inline version for smaller spaces (e.g., within tables, lists)
 */
interface EmptyStateInlineProps
  extends Omit<EmptyStateProps, "size" | "icon" | "secondaryActions"> {
  /**
   * Optional small icon
   */
  icon?: LucideIcon
}

const EmptyStateInline = React.forwardRef<
  HTMLDivElement,
  EmptyStateInlineProps
>(({ className, icon: Icon, message, description, action, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4 py-6 text-center",
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {Icon && (
        <Icon className="h-8 w-8 text-muted-foreground/40 shrink-0" aria-hidden="true" />
      )}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
})

EmptyStateInline.displayName = "EmptyStateInline"

export { EmptyState, EmptyStateCard, EmptyStateInline }
