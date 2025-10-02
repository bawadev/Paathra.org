'use client'

/**
 * Enhanced Dana Design System - Navigation Item Component
 * Base component for all navigation items with consistent styling and cultural theming
 */

import React, { forwardRef } from 'react'
import { Link } from '@/src/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/design-system/theme/theme-provider'
import { LucideIcon } from 'lucide-react'

export interface NavigationItemProps {
  /** Content to render inside the navigation item */
  children: React.ReactNode
  /** Optional href for link items */
  href?: string
  /** Optional icon to display */
  icon?: LucideIcon
  /** Visual variant of the navigation item */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the item is currently active/selected */
  active?: boolean
  /** Whether the item is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler for non-link items */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  /** ARIA label for accessibility */
  'aria-label'?: string
  /** Additional ARIA attributes */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
}

/**
 * Base navigation item component with Dana Design System styling
 */
export const NavigationItem = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  NavigationItemProps
>(({
  children,
  href,
  icon: Icon,
  variant = 'default',
  size = 'md',
  active = false,
  disabled = false,
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  ...props
}, ref) => {
  const { cultural, culturalClasses } = useTheme()

  // Base styles following Dana Design System
  const baseStyles = cn(
    // Core layout and interaction
    'inline-flex items-center justify-center gap-2',
    'relative transition-all duration-300 ease-out',
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-primary',

    // Typography - Cultural theme aware
    culturalClasses,
    'font-medium antialiased',
    {
      'text-sm leading-relaxed': size === 'sm',
      'text-base leading-relaxed': size === 'md',
      'text-lg leading-relaxed': size === 'lg',
    },

    // Cultural typography adjustments
    {
      'tracking-wide': cultural === 'sinhala',
      'tracking-normal': cultural === 'english' || cultural === 'universal',
    },

    // Spacing
    {
      'px-2 py-1.5 rounded-md': size === 'sm',
      'px-3 py-2 rounded-lg': size === 'md',
      'px-4 py-3 rounded-xl': size === 'lg',
    },

    // Disabled state
    {
      'opacity-50 cursor-not-allowed pointer-events-none': disabled,
    }
  )

  // Variant-specific styles
  const variantStyles = cn({
    // Default variant
    'text-foreground/80 hover:text-foreground hover:bg-accent/50':
      variant === 'default' && !active,
    'text-foreground bg-accent/30 shadow-sm':
      variant === 'default' && active,

    // Primary variant (for main actions)
    'text-primary-foreground bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg':
      variant === 'primary' && !active,
    'text-primary-foreground bg-primary/90 shadow-lg':
      variant === 'primary' && active,

    // Secondary variant
    'text-secondary-foreground bg-secondary hover:bg-secondary/90':
      variant === 'secondary' && !active,
    'text-secondary-foreground bg-secondary/90':
      variant === 'secondary' && active,

    // Ghost variant (minimal styling)
    'text-foreground/70 hover:text-foreground hover:bg-accent/30':
      variant === 'ghost' && !active,
    'text-foreground bg-accent/20':
      variant === 'ghost' && active,

    // Outline variant
    'text-foreground border border-border hover:bg-accent/30 hover:border-accent':
      variant === 'outline' && !active,
    'text-foreground border border-accent bg-accent/10':
      variant === 'outline' && active,
  })

  // Hover and interaction effects
  const interactionStyles = cn(
    'hover:scale-[1.02] active:scale-[0.98]',
    'hover:shadow-soft hover:-translate-y-0.5',
    {
      'transform-gpu': !disabled,
    }
  )

  const combinedClassName = cn(
    baseStyles,
    variantStyles,
    interactionStyles,
    className
  )

  // Content with optional icon
  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            'flex-shrink-0',
            {
              'w-3 h-3': size === 'sm',
              'w-4 h-4': size === 'md',
              'w-5 h-5': size === 'lg',
            }
          )}
          aria-hidden="true"
        />
      )}
      <span className="flex-1">{children}</span>
    </>
  )

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClassName}
        aria-label={ariaLabel}
        aria-current={active ? ariaCurrent || 'page' : undefined}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        {...props}
      >
        {content}
      </Link>
    )
  }

  // Otherwise render as button
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={combinedClassName}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? ariaCurrent || 'page' : undefined}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {content}
    </button>
  )
})

NavigationItem.displayName = 'NavigationItem'