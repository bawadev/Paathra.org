/**
 * Enhanced Dana Design System - Main Index
 * Central export for the complete design system
 */

// Export layout components only (what we're actually using)
export { PageContainer } from './components/PageContainer'
export { PageHeader } from './components/PageHeader'
export { StatCard } from './components/StatCard'
export { StatusBadge, getStatusColor, type StatusType } from './components/StatusBadge'
export { EmptyState } from './components/EmptyState'

// Export variants that are used by shadcn components
export { inputVariants, type InputVariantProps } from './components/variants/input'
export { buttonVariants, type ButtonVariantProps } from './components/variants/button'
export { cardVariants, type CardVariantProps } from './components/variants/card'

// Export responsive breakpoint system
export {
  breakpointTokens,
  responsiveTypography,
  touchTargets,
  responsiveSpacing,
  viewportUtils,
  mediaQueries,
  responsivePatterns,
  getBreakpoint,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  getTouchTargetSize,
  type Breakpoint,
  type ResponsiveTypographyScale,
} from './tokens/breakpoints'

// Main design system configuration
export const danaDesignSystem = {
  version: '1.0.0',
  name: 'Enhanced Dana Design System',
  description: 'Buddhist monastery donation platform design system with cultural sensitivity',

  // Core principles
  principles: {
    culturalSensitivity: 'Respectful adaptation for Buddhist context',
    accessibility: 'Universal design with WCAG 2.1 AA compliance',
    spirituality: 'Peaceful, meditation-inspired interactions',
    trust: 'Building confidence in donation processes',
    multilingual: 'Optimized for Sinhala, English, and Tamil',
  },

  // Supported features
  features: {
    themes: ['light', 'dark', 'auto'],
    cultures: ['sinhala', 'english', 'universal'],
    contexts: ['donation', 'monastery', 'spiritual', 'admin', 'general'],
    animations: ['meditation-inspired', 'peaceful', 'trust-building'],
    accessibility: ['reduced-motion', 'high-contrast', 'large-text'],
  },

  // Color palette overview
  colors: {
    primary: 'Dana Gold - Warm, trustworthy gold inspired by Buddhist traditions',
    secondary: 'Rich Warm Brown - Grounding earth tones',
    accent: 'Elegant Coral - Gentle accent for highlights',
    trust: 'Trust Blue - Building confidence in donations',
    spiritual: 'Spiritual Purple - Deep contemplative purple',
    compassion: 'Compassion Green - Growth and positive outcomes',
  },

  // Typography system
  typography: {
    english: 'Geist Sans/Serif - Clean, modern typeface',
    sinhala: 'Noto Sans/Serif Sinhala with Abhaya Libre fallbacks',
    tamil: 'Noto Sans/Serif Tamil (future support)',
    features: 'OpenType features for proper script rendering',
  },

  // Component categories
  components: {
    interactive: 'Buttons, inputs, forms with spiritual interactions',
    layout: 'Cards, containers with cultural spacing',
    feedback: 'Trust-building notifications and states',
    navigation: 'Peaceful, meditative navigation patterns',
  },

  // Cultural adaptations
  cultural: {
    sinhala: 'Increased spacing, larger text, cultural colors',
    english: 'Standard Western layout patterns',
    tamil: 'Future support with Tamil script optimizations',
  },
} as const

// Design system utilities
export function createDesignSystemConfig(options?: {
  theme?: 'light' | 'dark' | 'auto'
  culture?: 'sinhala' | 'english' | 'universal'
  context?: 'donation' | 'monastery' | 'spiritual' | 'admin' | 'general'
  accessibility?: {
    reducedMotion?: boolean
    highContrast?: boolean
    largeText?: boolean
  }
}) {
  return {
    theme: options?.theme || 'light',
    culture: options?.culture || 'universal',
    context: options?.context || 'general',
    accessibility: {
      reducedMotion: options?.accessibility?.reducedMotion || false,
      highContrast: options?.accessibility?.highContrast || false,
      largeText: options?.accessibility?.largeText || false,
    },
  }
}

// Design system validation
export function validateDesignSystemConfig(config: any): boolean {
  const validThemes = ['light', 'dark', 'auto']
  const validCultures = ['sinhala', 'english', 'universal']
  const validContexts = ['donation', 'monastery', 'spiritual', 'admin', 'general']

  return (
    validThemes.includes(config.theme) &&
    validCultures.includes(config.culture) &&
    validContexts.includes(config.context)
  )
}

// Design system constants
export const DESIGN_SYSTEM_CONSTANTS = {
  VERSION: '1.0.0',
  PREFIX: 'dana',
  CSS_NAMESPACE: 'dana-ds',

  // Theme constants
  THEMES: ['light', 'dark', 'auto'] as const,
  CULTURES: ['sinhala', 'english', 'universal'] as const,
  CONTEXTS: ['donation', 'monastery', 'spiritual', 'admin', 'general'] as const,

  // Color constants
  PRIMARY_HUE: 85,    // Dana Gold hue
  TRUST_HUE: 220,     // Trust Blue hue
  SPIRITUAL_HUE: 280, // Spiritual Purple hue

  // Typography constants
  BASE_FONT_SIZE: 16,
  SINHALA_SCALE: 1.1,
  ENGLISH_SCALE: 1.0,

  // Animation constants
  MOTION_DURATION_BASE: 300,
  MOTION_EASING_DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Spacing constants
  SPACING_UNIT: 4, // 4px base unit
  SINHALA_SPACING_SCALE: 1.25,
  ENGLISH_SPACING_SCALE: 1.0,
} as const

// Export types for TypeScript support
export type DesignSystemTheme = typeof DESIGN_SYSTEM_CONSTANTS.THEMES[number]
export type DesignSystemCulture = typeof DESIGN_SYSTEM_CONSTANTS.CULTURES[number]
export type DesignSystemContext = typeof DESIGN_SYSTEM_CONSTANTS.CONTEXTS[number]

export type DesignSystemConfig = {
  theme: DesignSystemTheme
  culture: DesignSystemCulture
  context: DesignSystemContext
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    largeText: boolean
  }
}

// Export the design system object for external use
export { danaDesignSystem as default }