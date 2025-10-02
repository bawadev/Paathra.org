/**
 * Enhanced Dana Design System - Navigation Accessibility Utilities
 * Comprehensive accessibility support for navigation components
 */

import { NavigationA11yProps, NavigationItemType } from './types'

// Keyboard navigation constants
export const NAVIGATION_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const

export type NavigationKey = typeof NAVIGATION_KEYS[keyof typeof NAVIGATION_KEYS]

// ARIA role definitions for navigation
export const NAVIGATION_ROLES = {
  NAVIGATION: 'navigation',
  MENU: 'menu',
  MENUBAR: 'menubar',
  MENUITEM: 'menuitem',
  MENUITEMCHECKBOX: 'menuitemcheckbox',
  MENUITEMRADIO: 'menuitemradio',
  BUTTON: 'button',
  LINK: 'link',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
} as const

// Screen reader announcements
export const SCREEN_READER_MESSAGES = {
  MENU_OPENED: 'Menu opened',
  MENU_CLOSED: 'Menu closed',
  SUBMENU_OPENED: 'Submenu opened',
  SUBMENU_CLOSED: 'Submenu closed',
  ITEM_SELECTED: 'Item selected',
  LANGUAGE_CHANGED: 'Language changed to',
  LOADING: 'Loading',
  ERROR: 'Error occurred',
} as const

// Accessibility utilities
export class NavigationA11yUtils {
  /**
   * Generate appropriate ARIA attributes for navigation items
   */
  static generateAriaAttributes(
    item: NavigationItemType,
    context: {
      isOpen?: boolean
      hasSubmenu?: boolean
      isActive?: boolean
      position?: number
      total?: number
    } = {}
  ): NavigationA11yProps {
    const { isOpen, hasSubmenu, isActive, position, total } = context
    const baseAttrs: NavigationA11yProps = {}

    // Set aria-current for active items
    if (isActive) {
      baseAttrs['aria-current'] = 'page'
    }

    // Set aria-expanded for items with submenus
    if (hasSubmenu) {
      baseAttrs['aria-expanded'] = isOpen || false
      baseAttrs['aria-haspopup'] = 'menu'
    }

    // Set position in set for screen readers
    if (position !== undefined && total !== undefined) {
      baseAttrs['aria-setsize'] = total
      baseAttrs['aria-posinset'] = position + 1
    }

    // Generate descriptive label if not provided
    if (!item.a11y?.['aria-label']) {
      baseAttrs['aria-label'] = NavigationA11yUtils.generateAriaLabel(item, context)
    }

    return {
      ...baseAttrs,
      ...item.a11y, // Override with any custom accessibility props
    }
  }

  /**
   * Generate descriptive ARIA label for navigation items
   */
  static generateAriaLabel(
    item: NavigationItemType,
    context: { hasSubmenu?: boolean; isActive?: boolean } = {}
  ): string {
    const { hasSubmenu, isActive } = context
    let label = item.label

    if (hasSubmenu) {
      label += ', has submenu'
    }

    if (isActive) {
      label += ', current page'
    }

    if (item.state?.disabled) {
      label += ', disabled'
    }

    return label
  }

  /**
   * Handle keyboard navigation for menu items
   */
  static handleKeyboardNavigation(
    event: React.KeyboardEvent,
    options: {
      currentIndex: number
      itemCount: number
      orientation: 'horizontal' | 'vertical'
      onSelect?: () => void
      onClose?: () => void
      onNext?: () => void
      onPrevious?: () => void
      onFirst?: () => void
      onLast?: () => void
    }
  ): boolean {
    const {
      currentIndex,
      itemCount,
      orientation,
      onSelect,
      onClose,
      onNext,
      onPrevious,
      onFirst,
      onLast,
    } = options

    const { key } = event

    switch (key) {
      case NAVIGATION_KEYS.ENTER:
      case NAVIGATION_KEYS.SPACE:
        event.preventDefault()
        onSelect?.()
        return true

      case NAVIGATION_KEYS.ESCAPE:
        event.preventDefault()
        onClose?.()
        return true

      case NAVIGATION_KEYS.ARROW_DOWN:
        if (orientation === 'vertical') {
          event.preventDefault()
          onNext?.()
          return true
        }
        break

      case NAVIGATION_KEYS.ARROW_UP:
        if (orientation === 'vertical') {
          event.preventDefault()
          onPrevious?.()
          return true
        }
        break

      case NAVIGATION_KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal') {
          event.preventDefault()
          onNext?.()
          return true
        }
        break

      case NAVIGATION_KEYS.ARROW_LEFT:
        if (orientation === 'horizontal') {
          event.preventDefault()
          onPrevious?.()
          return true
        }
        break

      case NAVIGATION_KEYS.HOME:
        event.preventDefault()
        onFirst?.()
        return true

      case NAVIGATION_KEYS.END:
        event.preventDefault()
        onLast?.()
        return true

      default:
        // Handle character navigation (type-ahead)
        if (key.length === 1 && key.match(/[a-zA-Z0-9]/)) {
          // Implementation would depend on specific requirements
          return false
        }
    }

