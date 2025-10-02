/**
 * Enhanced Dana Design System - Theme Configuration
 * Defines theme structure and cultural variants
 */

import { colorTokens, colorRoles } from '../tokens/colors'
import { typographyTokens, typographyRoles } from '../tokens/typography'
import { spacingTokens, spacingRoles } from '../tokens/spacing'
import { durationTokens, easingTokens, animationRoles } from '../tokens/animations'

// Theme modes
export type ThemeMode = 'light' | 'dark' | 'auto'

// Cultural themes
export type CulturalTheme = 'sinhala' | 'english' | 'universal'

// Theme context types
export type ThemeContext =
  | 'donation'      // Trust-focused for donation flows
  | 'monastery'     // Spiritual-focused for monastery content
  | 'spiritual'     // Deep spiritual/meditation content
  | 'admin'         // Administrative interface
  | 'general'       // General application content

// Complete theme configuration structure
export interface ThemeConfig {
  mode: ThemeMode
  cultural: CulturalTheme
  context: ThemeContext
  colors: typeof colorTokens
  typography: typeof typographyTokens
  spacing: typeof spacingTokens
  animations: {
    durations: typeof durationTokens
    easings: typeof easingTokens
    roles: typeof animationRoles
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
  }
}

// Cultural theme configurations
export const culturalThemes: Record<CulturalTheme, {
  typography: {
    primary: string
    secondary: string
    headingFamily: string
    bodyFamily: string
    adjustments: {
      lineHeight: string
      letterSpacing: string
      wordSpacing?: string
    }
  }
  colors: {
    accent: string
    secondary: string
  }
  spacing: {
    lineSpacing: string
    wordSpacing: string
  }
}> = {
  sinhala: {
    typography: {
      primary: 'font-sinhala',
      secondary: 'font-sinhala-serif',
      headingFamily: 'var(--font-sinhala-serif)',
      bodyFamily: 'var(--font-sinhala)',
      adjustments: {
        lineHeight: '1.75',
        letterSpacing: '0.01em',
        wordSpacing: '0.05em',
      },
    },
    colors: {
      accent: colorTokens.accent[500],
      secondary: colorTokens.secondary[500],
    },
    spacing: {
      lineSpacing: spacingTokens[1],
      wordSpacing: spacingTokens[0.5],
    },
  },

  english: {
    typography: {
      primary: 'font-sans',
      secondary: 'font-sans',
      headingFamily: 'var(--font-geist-sans)',
      bodyFamily: 'var(--font-geist-sans)',
      adjustments: {
        lineHeight: '1.6',
        letterSpacing: '0',
      },
    },
    colors: {
      accent: colorTokens.trust[500],
      secondary: colorTokens.neutral[500],
    },
    spacing: {
      lineSpacing: spacingTokens[0],
      wordSpacing: spacingTokens[0],
    },
  },

  universal: {
    typography: {
      primary: 'font-sans',
      secondary: 'font-sans',
      headingFamily: 'var(--font-geist-sans)',
      bodyFamily: 'var(--font-geist-sans)',
      adjustments: {
        lineHeight: '1.6',
        letterSpacing: '0',
      },
    },
    colors: {
      accent: colorTokens.primary[500],
      secondary: colorTokens.secondary[500],
    },
    spacing: {
      lineSpacing: spacingTokens[0],
      wordSpacing: spacingTokens[0],
    },
  },
}

