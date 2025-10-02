'use client'

/**
 * Enhanced Dana Design System - Navigation Dropdown Component
 * Dropdown menu component with consistent styling and cultural theming
 */

import React, { forwardRef } from 'react'
import { Link } from '@/src/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/design-system/theme/theme-provider'
import { LucideIcon, ChevronDown } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export interface NavigationDropdownItem {
  /** Unique identifier for the item */
  id: string
  /** Display text for the item */
  title: string
  /** Optional description text */
  description?: string
  /** Link href */
  href: string
  /** Optional icon */
  icon?: LucideIcon
  /** Whether this item is currently active */
  active?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
}

export interface NavigationDropdownProps {
  /** Label for the dropdown trigger */
  label: string
  /** Array of dropdown items */
  items: NavigationDropdownItem[]
  /** Visual variant of the dropdown */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Width of the dropdown content */
  width?: 'sm' | 'md' | 'lg' | 'xl'
  /** Whether the dropdown is currently open */
  open?: boolean
  /** Callback when dropdown open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional CSS classes for the trigger */
  className?: string
  /** Additional CSS classes for the content */
  contentClassName?: string
  /** ARIA label for accessibility */
  'aria-label'?: string
}

/**
 * Navigation dropdown component with Dana Design System styling
 */
export const NavigationDropdown = forwardRef<
  HTMLButtonElement,
  NavigationDropdownProps
>(({
  label,
  items,
  variant = 'default',
  size = 'md',
  width = 'md',
  open,
  onOpenChange,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const { cultural, culturalClasses } = useTheme()

  // Trigger styles following Dana Design System
  const triggerStyles = cn(
    // Core layout and interaction
    'dana-nav-trigger inline-flex items-center gap-2',
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

    // Variant styles
    {
      'text-foreground/80 hover:text-foreground hover:bg-accent/50': variant === 'default',
      'text-primary-foreground bg-primary hover:bg-primary/90': variant === 'primary',
      'text-secondary-foreground bg-secondary hover:bg-secondary/90': variant === 'secondary',
      'text-foreground/70 hover:text-foreground hover:bg-accent/30': variant === 'ghost',
    },

    // Interaction effects
    'hover:scale-[1.02] active:scale-[0.98]',
    'hover:shadow-soft hover:-translate-y-0.5',
    'transform-gpu',

    className
  )

  // Content container styles
  const contentStyles = cn(
    // Base container
    'dana-nav-dropdown-content',
    'bg-card/95 backdrop-blur-md text-card-foreground',
    'rounded-2xl shadow-elegant-lg border border-border/50',
    'p-6 overflow-hidden',

    // Width variants
    {
      'w-64': width === 'sm',
      'w-80': width === 'md',
      'w-96': width === 'lg',
      'w-[28rem]': width === 'xl',
    },

    // Animation
    'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1',
    'duration-300 ease-out',

    contentClassName
  )

  // Item styles
  const itemBaseStyles = cn(
    'dana-nav-dropdown-item',
    'flex items-start gap-3 p-4 rounded-xl',
    'transition-all duration-200 ease-out group',
    'hover:bg-primary/5 hover:shadow-soft',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-primary',
    'transform-gpu hover:scale-[1.01]'
  )

  return (
    <NavigationMenu>
      <NavigationMenuItem>
        <NavigationMenuTrigger
          ref={ref}
          className={triggerStyles}
          aria-label={ariaLabel || `${label} menu`}
          {...props}
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              'transition-transform duration-200',
              {
                'w-3 h-3': size === 'sm',
                'w-4 h-4': size === 'md',
                'w-4 h-4': size === 'lg',
              }
            )}
            aria-hidden="true"
          />
        </NavigationMenuTrigger>

        <NavigationMenuContent>
          <div className={contentStyles}>
            <div className="grid gap-2">
              {items.map((item) => {
                const ItemIcon = item.icon

                return (
                  <NavigationMenuLink asChild key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        itemBaseStyles,
                        {
                          'opacity-50 cursor-not-allowed pointer-events-none': item.disabled,
                          'bg-primary/10 shadow-sm': item.active,
                        }
                      )}
                      aria-current={item.active ? 'page' : undefined}
                    >
                      {ItemIcon && (
                        <div className="flex-shrink-0">
                          <ItemIcon
                            className={cn(
                              'text-primary group-hover:text-primary/80',
                              'transition-colors duration-200',
                              {
                                'w-4 h-4 mt-0.5': size === 'sm',
                                'w-5 h-5 mt-0.5': size === 'md' || size === 'lg',
                              }
                            )}
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'font-semibold text-foreground',
                            'group-hover:text-foreground/90',
                            'transition-colors duration-200',
                            culturalClasses,
                            {
                              'text-sm': size === 'sm',
                              'text-sm': size === 'md',
                              'text-base': size === 'lg',
                            }
                          )}
                        >
                          {item.title}
                        </div>

                        {item.description && (
                          <div
                            className={cn(
                              'text-muted-foreground mt-1',
                              'group-hover:text-muted-foreground/80',
                              'transition-colors duration-200',
                              culturalClasses,
                              {
                                'text-xs leading-relaxed': size === 'sm',
                                'text-xs leading-relaxed': size === 'md',
                                'text-sm leading-relaxed': size === 'lg',
                              }
                            )}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                )
              })}
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  )
})

NavigationDropdown.displayName = 'NavigationDropdown'