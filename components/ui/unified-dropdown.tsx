'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LucideIcon, User, LogOut } from 'lucide-react'

/**
 * Unified Dropdown Component for Dana Design System
 *
 * This component replaces all inconsistent dropdown implementations with a
 * unified approach that supports cultural theming, accessibility, and
 * consistent styling patterns.
 */

// Types for dropdown configuration
export interface DropdownItem {
  type: 'item' | 'separator' | 'label'
  key: string
  icon?: LucideIcon
  label?: string
  description?: string
  href?: string
  onClick?: (e: React.MouseEvent) => void | Promise<void>
  variant?: 'default' | 'destructive' | 'accent'
  disabled?: boolean
  selected?: boolean
  className?: string
}

export interface DropdownTriggerProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showChevron?: boolean
}

export interface UnifiedDropdownProps {
  items: DropdownItem[]
  trigger: DropdownTriggerProps
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'auto'
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  collisionPadding?: number
  culturalTheme?: 'sinhala' | 'english' | 'auto'
  enableCulturalAdaptation?: boolean
  className?: string
  contentClassName?: string
  onOpenChange?: (open: boolean) => void
  'aria-label'?: string
}

// Width variants following Dana Design System patterns
const widthVariants = {
  sm: 'w-[200px]',
  md: 'w-[300px]',
  lg: 'w-[400px]',
  xl: 'w-[500px]',
  auto: 'min-w-[8rem] max-w-[90vw]',
} as const

// Trigger variants following existing navigation patterns
const triggerVariants = {
  default: 'dana-nav-trigger',
  ghost: 'dana-nav-trigger bg-transparent hover:bg-primary/10',
  outline: 'dana-nav-trigger border border-border/50 hover:border-primary/50',
} as const

// Trigger size variants
const triggerSizeVariants = {
  sm: 'px-3 py-1.5 text-sm font-semibold',
  md: 'px-4 py-2 text-base font-semibold',
  lg: 'px-6 py-3 text-lg font-semibold',
} as const

// Item variant styles following Dana patterns
const itemVariants = {
  default: 'hover:bg-primary/5 hover:shadow-soft text-foreground',
  destructive: 'hover:bg-destructive/5 hover:shadow-soft text-destructive',
  accent: 'hover:bg-accent/5 hover:shadow-soft text-accent-foreground',
} as const

// Cultural spacing adjustments
const culturalSpacing = {
  sinhala: {
    item: 'p-4', // More generous padding for Sinhala text
    description: 'mt-1',
    gap: 'space-y-1',
  },
  english: {
    item: 'p-3', // Standard padding for English text
    description: 'mt-0.5',
    gap: 'space-y-0.5',
  },
} as const