// Context-specific theme configurations
export const contextThemes: Record<ThemeContext, {
  colors: {
    primary: string
    accent: string
    background: string
  }
  animations: {
    defaultDuration: keyof typeof durationTokens
    defaultEasing: keyof typeof easingTokens
  }
  mood: 'energetic' | 'calm' | 'trustworthy' | 'spiritual' | 'professional'
}> = {
  donation: {
    colors: {
      primary: colorTokens.trust[500],
      accent: colorTokens.primary[500],
      background: colorTokens.trust[50],
    },
    animations: {
      defaultDuration: 'inhale',
      defaultEasing: 'meditation',
    },
    mood: 'trustworthy',
  },

  monastery: {
    colors: {
      primary: colorTokens.primary[500],
      accent: colorTokens.spiritual[500],
      background: colorTokens.spiritual[50],
    },
    animations: {
      defaultDuration: 'meditate',
      defaultEasing: 'serene',
    },
    mood: 'spiritual',
  },

  spiritual: {
    colors: {
      primary: colorTokens.spiritual[500],
      accent: colorTokens.primary[300],
      background: colorTokens.spiritual[50],
    },
    animations: {
      defaultDuration: 'contemplate',
      defaultEasing: 'lotus',
    },
    mood: 'calm',
  },

  admin: {
    colors: {
      primary: colorTokens.trust[600],
      accent: colorTokens.neutral[500],
      background: colorTokens.neutral[50],
    },
    animations: {
      defaultDuration: 'breathe',
      defaultEasing: 'gentle',
    },
    mood: 'professional',
  },

  general: {
    colors: {
      primary: colorTokens.primary[500],
      accent: colorTokens.accent[500],
      background: colorTokens.neutral[50],
    },
    animations: {
      defaultDuration: 'inhale',
      defaultEasing: 'meditation',
    },
    mood: 'energetic',
  },
}

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  cultural: 'universal',
  context: 'general',
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  animations: {
    durations: durationTokens,
    easings: easingTokens,
    roles: animationRoles,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
  },
}

// Theme generation utilities
export function generateThemeCSS(config: ThemeConfig): Record<string, string> {
  const cultural = culturalThemes[config.cultural]
  const context = contextThemes[config.context]

  return {
    // Typography
    '--font-primary': cultural.typography.bodyFamily,
    '--font-secondary': cultural.typography.headingFamily,
    '--line-height-cultural': cultural.typography.adjustments.lineHeight,
    '--letter-spacing-cultural': cultural.typography.adjustments.letterSpacing,
    '--word-spacing-cultural': cultural.typography.adjustments.wordSpacing || '0',

    // Colors (context-aware)
    '--color-theme-primary': context.colors.primary,
    '--color-theme-accent': context.colors.accent,
    '--color-theme-background': context.colors.background,

    // Animations
    '--duration-default': durationTokens[context.animations.defaultDuration],
    '--easing-default': easingTokens[context.animations.defaultEasing],

    // Accessibility
    '--motion-scale': config.accessibility.reducedMotion ? '0' : '1',
    '--contrast-scale': config.accessibility.highContrast ? '1.2' : '1',
  }
}

// Theme detection utilities
export function detectPreferredCulturalTheme(locale?: string): CulturalTheme {
  if (!locale) return 'universal'

  switch (locale) {
    case 'si':
      return 'sinhala'
    case 'en':
      return 'english'
    default:
      return 'universal'
  }
}

export function detectSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function detectAccessibilityPreferences(): {
  reducedMotion: boolean
  highContrast: boolean
} {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, highContrast: false }
  }

  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
  }
}

// Theme validation
export function validateThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
  return {
    mode: config.mode || defaultThemeConfig.mode,
    cultural: config.cultural || defaultThemeConfig.cultural,
    context: config.context || defaultThemeConfig.context,
    colors: config.colors || defaultThemeConfig.colors,
    typography: config.typography || defaultThemeConfig.typography,
    spacing: config.spacing || defaultThemeConfig.spacing,
    animations: config.animations || defaultThemeConfig.animations,
    accessibility: {
      reducedMotion: config.accessibility?.reducedMotion ?? defaultThemeConfig.accessibility.reducedMotion,
      highContrast: config.accessibility?.highContrast ?? defaultThemeConfig.accessibility.highContrast,
    },
  }
}

export type { ThemeConfig, CulturalTheme, ThemeContext, ThemeMode }