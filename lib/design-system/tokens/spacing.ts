/**
 * Enhanced Dana Design System - Spacing Tokens
 * Consistent spacing system for layouts and components
 */

// Base spacing scale using 0.25rem (4px) increments
export const spacingTokens = {
  // Core spacing scale
  px: "1px",
  0: "0px",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  3.5: "0.875rem",  // 14px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  7: "1.75rem",     // 28px
  8: "2rem",        // 32px
  9: "2.25rem",     // 36px
  10: "2.5rem",     // 40px
  11: "2.75rem",    // 44px
  12: "3rem",       // 48px
  14: "3.5rem",     // 56px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
  28: "7rem",       // 112px
  32: "8rem",       // 128px
  36: "9rem",       // 144px
  40: "10rem",      // 160px
  44: "11rem",      // 176px
  48: "12rem",      // 192px
  52: "13rem",      // 208px
  56: "14rem",      // 224px
  60: "15rem",      // 240px
  64: "16rem",      // 256px
  72: "18rem",      // 288px
  80: "20rem",      // 320px
  96: "24rem",      // 384px
} as const

// Component-specific spacing patterns
export const spacingRoles = {
  // Component internal spacing
  component: {
    tight: spacingTokens[2],     // 8px
    normal: spacingTokens[4],    // 16px
    relaxed: spacingTokens[6],   // 24px
    loose: spacingTokens[8],     // 32px
  },

  // Layout spacing
  layout: {
    xs: spacingTokens[4],        // 16px
    sm: spacingTokens[6],        // 24px
    md: spacingTokens[8],        // 32px
    lg: spacingTokens[12],       // 48px
    xl: spacingTokens[16],       // 64px
    "2xl": spacingTokens[20],    // 80px
    "3xl": spacingTokens[24],    // 96px
    "4xl": spacingTokens[32],    // 128px
  },

  // Container padding
  container: {
    mobile: spacingTokens[4],    // 16px
    tablet: spacingTokens[6],    // 24px
    desktop: spacingTokens[8],   // 32px
  },

  // Card spacing
  card: {
    padding: spacingTokens[6],   // 24px
    gap: spacingTokens[4],       // 16px
    headerGap: spacingTokens[2], // 8px
  },

  // Form spacing
  form: {
    fieldGap: spacingTokens[4],  // 16px
    labelGap: spacingTokens[1.5], // 6px
    groupGap: spacingTokens[6],  // 24px
  },

  // Button spacing
  button: {
    padding: {
      sm: {
        x: spacingTokens[3],     // 12px
        y: spacingTokens[2],     // 8px
      },
      md: {
        x: spacingTokens[4],     // 16px
        y: spacingTokens[2.5],   // 10px
      },
      lg: {
        x: spacingTokens[6],     // 24px
        y: spacingTokens[3],     // 12px
      },
    },
    gap: spacingTokens[2],       // 8px
  },

  // Navigation spacing
  navigation: {
    itemGap: spacingTokens[1],   // 4px
    sectionGap: spacingTokens[6], // 24px
    padding: spacingTokens[4],   // 16px
  },

  // Cultural spacing adjustments
  cultural: {
    sinhala: {
      lineSpacing: spacingTokens[1], // Additional line spacing for Sinhala
      wordSpacing: spacingTokens[0.5], // Word spacing adjustment
    },
    standard: {
      lineSpacing: spacingTokens[0],
      wordSpacing: spacingTokens[0],
    },
  },
} as const

// Border radius scale for consistent rounded corners
export const radiusTokens = {
  none: "0px",
  sm: "0.25rem",      // 4px
  md: "0.375rem",     // 6px
  lg: "0.5rem",       // 8px
  xl: "0.75rem",      // 12px - Default from globals.css
  "2xl": "1rem",      // 16px
  "3xl": "1.5rem",    // 24px
  full: "9999px",
} as const

// Component radius roles
export const radiusRoles = {
  button: radiusTokens.lg,      // 8px
  card: radiusTokens["2xl"],    // 16px - Matches globals.css dana-card
  input: radiusTokens.lg,       // 8px
  badge: radiusTokens.full,     // Full rounded
  modal: radiusTokens.xl,       // 12px
  tooltip: radiusTokens.md,     // 6px
} as const

// Shadow tokens for depth and elevation
export const shadowTokens = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

  // Cultural context shadows using OKLCH
  elegant: "0 4px 6px oklch(0 0 0 / 0.05), 0 1px 3px oklch(0 0 0 / 0.1)",
  elegantLg: "0 10px 15px oklch(0 0 0 / 0.1), 0 4px 6px oklch(0 0 0 / 0.05)",
} as const

// Z-index scale for layering
export const zIndexTokens = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// Utility functions
export function getSpacing(key: keyof typeof spacingTokens): string {
  return spacingTokens[key]
}

export function getRadius(key: keyof typeof radiusTokens): string {
  return radiusTokens[key]
}

export function getShadow(key: keyof typeof shadowTokens): string {
  return shadowTokens[key]
}

export function getZIndex(key: keyof typeof zIndexTokens): string | number {
  return zIndexTokens[key]
}

// Export all tokens
export const {
  component,
  layout,
  container,
  card,
  form,
  button,
  navigation,
  cultural,
} = spacingRoles

export type SpacingToken = keyof typeof spacingTokens
export type SpacingRole = keyof typeof spacingRoles
export type RadiusToken = keyof typeof radiusTokens
export type ShadowToken = keyof typeof shadowTokens
export type ZIndexToken = keyof typeof zIndexTokens