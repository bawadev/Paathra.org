/**
 * Enhanced Dana Design System - Cultural Typography Helpers
 * Typography utilities for multilingual Buddhist monastery platform
 */

// Font loading and optimization utilities
export const culturalFonts = {
  sinhala: {
    primary: [
      'var(--font-sinhala)',
      "'Noto Sans Sinhala'",
      "'Abhaya Libre'",
      "'Sinhala MN'",
      "'Iskoola Pota'",
      'sans-serif'
    ],
    serif: [
      'var(--font-sinhala-serif)',
      "'Abhaya Libre'",
      "'Noto Serif Sinhala'",
      "'Sinhala MN'",
      'serif'
    ],
    features: {
      liga: true,     // Ligatures for proper script rendering
      kern: true,     // Kerning for better spacing
      calt: true,     // Contextual alternates
      akhn: true,     // Akhand forms for Sinhala
    },
  },

  english: {
    primary: [
      'var(--font-geist-sans)',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif'
    ],
    serif: [
      'var(--font-geist-serif)',
      'Georgia',
      'Times New Roman',
      'serif'
    ],
    features: {
      liga: true,
      kern: true,
      calt: true,
    },
  },

  tamil: {
    primary: [
      "'Noto Sans Tamil'",
      "'Tamil MN'",
      "'Tamil Sangam MN'",
      'sans-serif'
    ],
    serif: [
      "'Noto Serif Tamil'",
      "'Tamil MN'",
      'serif'
    ],
    features: {
      liga: true,
      kern: true,
      calt: true,
      akhn: true,
    },
  },
} as const

// Cultural typography adjustments
export const culturalTypographyAdjustments = {
  sinhala: {
    // Increased line height for complex script
    lineHeight: {
      tight: 1.5,
      normal: 1.75,
      relaxed: 2.0,
      loose: 2.25,
    },

    // Letter spacing for better readability
    letterSpacing: {
      tight: '0.005em',
      normal: '0.01em',
      wide: '0.025em',
      wider: '0.05em',
    },

    // Word spacing for script characteristics
    wordSpacing: {
      normal: '0.05em',
      wide: '0.1em',
      wider: '0.15em',
    },

    // Font sizes optimized for Sinhala
    fontSize: {
      xs: '0.8rem',    // 12.8px
      sm: '0.95rem',   // 15.2px
      base: '1.1rem',  // 17.6px - larger base for readability
      lg: '1.3rem',    // 20.8px
      xl: '1.5rem',    // 24px
      '2xl': '1.8rem', // 28.8px
      '3xl': '2.2rem', // 35.2px
      '4xl': '2.8rem', // 44.8px
      '5xl': '3.5rem', // 56px
    },

    // Responsive scaling
    responsive: {
      mobile: 0.95,   // Slightly smaller on mobile
      tablet: 1.0,    // Base size on tablet
      desktop: 1.05,  // Slightly larger on desktop
    },
  },

  english: {
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2.0,
    },

    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
    },

    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },

    responsive: {
      mobile: 1.0,
      tablet: 1.0,
      desktop: 1.0,
    },
  },

  tamil: {
    lineHeight: {
      tight: 1.4,
      normal: 1.6,
      relaxed: 1.8,
      loose: 2.0,
    },

    letterSpacing: {
      tight: '0em',
      normal: '0.01em',
      wide: '0.02em',
      wider: '0.04em',
    },

    fontSize: {
      xs: '0.8rem',
      sm: '0.9rem',
      base: '1.05rem',
      lg: '1.2rem',
      xl: '1.4rem',
      '2xl': '1.7rem',
      '3xl': '2.1rem',
      '4xl': '2.6rem',
      '5xl': '3.2rem',
    },

    responsive: {
      mobile: 0.95,
      tablet: 1.0,
      desktop: 1.05,
    },
  },
} as const

// Typography utility functions
export function getFontFeatureSettings(locale: 'en' | 'si' | 'ta'): string {
  const features = culturalFonts[locale].features

  return Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => `"${feature}" 1`)
    .join(', ')
}

export function getCulturalFontFamily(
  locale: 'en' | 'si' | 'ta',
  variant: 'primary' | 'serif' = 'primary'
): string {
  return culturalFonts[locale][variant].join(', ')
}