    return false
  }

  /**
   * Announce changes to screen readers
   */
  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('class', 'sr-only')
    announcer.textContent = message

    document.body.appendChild(announcer)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }

  /**
   * Focus management utilities
   */
  static focusManagement = {
    /**
     * Focus the first focusable element in a container
     */
    focusFirst(container: HTMLElement): boolean {
      const focusable = NavigationA11yUtils.focusManagement.getFocusableElements(container)
      if (focusable.length > 0) {
        focusable[0].focus()
        return true
      }
      return false
    },

    /**
     * Focus the last focusable element in a container
     */
    focusLast(container: HTMLElement): boolean {
      const focusable = NavigationA11yUtils.focusManagement.getFocusableElements(container)
      if (focusable.length > 0) {
        focusable[focusable.length - 1].focus()
        return true
      }
      return false
    },

    /**
     * Focus the next focusable element
     */
    focusNext(container: HTMLElement, currentElement: HTMLElement): boolean {
      const focusable = NavigationA11yUtils.focusManagement.getFocusableElements(container)
      const currentIndex = focusable.indexOf(currentElement)

      if (currentIndex !== -1 && currentIndex < focusable.length - 1) {
        focusable[currentIndex + 1].focus()
        return true
      }

      // Wrap to first element
      if (focusable.length > 0) {
        focusable[0].focus()
        return true
      }

      return false
    },

    /**
     * Focus the previous focusable element
     */
    focusPrevious(container: HTMLElement, currentElement: HTMLElement): boolean {
      const focusable = NavigationA11yUtils.focusManagement.getFocusableElements(container)
      const currentIndex = focusable.indexOf(currentElement)

      if (currentIndex > 0) {
        focusable[currentIndex - 1].focus()
        return true
      }

      // Wrap to last element
      if (focusable.length > 0) {
        focusable[focusable.length - 1].focus()
        return true
      }

      return false
    },

    /**
     * Get all focusable elements in a container
     */
    getFocusableElements(container: HTMLElement): HTMLElement[] {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(', ')

      return Array.from(container.querySelectorAll(focusableSelectors))
        .filter((element) => {
          return (
            element instanceof HTMLElement &&
            !element.hidden &&
            element.offsetParent !== null &&
            window.getComputedStyle(element).visibility !== 'hidden'
          )
        }) as HTMLElement[]
    },

    /**
     * Trap focus within a container
     */
    trapFocus(container: HTMLElement): () => void {
      const focusable = NavigationA11yUtils.focusManagement.getFocusableElements(container)

      if (focusable.length === 0) {
        return () => {}
      }

      const firstFocusable = focusable[0]
      const lastFocusable = focusable[focusable.length - 1]

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === NAVIGATION_KEYS.TAB) {
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
              event.preventDefault()
              lastFocusable.focus()
            }
          } else {
            // Tab
            if (document.activeElement === lastFocusable) {
              event.preventDefault()
              firstFocusable.focus()
            }
          }
        }
      }

      container.addEventListener('keydown', handleKeyDown)

      // Focus first element
      firstFocusable.focus()

      // Return cleanup function
      return () => {
        container.removeEventListener('keydown', handleKeyDown)
      }
    },
  }

  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Check if user prefers high contrast
   */
  static prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  /**
   * Generate unique IDs for ARIA relationships
   */
  static generateId(prefix: string = 'nav'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  items: NavigationItemType[],
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      NavigationA11yUtils.handleKeyboardNavigation(event, {
        currentIndex,
        itemCount: items.length,
        orientation,
        onNext: () => setFocusedIndex((prev) => (prev + 1) % items.length),
        onPrevious: () => setFocusedIndex((prev) => (prev - 1 + items.length) % items.length),
        onFirst: () => setFocusedIndex(0),
        onLast: () => setFocusedIndex(items.length - 1),
      })
    },
    [items.length, orientation]
  )

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  }
}

// Add React import for the hook
import React from 'react'

export default NavigationA11yUtils