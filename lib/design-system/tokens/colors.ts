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

/**
 * Status Colors - Brand-aligned color mappings for semantic states
 */
export const statusColors = {
  // Success states: approved, delivered, confirmed, available
  success: {
    bg: 'bg-compassion-50',
    bgMedium: 'bg-compassion-100',
    text: 'text-compassion-700',
    textStrong: 'text-compassion-800',
    border: 'border-compassion-200',
    icon: 'text-compassion-600',
    gradient: 'from-compassion-500 to-compassion-600',
    badge: 'bg-compassion-50 text-compassion-900 border-compassion-300',
  },

  // Pending/Warning states: pending approval, needs attention
  pending: {
    bg: 'bg-primary-50',
    bgMedium: 'bg-primary-100',
    text: 'text-primary-700',
    textStrong: 'text-primary-800',
    border: 'border-primary-200',
    icon: 'text-primary-600',
    gradient: 'from-primary-500 to-primary-600',
    badge: 'bg-primary-50 text-primary-900 border-primary-300',
  },

  // Info/Trust states: information, links, trust signals
  info: {
    bg: 'bg-trust-50',
    bgMedium: 'bg-trust-100',
    text: 'text-trust-700',
    textStrong: 'text-trust-800',
    border: 'border-trust-200',
    icon: 'text-trust-600',
    gradient: 'from-trust-500 to-trust-600',
    badge: 'bg-trust-50 text-trust-900 border-trust-300',
  },

  // Error/Destructive states: cancelled, rejected, errors
  error: {
    bg: 'bg-accent-50',
    bgMedium: 'bg-accent-100',
    text: 'text-accent-700',
    textStrong: 'text-accent-800',
    border: 'border-accent-200',
    icon: 'text-accent-600',
    gradient: 'from-accent-500 to-accent-600',
    badge: 'bg-accent-50 text-accent-900 border-accent-300',
  },

  // Limited/Warning states: limited availability, caution
  limited: {
    bg: 'bg-accent-50',
    bgMedium: 'bg-accent-100',
    text: 'text-accent-600',
    textStrong: 'text-accent-700',
    border: 'border-accent-200',
    icon: 'text-accent-500',
    gradient: 'from-accent-400 to-accent-500',
    badge: 'bg-accent-100 text-accent-700 border-accent-200',
  },

  // Special/Highlighted states: special days, featured items
  special: {
    bg: 'bg-spiritual-50',
    bgMedium: 'bg-spiritual-100',
    text: 'text-spiritual-700',
    textStrong: 'text-spiritual-800',
    border: 'border-spiritual-200',
    icon: 'text-spiritual-600',
    gradient: 'from-spiritual-500 to-spiritual-600',
    badge: 'bg-spiritual-50 text-spiritual-900 border-spiritual-300',
  },
} as const

/**
 * Booking Status Color Mapping
 */
export const bookingStatusColors = {
  pending: statusColors.pending,
  monastery_approved: statusColors.pending,
  confirmed: statusColors.info,
  delivered: statusColors.success,
  not_delivered: statusColors.error,
  cancelled: statusColors.error,
} as const

/**
 * Monastery Approval Status Colors
 */
export const monasteryStatusColors = {
  approved: statusColors.success,
  pending: statusColors.pending,
  rejected: statusColors.error,
} as const

/**
 * User Role Colors
 */
export const userRoleColors = {
  super_admin: statusColors.special,
  monastery_admin: statusColors.info,
  donor: statusColors.success,
} as const

/**
 * Slot Availability Colors
 */
export const slotAvailabilityColors = {
  available: statusColors.success,
  limited: statusColors.limited,
  full: {
    bg: 'bg-neutral-100',
    bgMedium: 'bg-neutral-200',
    text: 'text-neutral-600',
    textStrong: 'text-neutral-700',
    border: 'border-neutral-300',
    icon: 'text-neutral-500',
    badge: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  },
} as const

/**
 * Brand Gradients
 */
export const brandGradients = {
  primary: 'from-[#D4A574] to-[#EA8B6F]',
  primaryLight: 'from-primary-500 to-accent-500',
  backgroundWarm: 'from-primary-50/30 via-accent-50/20 to-neutral-50',
  backgroundSubtle: 'from-primary-50/50 to-accent-50/30',
  success: 'from-compassion-500 to-compassion-600',
  successLight: 'from-compassion-50 to-compassion-100',
  info: 'from-trust-500 to-trust-600',
  infoLight: 'from-trust-50 to-trust-100',
  spiritual: 'from-spiritual-500 to-spiritual-600',
  spiritualLight: 'from-spiritual-50 to-spiritual-100',
} as const

/**
 * Statistics Card Colors
 */
export const statsCardColors = {
  donations: {
    bg: brandGradients.successLight,
    icon: statusColors.success.gradient,
    text: statusColors.success.textStrong,
    textMuted: statusColors.success.text,
  },
  monasteries: {
    bg: brandGradients.infoLight,
    icon: statusColors.info.gradient,
    text: statusColors.info.textStrong,
    textMuted: statusColors.info.text,
  },
  donors: {
    bg: brandGradients.spiritualLight,
    icon: statusColors.special.gradient,
    text: statusColors.special.textStrong,
    textMuted: statusColors.special.text,
  },
  meals: {
    bg: brandGradients.successLight,
    icon: statusColors.success.gradient,
    text: statusColors.success.textStrong,
    textMuted: statusColors.success.text,
  },
} as const

/**
 * Helper Functions
 */
export function getBookingStatusColor(status: keyof typeof bookingStatusColors) {
  return bookingStatusColors[status] || statusColors.pending
}

export function getMonasteryStatusColor(status: keyof typeof monasteryStatusColors) {
  return monasteryStatusColors[status] || statusColors.pending
}

export function getUserRoleColor(role: keyof typeof userRoleColors) {
  return userRoleColors[role] || statusColors.info
}

export function getSlotAvailabilityColor(availability: keyof typeof slotAvailabilityColors) {
  return slotAvailabilityColors[availability] || slotAvailabilityColors.full
}

export type BookingStatus = keyof typeof bookingStatusColors
export type MonasteryStatus = keyof typeof monasteryStatusColors
export type UserRole = keyof typeof userRoleColors
export type SlotAvailability = keyof typeof slotAvailabilityColors