export function getCulturalFontSize(
  locale: 'en' | 'si' | 'ta',
  size: keyof typeof culturalTypographyAdjustments.english.fontSize,
  deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): string {
  const baseSize = culturalTypographyAdjustments[locale].fontSize[size]
  const scale = culturalTypographyAdjustments[locale].responsive[deviceType]

  // Convert rem to number, apply scale, convert back
  const remValue = parseFloat(baseSize.replace('rem', ''))
  const scaledValue = remValue * scale

  return `${scaledValue}rem`
}

export function getCulturalLineHeight(
  locale: 'en' | 'si' | 'ta',
  variant: 'tight' | 'normal' | 'relaxed' | 'loose' = 'normal'
): number {
  return culturalTypographyAdjustments[locale].lineHeight[variant]
}

export function getCulturalLetterSpacing(
  locale: 'en' | 'si' | 'ta',
  variant: 'tight' | 'normal' | 'wide' | 'wider' = 'normal'
): string {
  return culturalTypographyAdjustments[locale].letterSpacing[variant]
}

export function getCulturalWordSpacing(
  locale: 'en' | 'si' | 'ta',
  variant: 'normal' | 'wide' | 'wider' = 'normal'
): string | undefined {
  const adjustments = culturalTypographyAdjustments[locale]

  // Only Sinhala and Tamil have word spacing adjustments
  if ('wordSpacing' in adjustments) {
    return adjustments.wordSpacing[variant]
  }

  return undefined
}

// CSS custom properties generator for cultural typography
export function generateCulturalTypographyCSS(locale: 'en' | 'si' | 'ta'): Record<string, string> {
  const adjustments = culturalTypographyAdjustments[locale]
  const fonts = culturalFonts[locale]

  const css: Record<string, string> = {
    '--font-cultural-primary': fonts.primary.join(', '),
    '--font-cultural-serif': fonts.serif.join(', '),
    '--font-feature-settings': getFontFeatureSettings(locale),
    '--line-height-cultural': String(adjustments.lineHeight.normal),
    '--letter-spacing-cultural': adjustments.letterSpacing.normal,
  }

  // Add word spacing for scripts that need it
  const wordSpacing = getCulturalWordSpacing(locale)
  if (wordSpacing) {
    css['--word-spacing-cultural'] = wordSpacing
  }

  // Add responsive font sizes
  Object.entries(adjustments.fontSize).forEach(([size, value]) => {
    css[`--font-size-${size}-cultural`] = value
  })

  return css
}

// Text direction and alignment utilities
export function getTextDirection(locale: 'en' | 'si' | 'ta'): 'ltr' | 'rtl' {
  // All supported languages are LTR
  // This is extensible for future RTL language support
  return 'ltr'
}

export function getOptimalTextAlignment(
  locale: 'en' | 'si' | 'ta',
  contentType: 'heading' | 'paragraph' | 'caption' | 'button' = 'paragraph'
): 'left' | 'right' | 'center' | 'justify' {
  switch (contentType) {
    case 'heading':
      return locale === 'si' ? 'center' : 'left'
    case 'paragraph':
      return locale === 'si' ? 'justify' : 'left'
    case 'caption':
      return 'left'
    case 'button':
      return 'center'
    default:
      return 'left'
  }
}

// Reading experience optimizations
export function getOptimalReadingWidth(locale: 'en' | 'si' | 'ta'): string {
  switch (locale) {
    case 'si':
      return '70ch' // Wider for Sinhala script
    case 'ta':
      return '65ch' // Slightly wider for Tamil
    case 'en':
    default:
      return '60ch' // Standard for English
  }
}

export function getOptimalParagraphSpacing(locale: 'en' | 'si' | 'ta'): string {
  switch (locale) {
    case 'si':
      return '2rem' // More space between paragraphs
    case 'ta':
      return '1.5rem'
    case 'en':
    default:
      return '1rem'
  }
}

// Export types
export type CulturalLocale = 'en' | 'si' | 'ta'
export type FontVariant = 'primary' | 'serif'
export type FontSize = keyof typeof culturalTypographyAdjustments.english.fontSize
export type LineHeightVariant = 'tight' | 'normal' | 'relaxed' | 'loose'
export type LetterSpacingVariant = 'tight' | 'normal' | 'wide' | 'wider'
export type WordSpacingVariant = 'normal' | 'wide' | 'wider'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type ContentType = 'heading' | 'paragraph' | 'caption' | 'button'
export type TextAlignment = 'left' | 'right' | 'center' | 'justify'