export function UnifiedDropdown({
  items,
  trigger,
  width = 'md',
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  collisionPadding = 8,
  culturalTheme = 'auto',
  enableCulturalAdaptation = true,
  className,
  contentClassName,
  onOpenChange,
  'aria-label': ariaLabel,
}: UnifiedDropdownProps) {
  const locale = useLocale()
  const t = useTranslations('Common')

  // Determine cultural theme
  const effectiveCulturalTheme = React.useMemo(() => {
    if (culturalTheme === 'auto') {
      return locale === 'si' ? 'sinhala' : 'english'
    }
    return culturalTheme
  }, [culturalTheme, locale])

  // Cultural spacing based on locale
  const spacing = enableCulturalAdaptation
    ? culturalSpacing[effectiveCulturalTheme]
    : culturalSpacing.english

  // Render trigger
  const renderTrigger = () => (
    <DropdownMenuTrigger
      className={cn(
        triggerVariants[trigger.variant || 'default'],
        triggerSizeVariants[trigger.size || 'md'],
        'flex items-center gap-2 transition-all duration-300',
        trigger.className
      )}
      aria-label={ariaLabel}
    >
      <span className="flex items-center gap-2">
        {trigger.children}
      </span>
      {trigger.showChevron !== false && (
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      )}
    </DropdownMenuTrigger>
  )

  // Render dropdown item
  const renderItem = (item: DropdownItem, index: number) => {
    if (item.type === 'separator') {
      return <DropdownMenuSeparator key={item.key || index} />
    }

    if (item.type === 'label') {
      return (
        <DropdownMenuLabel
          key={item.key || index}
          className={cn(
            'font-semibold text-muted-foreground',
            enableCulturalAdaptation && effectiveCulturalTheme === 'sinhala' && 'text-base',
            item.className
          )}
        >
          {item.label}
        </DropdownMenuLabel>
      )
    }

    const ItemContent = (
      <div
        className={cn(
          'flex items-center transition-all duration-300 rounded-xl',
          spacing.item,
          itemVariants[item.variant || 'default'],
          item.selected && 'bg-primary/10 text-primary shadow-sm',
          item.disabled && 'opacity-50 cursor-not-allowed',
          item.className
        )}
      >
        {item.icon && (
          <item.icon className="w-5 h-5 flex-shrink-0 mr-3" />
        )}
        <div className="flex-1 min-w-0">
          {item.label && (
            <div className={cn(
              'font-semibold text-foreground',
              enableCulturalAdaptation && effectiveCulturalTheme === 'sinhala' && 'text-base',
              item.selected && 'text-primary'
            )}>
              {item.label}
            </div>
          )}
          {item.description && (
            <div className={cn(
              'text-caption text-muted-foreground',
              spacing.description,
              enableCulturalAdaptation && effectiveCulturalTheme === 'sinhala' && 'text-sm'
            )}>
              {item.description}
            </div>
          )}
        </div>
      </div>
    )

    if (item.href) {
      return (
        <DropdownMenuItem key={item.key || index} asChild disabled={item.disabled}>
          <Link href={item.href} className="block w-full">
            {ItemContent}
          </Link>
        </DropdownMenuItem>
      )
    }

    return (
      <DropdownMenuItem
        key={item.key || index}
        onClick={item.onClick}
        disabled={item.disabled}
        className="p-0"
      >
        {ItemContent}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      {renderTrigger()}
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          // Base Dana Design System styling
          'dana-nav-dropdown-content',
          'bg-card/95 backdrop-blur-md text-card-foreground',
          'rounded-2xl shadow-elegant-lg border border-border/50',
          'p-4',
          // Width variants
          widthVariants[width],
          // Cultural adaptations
          enableCulturalAdaptation && effectiveCulturalTheme === 'sinhala' && [
            'p-6', // More generous padding for Sinhala
          ],
          // Custom classes
          contentClassName,
          className
        )}
      >
        <div className={cn(
          'grid',
          spacing.gap
        )}>
          {items.map(renderItem)}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Preset configurations for common use cases
export const DropdownPresets = {
  // Profile dropdown preset
  profile: (profile: any, signOut: () => Promise<void>) => ({
    items: [
      {
        type: 'item' as const,
        key: 'profile',
        icon: User,
        label: 'My Profile',
        href: '/profile',
      },
      {
        type: 'separator' as const,
        key: 'sep-1',
      },
      {
        type: 'item' as const,
        key: 'signout',
        icon: LogOut,
        label: 'Sign Out',
        variant: 'destructive' as const,
        onClick: async (e: React.MouseEvent) => {
          e.preventDefault()
          await signOut()
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        },
      },
    ],
    width: 'sm' as const,
  }),

  // Language switcher preset
  language: (
    currentLocale: string,
    onLocaleChange: (locale: string) => void,
    locales: readonly string[]
  ) => ({
    items: locales.map(locale => ({
      type: 'item' as const,
      key: locale,
      label: locale === 'en' ? 'English' : 'සිංහල',
      selected: currentLocale === locale,
      onClick: () => onLocaleChange(locale),
    })),
    width: 'sm' as const,
  }),

  // Navigation menu preset
  navigation: (menuItems: Array<{
    key: string
    icon: LucideIcon
    label: string
    description: string
    href: string
  }>) => ({
    items: menuItems.map(item => ({
      type: 'item' as const,
      key: item.key,
      icon: item.icon,
      label: item.label,
      description: item.description,
      href: item.href,
    })),
    width: 'lg' as const,
  }),
} as const

// Helper functions for creating dropdown configurations
export function createDropdownItems(
  config: Array<{
    type?: 'item' | 'separator' | 'label'
    key?: string
    icon?: LucideIcon
    label?: string
    description?: string
    href?: string
    onClick?: (e: React.MouseEvent) => void | Promise<void>
    variant?: 'default' | 'destructive' | 'accent'
    disabled?: boolean
    selected?: boolean
  }>
): DropdownItem[] {
  return config.map((item, index) => ({
    type: 'item',
    key: `item-${index}`,
    ...item,
  }))
}

export function createDropdownTrigger(
  children: React.ReactNode,
  options?: Partial<DropdownTriggerProps>
): DropdownTriggerProps {
  return {
    children,
    variant: 'default',
    size: 'md',
    showChevron: true,
    ...options,
  }
}

// Cultural utilities
export function getCulturalDropdownProps(locale: string) {
  return {
    culturalTheme: locale === 'si' ? 'sinhala' as const : 'english' as const,
    enableCulturalAdaptation: true,
  }
}

export default UnifiedDropdown