import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

/**
 * Page Header Component
 *
 * Consistent page header with title, description, actions, and breadcrumbs.
 * Responsive layout with cultural spacing adjustments.
 *
 * @example
 * <PageHeader
 *   title="Donations"
 *   description="Manage your donation bookings"
 *   breadcrumbs={[
 *     { label: "Home", href: "/" },
 *     { label: "Donations" }
 *   ]}
 *   actions={<Button>Create Donation</Button>}
 * />
 */

export interface BreadcrumbItem {
  /**
   * Breadcrumb label
   */
  label: string
  /**
   * Optional href (if not provided, renders as plain text)
   */
  href?: string
  /**
   * Optional icon
   */
  icon?: React.ReactNode
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Page title
   */
  title: string
  /**
   * Optional description
   */
  description?: string
  /**
   * Optional breadcrumbs
   */
  breadcrumbs?: BreadcrumbItem[]
  /**
   * Optional action buttons (rendered on the right)
   */
  actions?: React.ReactNode
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Whether to show a bottom border
   */
  bordered?: boolean
  /**
   * Optional back button
   */
  backButton?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      title,
      description,
      breadcrumbs,
      actions,
      size = "md",
      cultural,
      bordered = false,
      backButton,
      ...props
    },
    ref
  ) => {
    const containerClasses = cn(
      "space-y-4",
      size === "sm" && "pb-4",
      size === "md" && "pb-6",
      size === "lg" && "pb-8",
      cultural === "sinhala" && "pb-8",
      bordered && "border-b border-border",
      className
    )

    const titleClasses = cn(
      "font-bold tracking-tight text-foreground",
      size === "sm" && "text-xl sm:text-2xl",
      size === "md" && "text-2xl sm:text-3xl",
      size === "lg" && "text-3xl sm:text-4xl",
      cultural === "sinhala" && "text-2xl sm:text-3xl"
    )

    const descriptionClasses = cn(
      "text-muted-foreground max-w-3xl",
      size === "sm" && "text-sm",
      size === "md" && "text-base",
      size === "lg" && "text-lg",
      cultural === "sinhala" && "text-base leading-relaxed"
    )

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      {item.icon && (
                        <span className="shrink-0">{item.icon}</span>
                      )}
                      {item.label}
                    </a>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 font-medium text-foreground"
                      aria-current="page"
                    >
                      {item.icon && (
                        <span className="shrink-0">{item.icon}</span>
                      )}
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back Button */}
        {backButton && (
          <button
            onClick={backButton.onClick}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {backButton.icon || (
              <ChevronRight className="h-4 w-4 rotate-180" />
            )}
            {backButton.label}
          </button>
        )}

        {/* Title and Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className={titleClasses}>{title}</h1>
            {description && <p className={descriptionClasses}>{description}</p>}
          </div>

          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </div>
    )
  }
)

PageHeader.displayName = "PageHeader"

/**
 * Page Header Compact Variant
 * Simplified version without breadcrumbs and with less spacing
 */
interface PageHeaderCompactProps
  extends Omit<PageHeaderProps, "breadcrumbs" | "size" | "backButton"> {
  /**
   * Optional icon before the title
   */
  icon?: React.ReactNode
}

const PageHeaderCompact = React.forwardRef<
  HTMLDivElement,
  PageHeaderCompactProps
>(
  (
    { className, title, description, icon, actions, cultural, bordered, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between",
          cultural === "sinhala" && "gap-4 pb-5",
          bordered && "border-b border-border",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div
              className="shrink-0 text-muted-foreground"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <h1
              className={cn(
                "text-xl font-semibold tracking-tight text-foreground truncate",
                cultural === "sinhala" && "text-2xl"
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  cultural === "sinhala" && "text-base leading-relaxed"
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    )
  }
)

PageHeaderCompact.displayName = "PageHeaderCompact"

/**
 * Page Header Section
 * Sub-section header within a page
 */
interface PageHeaderSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Section title
   */
  title: string
  /**
   * Optional description
   */
  description?: string
  /**
   * Optional action buttons
   */
  actions?: React.ReactNode
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
}

const PageHeaderSection = React.forwardRef<
  HTMLDivElement,
  PageHeaderSectionProps
>(({ className, title, description, actions, cultural, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        cultural === "sinhala" && "gap-3",
        className
      )}
      {...props}
    >
      <div className="space-y-1 flex-1 min-w-0">
        <h2
          className={cn(
            "text-lg font-semibold text-foreground",
            cultural === "sinhala" && "text-xl"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              cultural === "sinhala" && "text-base leading-relaxed"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
})

PageHeaderSection.displayName = "PageHeaderSection"

export { PageHeader, PageHeaderCompact, PageHeaderSection }
