/**
 * Enhanced Dana Design System - Color Tokens
 * Extends the existing OKLCH color system with cultural and spiritual colors
 */

// Base color scales using OKLCH for perceptual uniformity
export const colorTokens = {
  // Primary Dana Gold - existing scale from globals.css
  primary: {
    50: "oklch(0.98 0.02 85)",
    100: "oklch(0.95 0.04 85)",
    200: "oklch(0.90 0.06 85)",
    300: "oklch(0.82 0.08 85)",
    400: "oklch(0.78 0.10 85)",
    500: "oklch(0.74 0.12 85)", // Primary Dana Gold
    600: "oklch(0.68 0.11 85)",
    700: "oklch(0.58 0.10 85)",
    800: "oklch(0.48 0.09 85)",
    900: "oklch(0.35 0.08 85)",
  },

  // Secondary Rich Warm Brown - existing scale
  secondary: {
    50: "oklch(0.96 0.02 45)",
    100: "oklch(0.92 0.03 45)",
    200: "oklch(0.85 0.05 45)",
    300: "oklch(0.75 0.07 45)",
    400: "oklch(0.65 0.08 45)",
    500: "oklch(0.55 0.09 45)", // Rich Warm Brown
    600: "oklch(0.45 0.09 45)",
    700: "oklch(0.35 0.09 45)",
    800: "oklch(0.28 0.08 45)",
    900: "oklch(0.20 0.06 45)",
  },

  // Accent Elegant Coral - existing scale
  accent: {
    50: "oklch(0.97 0.05 25)",
    100: "oklch(0.94 0.08 25)",
    200: "oklch(0.88 0.12 25)",
    300: "oklch(0.80 0.15 25)",
    400: "oklch(0.75 0.17 25)",
    500: "oklch(0.70 0.18 25)", // Elegant Coral
    600: "oklch(0.65 0.17 25)",
    700: "oklch(0.58 0.16 25)",
    800: "oklch(0.50 0.14 25)",
    900: "oklch(0.40 0.12 25)",
  },

  // NEW: Trust Blue - for donation flows and trust signals
  trust: {
    50: "oklch(0.97 0.02 220)",
    100: "oklch(0.94 0.04 220)",
    200: "oklch(0.88 0.06 220)",
    300: "oklch(0.78 0.08 220)",
    400: "oklch(0.70 0.10 220)",
    500: "oklch(0.65 0.15 220)", // Trust Blue
    600: "oklch(0.58 0.16 220)",
    700: "oklch(0.50 0.15 220)",
    800: "oklch(0.42 0.14 220)",
    900: "oklch(0.32 0.12 220)",
  },

  // NEW: Spiritual Purple - for meditation and spiritual sections
  spiritual: {
    50: "oklch(0.97 0.02 280)",
    100: "oklch(0.94 0.04 280)",
    200: "oklch(0.88 0.06 280)",
    300: "oklch(0.80 0.08 280)",
    400: "oklch(0.72 0.10 280)",
    500: "oklch(0.65 0.15 280)", // Spiritual Purple
    600: "oklch(0.58 0.16 280)",
    700: "oklch(0.50 0.15 280)",
    800: "oklch(0.42 0.14 280)",
    900: "oklch(0.32 0.12 280)",
  },

  // NEW: Compassion Green - for success states and growth
  compassion: {
    50: "oklch(0.97 0.02 142)",
    100: "oklch(0.94 0.04 142)",
    200: "oklch(0.88 0.06 142)",
    300: "oklch(0.78 0.08 142)",
    400: "oklch(0.68 0.10 142)",
    500: "oklch(0.60 0.15 142)", // Compassion Green
    600: "oklch(0.54 0.16 142)",
    700: "oklch(0.46 0.15 142)",
    800: "oklch(0.38 0.14 142)",
    900: "oklch(0.28 0.12 142)",
  },

  // Neutral grays with warm tint - existing scale
  neutral: {
    50: "oklch(0.98 0.005 85)",
    100: "oklch(0.96 0.01 85)",
    200: "oklch(0.92 0.015 85)",
    300: "oklch(0.86 0.02 85)",
    400: "oklch(0.70 0.02 85)",
    500: "oklch(0.58 0.02 85)",
    600: "oklch(0.45 0.025 85)",
    700: "oklch(0.35 0.03 85)",
    800: "oklch(0.25 0.03 85)",
    900: "oklch(0.15 0.02 85)",
  },

  // Enhanced semantic colors
  semantic: {
    success: "oklch(0.60 0.15 142)", // Compassion Green
    warning: "oklch(0.75 0.15 85)", // Warning Gold
    error: "oklch(0.65 0.20 25)", // Error Coral
    info: "oklch(0.65 0.15 220)", // Info Blue
  },

  // Cultural-specific color variants
  cultural: {
    // Sinhala cultural colors
    sinhala: {
      accent: "oklch(0.70 0.18 25)", // Warm coral for Sinhala
      secondary: "oklch(0.55 0.09 45)", // Rich brown
    },
    // English cultural colors
    english: {
      accent: "oklch(0.65 0.15 220)", // Cool blue for English
      secondary: "oklch(0.58 0.02 85)", // Neutral gray
    },
  },
} as const

// Color role mappings for different contexts
export const colorRoles = {
  // Donation flow specific colors
  donation: {
    primary: "trust.500",
    accent: "primary.500",
    success: "compassion.500",
  },

  // Monastery context colors
  monastery: {
    primary: "primary.500",
    accent: "spiritual.500",
    peaceful: "spiritual.200",
  },

  // Spiritual/meditation context
  spiritual: {
    primary: "spiritual.500",
    accent: "primary.300",
    peaceful: "spiritual.100",
  },

  // Admin context colors
  admin: {
    primary: "trust.600",
    accent: "neutral.500",
    warning: "semantic.warning",
  },
} as const

// Utility function to get color value by path
export function getColorValue(path: string): string {
  const keys = path.split('.')
  let value: any = colorTokens

  for (const key of keys) {
    value = value[key]
    if (!value) return path // Return original if not found
  }

  return typeof value === 'string' ? value : path
}

// Export color scales for easy access
export const {
  primary,
  secondary,
  accent,
  trust,
  spiritual,
  compassion,
  neutral,
  semantic,
  cultural,
} = colorTokens

export type ColorToken = keyof typeof colorTokens
export type ColorScale = keyof typeof colorTokens.primary
export type SemanticColor = keyof typeof colorTokens.semantic
export type CulturalTheme = keyof typeof colorTokens.cultural