/**
 * Enhanced Dana Design System - Navigation Types
 * Comprehensive TypeScript type definitions for navigation components
 */

import { LucideIcon } from 'lucide-react'
import { ThemeContext, CulturalTheme } from '@/lib/design-system/theme/theme-config'

// Base variant types
export type NavigationVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'outline'
export type NavigationSize = 'sm' | 'md' | 'lg'
export type NavigationWidth = 'sm' | 'md' | 'lg' | 'xl'

// Navigation states
export interface NavigationState {
  /** Whether the item is currently active/selected */
  active?: boolean
  /** Whether the item is expanded (for dropdowns) */
  expanded?: boolean
  /** Whether the item is disabled */
  disabled?: boolean
  /** Whether the item is loading */
  loading?: boolean
}

// Base navigation item interface
export interface BaseNavigationItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Optional icon */
  icon?: LucideIcon
  /** Navigation state */
  state?: NavigationState
  /** Additional CSS classes */
  className?: string
  /** Accessibility attributes */
  a11y?: NavigationA11yProps
}

// Link-based navigation item
export interface NavigationLinkItem extends BaseNavigationItem {
  /** Link destination */
  href: string
  /** External link indicator */
  external?: boolean
  /** Link target */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /** Link rel attributes */
  rel?: string
}

// Button-based navigation item
export interface NavigationButtonItem extends BaseNavigationItem {
  /** Click handler */
  onClick: (event: React.MouseEvent) => void
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
}

// Dropdown navigation item
export interface NavigationDropdownItemData {
  /** Unique identifier */
  id: string
  /** Display title */
  title: string
  /** Optional description */
  description?: string
  /** Link href */
  href: string
  /** Optional icon */
  icon?: LucideIcon
  /** Whether this item is active */
  active?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** External link indicator */
  external?: boolean
  /** Accessibility attributes */
  a11y?: NavigationA11yProps
}

export interface NavigationDropdownData extends BaseNavigationItem {
  /** Array of dropdown items */
  items: NavigationDropdownItemData[]
  /** Dropdown width */
  width?: NavigationWidth
  /** Whether dropdown is currently open */
  open?: boolean
  /** Callback when dropdown state changes */
  onOpenChange?: (open: boolean) => void
}

// Accessibility props
export interface NavigationA11yProps {
  /** ARIA label */
  'aria-label'?: string
  /** ARIA labelled by */
  'aria-labelledby'?: string
  /** ARIA described by */
  'aria-describedby'?: string
  /** ARIA current */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
  /** ARIA expanded */
  'aria-expanded'?: boolean
  /** ARIA haspopup */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  /** ARIA controls */
  'aria-controls'?: string
  /** ARIA owns */
  'aria-owns'?: string
  /** Custom role */
  role?: string
}

// Theme-aware navigation props
export interface NavigationThemeProps {
  /** Visual variant */
  variant?: NavigationVariant
  /** Size variant */
  size?: NavigationSize
  /** Cultural theme override */
  cultural?: CulturalTheme
  /** Context theme override */
  context?: ThemeContext
}

// Navigation menu structure
export interface NavigationMenuData {
  /** Menu identifier */
  id: string
  /** Menu label */
  label: string
  /** Menu items */
  items: Array<NavigationLinkItem | NavigationButtonItem | NavigationDropdownData>
  /** Menu position */
  position?: 'left' | 'center' | 'right'
  /** Menu orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Menu theme */
  theme?: NavigationThemeProps
}

// Complete navigation configuration
export interface NavigationConfig {
  /** Primary navigation menu */
  primary: NavigationMenuData
  /** Secondary navigation menu */
  secondary?: NavigationMenuData
  /** User menu */
  user?: NavigationDropdownData
  /** Language switcher */
  language?: NavigationDropdownData
  /** Mobile menu configuration */
  mobile?: {
    /** Whether mobile menu is enabled */
    enabled: boolean
    /** Mobile menu breakpoint */
    breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
    /** Mobile menu style */
    style?: 'overlay' | 'slide' | 'push'
  }
  /** Global navigation theme */
  theme?: NavigationThemeProps
}

// Navigation event handlers
export interface NavigationEventHandlers {
  /** Item click handler */
  onItemClick?: (item: BaseNavigationItem, event: React.MouseEvent) => void
  /** Menu open handler */
  onMenuOpen?: (menuId: string) => void
  /** Menu close handler */
  onMenuClose?: (menuId: string) => void
  /** Mobile menu toggle handler */
  onMobileToggle?: (open: boolean) => void
  /** Language change handler */
  onLanguageChange?: (locale: string) => void
}

// Navigation context
export interface NavigationContextValue {
  /** Current navigation configuration */
  config: NavigationConfig
  /** Current active item */
  activeItem?: string
  /** Current open dropdown */
  openDropdown?: string
  /** Mobile menu state */
  mobileMenuOpen: boolean
  /** Event handlers */
  handlers: NavigationEventHandlers
  /** Theme configuration */
  theme: NavigationThemeProps
  /** Update configuration */
  updateConfig: (config: Partial<NavigationConfig>) => void
  /** Set active item */
  setActiveItem: (itemId: string) => void
  /** Toggle dropdown */
  toggleDropdown: (dropdownId: string) => void
  /** Toggle mobile menu */
  toggleMobileMenu: () => void
}

// Component prop types
export type NavigationItemType = NavigationLinkItem | NavigationButtonItem | NavigationDropdownData

// Utility types
export type NavigationItemProps<T extends NavigationItemType = NavigationItemType> = T & NavigationThemeProps & {
  /** Additional CSS classes */
  className?: string
  /** React ref */
  ref?: React.Ref<HTMLElement>
}

export type NavigationMenuProps = NavigationMenuData & NavigationThemeProps & {
  /** Additional CSS classes */
  className?: string
  /** Event handlers */
  handlers?: NavigationEventHandlers
}

// Export utility type guards
export const isNavigationLinkItem = (item: NavigationItemType): item is NavigationLinkItem => {
  return 'href' in item
}

export const isNavigationButtonItem = (item: NavigationItemType): item is NavigationButtonItem => {
  return 'onClick' in item && !('href' in item)
}

export const isNavigationDropdownItem = (item: NavigationItemType): item is NavigationDropdownData => {
  return 'items' in item
}

// Default configurations
export const defaultNavigationTheme: Required<NavigationThemeProps> = {
  variant: 'default',
  size: 'md',
  cultural: 'universal',
  context: 'general',
}

export const defaultNavigationState: Required<NavigationState> = {
  active: false,
  expanded: false,
  disabled: false,
  loading: false,
}

export const defaultNavigationA11y: NavigationA11yProps = {
  'aria-label': undefined,
  'aria-labelledby': undefined,
  'aria-describedby': undefined,
  'aria-current': undefined,
  'aria-expanded': undefined,
  'aria-haspopup': undefined,
  'aria-controls': undefined,
  'aria-owns': undefined,
  role: undefined,
}