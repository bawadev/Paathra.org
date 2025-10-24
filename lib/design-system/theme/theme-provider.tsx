'use client'

/**
 * Enhanced Dana Design System - Theme Provider
 * React context provider for managing theme state and cultural variants
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  ThemeConfig,
  ThemeMode,
  CulturalTheme,
  ThemeContext as ThemeContextType,
  defaultThemeConfig,
  generateThemeCSS,
  detectPreferredCulturalTheme,
  detectSystemTheme,
  detectAccessibilityPreferences,
  validateThemeConfig,
  culturalThemes,
  contextThemes,
} from './theme-config'

// Theme context interface
interface ThemeContextValue {
  // Current theme configuration
  config: ThemeConfig

  // Theme setters
  setMode: (mode: ThemeMode) => void
  setCulturalTheme: (cultural: CulturalTheme) => void
  setContext: (context: ThemeContextType) => void

  // Convenience getters
  mode: ThemeMode
  cultural: CulturalTheme
  context: ThemeContextType

  // Cultural helpers
  isRTL: boolean
  culturalClasses: string

  // Theme utilities
  applyContextTheme: (context: ThemeContextType) => void
  resetToDefaults: () => void

  // CSS custom properties
  cssVariables: Record<string, string>
}

// Create theme context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Storage keys
const STORAGE_KEYS = {
  mode: 'dana-theme-mode',
  cultural: 'dana-cultural-theme',
  context: 'dana-theme-context',
} as const

// Provider props
interface ThemeProviderProps {
  children: React.ReactNode
  defaultMode?: ThemeMode
  defaultCultural?: CulturalTheme
  defaultContext?: ThemeContextType
  storageKey?: string
  locale?: string
  disableStorage?: boolean
}

export function ThemeProvider({
  children,
  defaultMode = 'light', // Force light mode - dark mode disabled
  defaultCultural,
  defaultContext = 'general',
  locale,
  disableStorage = false,
}: ThemeProviderProps) {
  // Initialize theme configuration
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const initialCultural = defaultCultural || detectPreferredCulturalTheme(locale)
    // Always use light mode - ignore browser dark mode preference
    const initialMode = 'light'

    return validateThemeConfig({
      mode: initialMode,
      cultural: initialCultural,
      context: defaultContext,
      accessibility: detectAccessibilityPreferences(),
    })
  })

  // Load theme from storage on mount
  useEffect(() => {
    if (disableStorage || typeof window === 'undefined') return

    try {
      // Force light mode - ignore any saved dark mode preference
      const savedCultural = localStorage.getItem(STORAGE_KEYS.cultural) as CulturalTheme | null
      const savedContext = localStorage.getItem(STORAGE_KEYS.context) as ThemeContextType | null

      if (savedCultural || savedContext) {
        setConfig(prev => validateThemeConfig({
          ...prev,
          mode: 'light', // Always force light mode
          cultural: savedCultural || prev.cultural,
          context: savedContext || prev.context,
        }))
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error)
    }
  }, [disableStorage])

  // Save theme to storage when config changes
  useEffect(() => {
    if (disableStorage || typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.mode, config.mode)
      localStorage.setItem(STORAGE_KEYS.cultural, config.cultural)
      localStorage.setItem(STORAGE_KEYS.context, config.context)
    } catch (error) {
      console.warn('Failed to save theme to storage:', error)
    }
  }, [config.mode, config.cultural, config.context, disableStorage])

  // Listen for system theme changes - DISABLED to force light mode only
  // useEffect(() => {
  //   if (config.mode !== 'auto') return

  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  //   const handleChange = () => {
  //     setConfig(prev => ({
  //       ...prev,
  //       mode: mediaQuery.matches ? 'dark' : 'light',
  //     }))
  //   }

  //   mediaQuery.addEventListener('change', handleChange)
  //   return () => mediaQuery.removeEventListener('change', handleChange)
  // }, [config.mode])

  // Listen for accessibility preference changes
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleAccessibilityChange = () => {
      setConfig(prev => ({
        ...prev,
        accessibility: {
          reducedMotion: reducedMotionQuery.matches,
          highContrast: highContrastQuery.matches,
        },
      }))
    }

    reducedMotionQuery.addEventListener('change', handleAccessibilityChange)
    highContrastQuery.addEventListener('change', handleAccessibilityChange)

    return () => {
      reducedMotionQuery.removeEventListener('change', handleAccessibilityChange)
      highContrastQuery.removeEventListener('change', handleAccessibilityChange)
    }
  }, [])

  // Apply theme CSS variables to document
  useEffect(() => {
    const root = document.documentElement
    const cssVariables = generateThemeCSS(config)

    // Apply CSS custom properties
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Apply theme mode class - always use light mode
    root.classList.remove('light', 'dark')
    root.classList.add('light')

    // Apply cultural theme class
    root.classList.remove('theme-sinhala', 'theme-english', 'theme-universal')
    root.classList.add(`theme-${config.cultural}`)

    // Apply context theme class
    root.classList.remove(
      'context-donation',
      'context-monastery',
      'context-spiritual',
      'context-admin',
      'context-general'
    )
    root.classList.add(`context-${config.context}`)

    // Apply accessibility classes
    root.classList.toggle('reduce-motion', config.accessibility.reducedMotion)
    root.classList.toggle('high-contrast', config.accessibility.highContrast)

    return () => {
      // Cleanup on unmount
      Object.keys(cssVariables).forEach(property => {
        root.style.removeProperty(property)
      })
    }
  }, [config])

  // Theme setters
  const setMode = useCallback((mode: ThemeMode) => {
    // Force light mode - ignore any attempts to set dark mode
    setConfig(prev => ({ ...prev, mode: 'light' }))
  }, [])

  const setCulturalTheme = useCallback((cultural: CulturalTheme) => {
    setConfig(prev => ({ ...prev, cultural }))
  }, [])

  const setContextTheme = useCallback((context: ThemeContextType) => {
    setConfig(prev => ({ ...prev, context }))
  }, [])

  // Utility functions
  const applyContextTheme = useCallback((context: ThemeContextType) => {
    setContextTheme(context)
  }, [setContextTheme])

  const resetToDefaults = useCallback(() => {
    setConfig(defaultThemeConfig)
  }, [])

  // Computed values
  const isRTL = false // Could be extended for RTL languages like Arabic
  const culturalClasses = `${culturalThemes[config.cultural].typography.primary} ${culturalThemes[config.cultural].typography.secondary}`
  const cssVariables = generateThemeCSS(config)

  // Context value
  const contextValue: ThemeContextValue = {
    config,
    setMode,
    setCulturalTheme,
    setContext: setContextTheme,
    mode: config.mode,
    cultural: config.cultural,
    context: config.context,
    isRTL,
    culturalClasses,
    applyContextTheme,
    resetToDefaults,
    cssVariables,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Theme hook
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

// Convenience hooks
export function useThemeMode() {
  const { mode, setMode } = useTheme()
  return [mode, setMode] as const
}

export function useCulturalTheme() {
  const { cultural, setCulturalTheme } = useTheme()
  return [cultural, setCulturalTheme] as const
}

export function useThemeContext() {
  const { context, setContext } = useTheme()
  return [context, setContext] as const
}

// Context-specific theme hooks
export function useDonationTheme() {
  const { applyContextTheme } = useTheme()
  useEffect(() => {
    applyContextTheme('donation')
    return () => applyContextTheme('general')
  }, [applyContextTheme])
}

export function useMonasteryTheme() {
  const { applyContextTheme } = useTheme()
  useEffect(() => {
    applyContextTheme('monastery')
    return () => applyContextTheme('general')
  }, [applyContextTheme])
}

export function useSpiritualTheme() {
  const { applyContextTheme } = useTheme()
  useEffect(() => {
    applyContextTheme('spiritual')
    return () => applyContextTheme('general')
  }, [applyContextTheme])
}

export function useAdminTheme() {
  const { applyContextTheme } = useTheme()
  useEffect(() => {
    applyContextTheme('admin')
    return () => applyContextTheme('general')
  }, [applyContextTheme])
}

// Export types
export type { ThemeContextValue, ThemeProviderProps }