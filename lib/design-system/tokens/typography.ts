/**
 * Enhanced Dana Design System - Typography Tokens
 * Supports multilingual typography with cultural sensitivity
 */

// Base typography scale using harmonious ratios
export const typographyTokens = {
  // Font families with cultural support
  fontFamily: {
    sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
    mono: ["var(--font-geist-mono)", "Consolas", "monospace"],

    // Sinhala typography with proper fallbacks
    sinhala: [
      "var(--font-sinhala)",
      "'Noto Sans Sinhala'",
      "'Abhaya Libre'",
      "'Sinhala MN'",
      "'Iskoola Pota'",
      "sans-serif"
    ],

    sinhalaSer: [
      "var(--font-sinhala-serif)",
      "'Abhaya Libre'",
      "'Noto Serif Sinhala'",
      "serif"
    ],
  },

  // Font weights optimized for readability
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  // Type scale using harmonious ratios (1.25 - Major Third)
  fontSize: {
    // Body text sizes
    xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.025em" }],      // 12px
    sm: ["0.875rem", { lineHeight: "1.6", letterSpacing: "0.025em" }],     // 14px
    base: ["1rem", { lineHeight: "1.6", letterSpacing: "0.01em" }],        // 16px
    lg: ["1.125rem", { lineHeight: "1.6", letterSpacing: "0.01em" }],      // 18px
    xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "0.005em" }],      // 20px

    // Heading sizes
    "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "0" }],          // 24px
    "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],   // 36px
    "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],     // 48px
    "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.02em" }],     // 60px
    "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.025em" }],     // 72px
  },

  // Line heights for different contexts
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Letter spacing for fine typography control
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Cultural typography adjustments
  cultural: {
    sinhala: {
      lineHeight: "1.75", // Increased for Sinhala script
      letterSpacing: "0.01em",
      wordSpacing: "0.05em",
    },
    english: {
      lineHeight: "1.6",
      letterSpacing: "0",
      wordSpacing: "0",
    },
  },
} as const

// Semantic typography scales for different components
export const typographyRoles = {
  // Heading hierarchy
  display: {
    fontSize: "7xl",
    fontWeight: "bold",
    lineHeight: "none",
    letterSpacing: "tighter",
  },

  h1: {
    fontSize: "5xl",
    fontWeight: "bold",
    lineHeight: "tight",
    letterSpacing: "tight",
  },

  h2: {
    fontSize: "4xl",
    fontWeight: "semibold",
    lineHeight: "tight",
    letterSpacing: "tight",
  },

  h3: {
    fontSize: "3xl",
    fontWeight: "semibold",
    lineHeight: "snug",
    letterSpacing: "normal",
  },

  h4: {
    fontSize: "2xl",
    fontWeight: "semibold",
    lineHeight: "snug",
    letterSpacing: "normal",
  },

  h5: {
    fontSize: "xl",
    fontWeight: "medium",
    lineHeight: "normal",
    letterSpacing: "normal",
  },

  h6: {
    fontSize: "lg",
    fontWeight: "medium",
    lineHeight: "normal",
    letterSpacing: "normal",
  },

  // Body text variations
  body: {
    fontSize: "base",
    fontWeight: "normal",
    lineHeight: "relaxed",
    letterSpacing: "normal",
  },

  bodyLarge: {
    fontSize: "lg",
    fontWeight: "normal",
    lineHeight: "relaxed",
    letterSpacing: "wide",
  },

  bodySmall: {
    fontSize: "sm",
    fontWeight: "normal",
    lineHeight: "normal",
    letterSpacing: "wide",
  },

  // Component-specific typography
  caption: {
    fontSize: "xs",
    fontWeight: "medium",
    lineHeight: "normal",
    letterSpacing: "wide",
  },

  label: {
    fontSize: "sm",
    fontWeight: "medium",
    lineHeight: "normal",
    letterSpacing: "wide",
  },

  button: {
    fontSize: "sm",
    fontWeight: "medium",
    lineHeight: "none",
    letterSpacing: "wide",
  },

  overline: {
    fontSize: "xs",
    fontWeight: "semibold",
    lineHeight: "normal",
    letterSpacing: "widest",
    textTransform: "uppercase" as const,
  },

  // Cultural variants
  cultural: {
    sinhalaHeading: {
      fontFamily: "sinhalaSer",
      fontWeight: "bold",
      lineHeight: "1.4",
      letterSpacing: "normal",
    },

    sinhalaBody: {
      fontFamily: "sinhala",
      lineHeight: "1.75",
      letterSpacing: "0.01em",
      wordSpacing: "0.05em",
    },
  },
} as const

// Utility functions for typography
export function getTypographyClass(role: keyof typeof typographyRoles): string {
  const styles = typographyRoles[role]
  if (!styles) return ""

  const classes = []

  if (styles.fontSize) classes.push(`text-${styles.fontSize}`)
  if (styles.fontWeight) classes.push(`font-${styles.fontWeight}`)
  if (styles.lineHeight) classes.push(`leading-${styles.lineHeight}`)
  if (styles.letterSpacing) classes.push(`tracking-${styles.letterSpacing}`)

  return classes.join(" ")
}

export function getCulturalTypography(locale: "en" | "si" | "ta"): {
  headingClass: string
  bodyClass: string
  adjustments: typeof typographyTokens.cultural.sinhala
} {
  switch (locale) {
    case "si":
      return {
        headingClass: "font-sinhala-serif",
        bodyClass: "font-sinhala",
        adjustments: typographyTokens.cultural.sinhala,
      }
    case "en":
    case "ta":
    default:
      return {
        headingClass: "font-sans",
        bodyClass: "font-sans",
        adjustments: typographyTokens.cultural.english,
      }
  }
}

// Export individual scales
export const {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  cultural,
} = typographyTokens

export type FontFamily = keyof typeof typographyTokens.fontFamily
export type FontWeight = keyof typeof typographyTokens.fontWeight
export type FontSize = keyof typeof typographyTokens.fontSize
export type TypographyRole = keyof typeof typographyRoles