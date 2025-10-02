/**
 * Enhanced Dana Design System - Components Index
 * Central export for all design system components
 */

// Export layout components
export { PageContainer } from './PageContainer'
export { PageHeader } from './PageHeader'
export { StatCard } from './StatCard'
export { StatusBadge, getStatusColor, type StatusType } from './StatusBadge'
export { EmptyState } from './EmptyState'

// Export all variants
export * from './variants'

// Re-export specific variant utilities for convenience
export {
  buttonVariants,
  buttonPresets,
  cardVariants,
  cardPresets,
  inputVariants,
  inputPresets,
  type ButtonVariantProps,
  type CardVariantProps,
  type InputVariantProps,
  type ButtonPreset,
  type CardPreset,
  type InputPreset,
} from './variants'

// Component utilities
export {
  getVariantClasses,
  applyPreset,
  getCulturalVariants,
  getContextualVariants,
  getAccessibilityVariants,
  componentPatterns,
  type ComponentPattern,
  type AllVariantProps,
  type AllPresets,
} from './variants'

// Design system component categories
export const componentCategories = {
  interactive: ['button', 'input', 'select', 'checkbox', 'radio'] as const,
  layout: ['card', 'container', 'grid', 'stack'] as const,
  feedback: ['alert', 'toast', 'notification', 'progress'] as const,
  navigation: ['breadcrumb', 'pagination', 'tabs', 'menu'] as const,
  content: ['heading', 'text', 'list', 'table'] as const,
} as const

export type ComponentCategory = keyof typeof componentCategories
export type ComponentType = typeof componentCategories[ComponentCategory][number]