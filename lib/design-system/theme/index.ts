/**
 * Enhanced Dana Design System - Theme Index
 * Central export for theme system
 */

// Export theme provider and hooks
export {
  ThemeProvider,
  useTheme,
  useThemeMode,
  useCulturalTheme,
  useThemeContext,
  useDonationTheme,
  useMonasteryTheme,
  useSpiritualTheme,
  useAdminTheme,
  type ThemeContextValue,
  type ThemeProviderProps,
} from './theme-provider'

// Export theme configuration
export {
  defaultThemeConfig,
  culturalThemes,
  contextThemes,
  generateThemeCSS,
  detectPreferredCulturalTheme,
  detectSystemTheme,
  detectAccessibilityPreferences,
  validateThemeConfig,
  type ThemeConfig,
  type ThemeMode,
  type CulturalTheme,
  type ThemeContext,
} from './theme-config'

// Utility functions for theme management
export function createThemeToggle() {
  return {
    modes: ['light', 'dark', 'auto'] as const,
    culturalThemes: ['sinhala', 'english', 'universal'] as const,
    contexts: ['donation', 'monastery', 'spiritual', 'admin', 'general'] as const,
  }
}

// Theme utilities for components
export function getThemeAwareClasses(config: {
  cultural?: string
  context?: string
  accessibility?: {
    reducedMotion?: boolean
    highContrast?: boolean
  }
}): string {
  const classes = []

  if (config.cultural) {
    classes.push(`theme-${config.cultural}`)
  }

  if (config.context) {
    classes.push(`context-${config.context}`)
  }

  if (config.accessibility?.reducedMotion) {
    classes.push('reduce-motion')
  }

  if (config.accessibility?.highContrast) {
    classes.push('high-contrast')
  }

  return classes.join(' ')
}

// Theme constants for easy reference
export const THEME_CONSTANTS = {
  STORAGE_KEYS: {
    mode: 'dana-theme-mode',
    cultural: 'dana-cultural-theme',
    context: 'dana-theme-context',
  },
  CSS_CLASSES: {
    modes: {
      light: 'light',
      dark: 'dark',
    },
    cultural: {
      sinhala: 'theme-sinhala',
      english: 'theme-english',
      universal: 'theme-universal',
    },
    contexts: {
      donation: 'context-donation',
      monastery: 'context-monastery',
      spiritual: 'context-spiritual',
      admin: 'context-admin',
      general: 'context-general',
    },
    accessibility: {
      reducedMotion: 'reduce-motion',
      highContrast: 'high-contrast',
    },
  },
} as const