import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Page Container Component
 *
 * Wrapper component for consistent page layout with responsive padding,
 * max-width constraints, and cultural spacing adjustments.
 *
 * @example
 * <PageContainer variant="default">
 *   <PageHeader title="Donations" />
 *   {children}
 * </PageContainer>
 */

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width variant for the container
   */
  variant?: "default" | "wide" | "narrow" | "full"
  /**
   * Padding variant
   */
  padding?: "none" | "sm" | "md" | "lg"
  /**
   * Cultural variant for spacing adjustments
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Whether to center the container
   */
  centered?: boolean
  /**
   * Whether to add vertical spacing
   */
  verticalSpacing?: boolean
  /**
   * Background variant
   */
  background?: "default" | "muted" | "card"
  /**
   * Optional ref for the container
   */
  as?: "div" | "main" | "section" | "article"
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      cultural,
      centered = false,
      verticalSpacing = true,
      background = "default",
      as: Component = "div",
      children,
      ...props
    },
    ref
  ) => {
    // Max-width variants
    const widthClasses = {
      full: "w-full",
      narrow: "w-full max-w-3xl",
      default: "w-full max-w-7xl",
      wide: "w-full max-w-[1920px]",
    }

    // Padding variants
    const paddingClasses = {
      none: "",
      sm: cn(
        "px-4 sm:px-6",
        cultural === "sinhala" && "px-5 sm:px-7"
      ),
      md: cn(
        "px-4 sm:px-6 lg:px-8",
        cultural === "sinhala" && "px-5 sm:px-7 lg:px-10"
      ),
      lg: cn(
        "px-6 sm:px-8 lg:px-12",
        cultural === "sinhala" && "px-7 sm:px-10 lg:px-14"
      ),
    }

    // Vertical spacing
    const verticalSpacingClasses = verticalSpacing
      ? cn(
          "py-6 sm:py-8 lg:py-10",
          cultural === "sinhala" && "py-7 sm:py-10 lg:py-12"
        )
      : ""

    // Background variants
    const backgroundClasses = {
      default: "",
      muted: "bg-muted/50",
      card: "bg-card border border-border rounded-lg",
    }

    const containerClasses = cn(
      widthClasses[variant],
      paddingClasses[padding],
      verticalSpacingClasses,
      backgroundClasses[background],
      centered && "mx-auto",
      className
    )

    return (
      <Component ref={ref} className={containerClasses} {...props}>
        {children}
      </Component>
    )
  }
)

PageContainer.displayName = "PageContainer"

/**
 * Page Content Section
 * Inner content wrapper for page sections with consistent spacing
 */
interface PageContentSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spacing between elements
   */
  spacing?: "none" | "sm" | "md" | "lg"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Optional title for the section
   */
  title?: string
  /**
   * Optional description
   */
  description?: string
}

const PageContentSection = React.forwardRef<
  HTMLDivElement,
  PageContentSectionProps
>(
  (
    {
      className,
      spacing = "md",
      cultural,
      title,
      description,
      children,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      none: "",
      sm: cn("space-y-3", cultural === "sinhala" && "space-y-4"),
      md: cn("space-y-4", cultural === "sinhala" && "space-y-5"),
      lg: cn("space-y-6", cultural === "sinhala" && "space-y-7"),
    }

    return (
      <section
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h2
                className={cn(
                  "text-lg font-semibold text-foreground",
                  cultural === "sinhala" && "text-xl"
                )}
              >
                {title}
              </h2>
            )}
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
        )}
        {children}
      </section>
    )
  }
)

PageContentSection.displayName = "PageContentSection"

/**
 * Page Grid Layout
 * Grid layout for page content with responsive columns
 */
interface PageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (responsive)
   */
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  /**
   * Gap between grid items
   */
  gap?: "none" | "sm" | "md" | "lg"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
}

const PageGrid = React.forwardRef<HTMLDivElement, PageGridProps>(
  ({ className, cols = 1, gap = "md", cultural, children, ...props }, ref) => {
    const colsClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-4 md:grid-cols-6 lg:grid-cols-12",
    }

    const gapClasses = {
      none: "gap-0",
      sm: cn("gap-3", cultural === "sinhala" && "gap-4"),
      md: cn("gap-4", cultural === "sinhala" && "gap-5"),
      lg: cn("gap-6", cultural === "sinhala" && "gap-7"),
    }

    return (
      <div
        ref={ref}
        className={cn("grid", colsClasses[cols], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PageGrid.displayName = "PageGrid"

/**
 * Page Stack Layout
 * Vertical stack layout with consistent spacing
 */
interface PageStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spacing between stack items
   */
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Alignment of items
   */
  align?: "start" | "center" | "end" | "stretch"
}

const PageStack = React.forwardRef<HTMLDivElement, PageStackProps>(
  (
    {
      className,
      spacing = "md",
      cultural,
      align = "stretch",
      children,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      none: "space-y-0",
      sm: cn("space-y-2", cultural === "sinhala" && "space-y-3"),
      md: cn("space-y-4", cultural === "sinhala" && "space-y-5"),
      lg: cn("space-y-6", cultural === "sinhala" && "space-y-7"),
      xl: cn("space-y-8", cultural === "sinhala" && "space-y-10"),
    }

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          spacingClasses[spacing],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PageStack.displayName = "PageStack"

/**
 * Page Divider
 * Visual separator for page sections
 */
interface PageDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * Spacing around the divider
   */
  spacing?: "none" | "sm" | "md" | "lg"
  /**
   * Cultural variant
   */
  cultural?: "sinhala" | "english" | "universal"
  /**
   * Optional label for the divider
   */
  label?: string
}

const PageDivider = React.forwardRef<HTMLHRElement, PageDividerProps>(
  ({ className, spacing = "md", cultural, label, ...props }, ref) => {
    const spacingClasses = {
      none: "my-0",
      sm: cn("my-4", cultural === "sinhala" && "my-5"),
      md: cn("my-6", cultural === "sinhala" && "my-7"),
      lg: cn("my-8", cultural === "sinhala" && "my-10"),
    }

    if (label) {
      return (
        <div
          className={cn(
            "relative flex items-center",
            spacingClasses[spacing],
            className
          )}
        >
          <div className="flex-grow border-t border-border" />
          <span className="px-3 text-sm text-muted-foreground bg-background">
            {label}
          </span>
          <div className="flex-grow border-t border-border" />
        </div>
      )
    }

    return (
      <hr
        ref={ref}
        className={cn("border-border", spacingClasses[spacing], className)}
        {...props}
      />
    )
  }
)

PageDivider.displayName = "PageDivider"

export {
  PageContainer,
  PageContentSection,
  PageGrid,
  PageStack,
  PageDivider,
}
