/**
 * Enhanced Dana Design System - Cultural System Index
 * Central export for cultural adaptations and language-specific variants
 */

// Export layout variants
export {
  culturalLayoutVariants,
  culturalSectionVariants,
  culturalGridVariants,
  culturalFormVariants,
  culturalNavigationVariants,
  culturalConfigurations,
  culturalBreakpoints,
  getCulturalLayout,
  generateCulturalClasses,
  type CulturalLayoutConfig,
  type CulturalLocale,
  type CulturalDirection,
  type CulturalDensity,
  type CulturalBreakpoint,
} from './layout-variants'

// Export typography helpers
export {
  culturalFonts,
  culturalTypographyAdjustments,
  getFontFeatureSettings,
  getCulturalFontFamily,
  getCulturalFontSize,
  getCulturalLineHeight,
  getCulturalLetterSpacing,
  getCulturalWordSpacing,
  generateCulturalTypographyCSS,
  getTextDirection,
  getOptimalTextAlignment,
  getOptimalReadingWidth,
  getOptimalParagraphSpacing,
  type FontVariant,
  type FontSize,
  type LineHeightVariant,
  type LetterSpacingVariant,
  type WordSpacingVariant,
  type DeviceType,
  type ContentType,
  type TextAlignment,
} from './typography-helpers'

// Unified cultural system utilities
export function createCulturalContext(locale: CulturalLocale, options?: {
  density?: CulturalDensity
  containerWidth?: 'narrow' | 'normal' | 'wide' | 'full'
  deviceType?: DeviceType
}) {
  const layout = getCulturalLayout(locale)
  const typographyCSS = generateCulturalTypographyCSS(locale)

  return {
    locale,
    layout,
    typography: typographyCSS,
    classes: generateCulturalClasses(locale, options),
    fonts: {
      primary: getCulturalFontFamily(locale, 'primary'),
      serif: getCulturalFontFamily(locale, 'serif'),
    },
    features: getFontFeatureSettings(locale),
    direction: getTextDirection(locale),
    readingWidth: getOptimalReadingWidth(locale),
    paragraphSpacing: getOptimalParagraphSpacing(locale),
  }
}

// Cultural component presets
export const culturalPresets = {
  // English presets
  english: {
    layout: {
      locale: 'en' as const,
      density: 'normal' as const,
      typographyScale: 'standard' as const,
    },
    typography: {
      fontFamily: culturalFonts.english.primary.join(', '),
      lineHeight: culturalTypographyAdjustments.english.lineHeight.normal,
      letterSpacing: culturalTypographyAdjustments.english.letterSpacing.normal,
    },
  },

  // Sinhala presets
  sinhala: {
    layout: {
      locale: 'si' as const,
      density: 'comfortable' as const,
      typographyScale: 'sinhala' as const,
    },
    typography: {
      fontFamily: culturalFonts.sinhala.primary.join(', '),
      lineHeight: culturalTypographyAdjustments.sinhala.lineHeight.normal,
      letterSpacing: culturalTypographyAdjustments.sinhala.letterSpacing.normal,
      wordSpacing: culturalTypographyAdjustments.sinhala.wordSpacing.normal,
    },
  },

  // Tamil presets (future support)
  tamil: {
    layout: {
      locale: 'ta' as const,
      density: 'normal' as const,
      typographyScale: 'standard' as const,
    },
    typography: {
      fontFamily: culturalFonts.tamil.primary.join(', '),
      lineHeight: culturalTypographyAdjustments.tamil.lineHeight.normal,
      letterSpacing: culturalTypographyAdjustments.tamil.letterSpacing.normal,
    },
  },
} as const

// Cultural responsive utilities
export function getCulturalBreakpoint(
  locale: CulturalLocale,
  breakpoint: CulturalBreakpoint
): string {
  if (locale === 'si') {
    return culturalBreakpoints.sinhala[breakpoint]
  }
  return culturalBreakpoints.standard[breakpoint]
}

// Cultural spacing utilities
export function getCulturalSpacing(
  locale: CulturalLocale,
  type: 'component' | 'section' | 'container' | 'paragraph'
): string {
  const config = getCulturalLayout(locale)

  switch (type) {
    case 'component':
      return config.spacing.componentGap
    case 'section':
      return config.spacing.sectionGap
    case 'container':
      return config.spacing.containerPadding
    case 'paragraph':
      return getOptimalParagraphSpacing(locale)
    default:
      return config.spacing.componentGap
  }
}

// Cultural color utilities
export function getCulturalColors(locale: CulturalLocale) {
  const config = getCulturalLayout(locale)
  return config.colors
}

// Accessibility helpers for cultural contexts
export function getCulturalAccessibilityProps(
  locale: CulturalLocale,
  contentType: ContentType = 'paragraph'
) {
  return {
    lang: locale,
    dir: getTextDirection(locale),
    'aria-label': contentType === 'paragraph' ? undefined : `${contentType} in ${locale}`,
    style: {
      fontFeatureSettings: getFontFeatureSettings(locale),
      textAlign: getOptimalTextAlignment(locale, contentType),
    },
  }
}

// Cultural validation utilities
export function validateCulturalSupport(locale: string): locale is CulturalLocale {
  return ['en', 'si', 'ta'].includes(locale)
}

export function getCulturalFallback(locale: string): CulturalLocale {
  if (validateCulturalSupport(locale)) {
    return locale
  }
  return 'en' // Default fallback
}

// Export constants for easy reference
export const CULTURAL_CONSTANTS = {
  SUPPORTED_LOCALES: ['en', 'si', 'ta'] as const,
  DEFAULT_LOCALE: 'en' as const,
  RTL_LOCALES: [] as const, // None currently, but extensible
  SCRIPT_TYPES: {
    latin: ['en'],
    sinhala: ['si'],
    tamil: ['ta'],
  } as const,
  DENSITY_RECOMMENDATIONS: {
    en: 'normal' as const,
    si: 'comfortable' as const,
    ta: 'normal' as const,
  },
} as const

// Export all types for convenience
export type {
  CulturalLocale,
  CulturalDirection,
  CulturalDensity,
  CulturalBreakpoint,
  CulturalLayoutConfig,
  FontVariant,
  FontSize,
  LineHeightVariant,
  LetterSpacingVariant,
  WordSpacingVariant,
  DeviceType,
  ContentType,
  TextAlignment,
}