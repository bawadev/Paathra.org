'use client'

/**
 * Enhanced Dana Design System - Navigation Trigger Component
 * Consistent trigger button component for navigation dropdowns and collapsible menus
 */

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/design-system/theme/theme-provider'
import { LucideIcon, ChevronDown } from 'lucide-react'

export interface NavigationTriggerProps {
  /** Content to render inside the trigger */
  children: React.ReactNode
  /** Optional icon to display before the label */
  icon?: LucideIcon
  /** Whether to show the chevron indicator */
  showChevron?: boolean
  /** Visual variant of the trigger */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the trigger is currently active/pressed */
  active?: boolean
  /** Whether the trigger is expanded (affects chevron rotation) */
  expanded?: boolean
  /** Whether the trigger is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Mouse enter handler */
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Mouse leave handler */
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void
  /** ARIA label for accessibility */
  'aria-label'?: string
  /** ARIA expanded state */
  'aria-expanded'?: boolean
  /** ARIA haspopup attribute */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  /** Additional ARIA attributes */
  'aria-controls'?: string
}

/**
 * Navigation trigger component with Dana Design System styling
 */
export const NavigationTrigger = forwardRef<
  HTMLButtonElement,
  NavigationTriggerProps
>(({
  children,
  icon: Icon,
  showChevron = true,
  variant = 'default',
  size = 'md',
  active = false,
  expanded = false,
  disabled = false,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup = 'menu',
  'aria-controls': ariaControls,
  ...props
}, ref) => {
  const { cultural, culturalClasses } = useTheme()

  // Base styles following Dana Design System
  const baseStyles = cn(
    // Core layout and interaction
    'dana-nav-trigger inline-flex items-center justify-center gap-2',
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

  return (
    <button
      ref={ref}
      type="button"
      className={combinedClassName}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded ?? expanded}
      aria-haspopup={ariaHaspopup}
      aria-controls={ariaControls}
      data-expanded={expanded}
      data-active={active}
      {...props}
    >
      {/* Optional leading icon */}
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

      {/* Main content */}
      <span className="flex-1 text-left">{children}</span>

      {/* Optional chevron indicator */}
      {showChevron && (
        <ChevronDown
          className={cn(
            'flex-shrink-0 transition-transform duration-200',
            {
              'w-3 h-3': size === 'sm',
              'w-4 h-4': size === 'md',
              'w-4 h-4': size === 'lg',
              'rotate-180': expanded,
            }
          )}
          aria-hidden="true"
        />
      )}
    </button>
  )
})

NavigationTrigger.displayName = 'NavigationTrigger'