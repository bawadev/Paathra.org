/**
 * Enhanced Dana Design System - Navigation Components
 * Centralized exports for all navigation components
 */

export { NavigationItem } from './NavigationItem'
export type { NavigationItemProps } from './NavigationItem'

export { NavigationDropdown } from './NavigationDropdown'
export type { NavigationDropdownProps, NavigationDropdownItem } from './NavigationDropdown'

export { NavigationTrigger } from './NavigationTrigger'
export type { NavigationTriggerProps } from './NavigationTrigger'

export { UnifiedNavigation } from './UnifiedNavigation'

// Export types
export * from './types'

// Export accessibility utilities
export { default as NavigationA11yUtils, useKeyboardNavigation } from './accessibility'

// Re-export commonly used UI navigation components
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'