/**
 * Enhanced Dana Design System - Cultural Layout Variants
 * Language-specific layout adaptations for Buddhist monastery platform
 */

import { cva } from 'class-variance-authority'

// Cultural layout configuration
export interface CulturalLayoutConfig {
  locale: 'en' | 'si' | 'ta'
  direction: 'ltr' | 'rtl'
  typography: {
    headingSpacing: string
    paragraphSpacing: string
    lineHeight: string
    letterSpacing: string
    wordSpacing?: string
  }
  spacing: {
    componentGap: string
    sectionGap: string
    containerPadding: string
  }
  colors: {
    primary: string
    accent: string
    background: string
  }
}

// Cultural layout variants using CVA
export const culturalLayoutVariants = cva(
  // Base layout styles
  "w-full min-h-screen",
  {
    variants: {
      locale: {
        // English layout - standard Western layout
        en: "font-sans leading-normal tracking-normal",

        // Sinhala layout - optimized for Sinhala script
        si: "font-sinhala leading-relaxed tracking-wide word-spacing-wide",

        // Tamil layout - future support
        ta: "font-sans leading-normal tracking-normal",
      },

      direction: {
        ltr: "text-left [&_*]:text-left",
        rtl: "text-right [&_*]:text-right dir-rtl",
      },

      // Content density for different scripts
      density: {
        compact: "space-y-4 [&_section]:space-y-3",
        normal: "space-y-6 [&_section]:space-y-4",
        relaxed: "space-y-8 [&_section]:space-y-6",
        comfortable: "space-y-10 [&_section]:space-y-8", // For Sinhala
      },

      // Typography scale adaptation
      typographyScale: {
        standard: "",
        enlarged: "[&_h1]:text-6xl [&_h2]:text-5xl [&_h3]:text-4xl [&_p]:text-lg",
        sinhala: "[&_h1]:text-5xl [&_h2]:text-4xl [&_h3]:text-3xl [&_p]:text-base [&_p]:leading-loose",
      },

      // Container width adaptations
      containerWidth: {
        narrow: "max-w-4xl",
        normal: "max-w-6xl",
        wide: "max-w-7xl",
        full: "max-w-none",
      },
    },

    defaultVariants: {
      locale: "en",
      direction: "ltr",
      density: "normal",
      typographyScale: "standard",
      containerWidth: "normal",
    },

    compoundVariants: [
      // Sinhala-specific adaptations
      {
        locale: "si",
        density: "comfortable",
        typographyScale: "sinhala",
        className: "leading-loose word-spacing-wider letter-spacing-wide",
      },
      // Future Tamil adaptations
      {
        locale: "ta",
        direction: "ltr", // Tamil is LTR despite being an Indic script
        className: "leading-relaxed",
      },
    ],
  }
)

// Cultural section variants for different content types
export const culturalSectionVariants = cva(
  "w-full",
  {
    variants: {
      sectionType: {
        header: "py-8 md:py-12",
        content: "py-6 md:py-10",
        footer: "py-8 md:py-12",
        hero: "py-12 md:py-20 lg:py-24",
        feature: "py-10 md:py-16",
      },

      locale: {
        en: "",
        si: "py-8 md:py-14 space-y-8", // More vertical space for Sinhala
        ta: "",
      },

      alignment: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify", // Useful for Sinhala paragraphs
      },
    },

    defaultVariants: {
      sectionType: "content",
      locale: "en",
      alignment: "left",
    },

    compoundVariants: [
      {
        locale: "si",
        sectionType: "content",
        className: "space-y-10 [&_p]:mb-6",
      },
      {
        locale: "si",
        alignment: "justify",
        className: "[&_p]:text-justify [&_p]:hyphens-auto",
      },
    ],
  }
)

// Cultural grid variants for responsive layouts
export const culturalGridVariants = cva(
  "grid gap-6",
  {
    variants: {
      columns: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      },

      locale: {
        en: "",
        si: "gap-8 md:gap-10", // More spacing for Sinhala
        ta: "",
      },

      alignment: {
        start: "justify-items-start",
        center: "justify-items-center",
        end: "justify-items-end",
        stretch: "justify-items-stretch",
      },
    },

    defaultVariants: {
      columns: 3,
      locale: "en",
      alignment: "stretch",
    },
  }
)

// Cultural form layout variants
export const culturalFormVariants = cva(
  "space-y-6",
  {
    variants: {
      layout: {
        vertical: "flex flex-col",
        horizontal: "flex flex-row gap-4 items-end",
        grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
      },

      locale: {
        en: "",
        si: "space-y-8 [&_label]:mb-3 [&_input]:min-h-[3rem]", // Larger inputs for Sinhala
        ta: "",
      },

      fieldSpacing: {
        tight: "space-y-4",
        normal: "space-y-6",
        relaxed: "space-y-8",
        comfortable: "space-y-10", // For Sinhala forms
      },
    },

    defaultVariants: {
      layout: "vertical",
      locale: "en",
      fieldSpacing: "normal",
    },

    compoundVariants: [
      {
        locale: "si",
        fieldSpacing: "comfortable",
        className: "[&_label]:text-base [&_label]:font-medium [&_input]:text-base",
      },
    ],
  }
)

// Cultural navigation variants
export const culturalNavigationVariants = cva(
  "flex items-center",
  {
    variants: {
      orientation: {
        horizontal: "flex-row space-x-4",
        vertical: "flex-col space-y-2",
      },

      locale: {
        en: "",
        si: "space-x-6 [&_a]:px-4 [&_a]:py-3", // More padding for Sinhala nav items
        ta: "",
      },

      alignment: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
    },

    defaultVariants: {
      orientation: "horizontal",
      locale: "en",
      alignment: "start",
    },
  }
)

// Predefined cultural layout configurations
export const culturalConfigurations: Record<'en' | 'si' | 'ta', CulturalLayoutConfig> = {
  en: {
    locale: 'en',
    direction: 'ltr',
    typography: {
      headingSpacing: 'mb-4',
      paragraphSpacing: 'mb-6',
      lineHeight: 'leading-normal',
      letterSpacing: 'tracking-normal',
    },
    spacing: {
      componentGap: 'gap-6',
      sectionGap: 'space-y-12',
      containerPadding: 'px-4 sm:px-6 lg:px-8',
    },
    colors: {
      primary: 'var(--color-trust-500)',
      accent: 'var(--color-primary-500)',
      background: 'var(--color-neutral-50)',
    },
  },

  si: {
    locale: 'si',
    direction: 'ltr',
    typography: {
      headingSpacing: 'mb-6',
      paragraphSpacing: 'mb-8',
      lineHeight: 'leading-loose',
      letterSpacing: 'tracking-wide',
      wordSpacing: 'word-spacing-wide',
    },
    spacing: {
      componentGap: 'gap-8',
      sectionGap: 'space-y-16',
      containerPadding: 'px-6 sm:px-8 lg:px-10',
    },
    colors: {
      primary: 'var(--color-primary-500)',
      accent: 'var(--color-accent-500)',
      background: 'var(--color-accent-25)',
    },
  },

  ta: {
    locale: 'ta',
    direction: 'ltr',
    typography: {
      headingSpacing: 'mb-4',
      paragraphSpacing: 'mb-6',
      lineHeight: 'leading-relaxed',
      letterSpacing: 'tracking-normal',
    },
    spacing: {
      componentGap: 'gap-6',
      sectionGap: 'space-y-12',
      containerPadding: 'px-4 sm:px-6 lg:px-8',
    },
    colors: {
      primary: 'var(--color-spiritual-500)',
      accent: 'var(--color-primary-500)',
      background: 'var(--color-spiritual-25)',
    },
  },
}

// Utility functions for cultural layouts
export function getCulturalLayout(locale: 'en' | 'si' | 'ta') {
  return culturalConfigurations[locale]
}

export function generateCulturalClasses(locale: 'en' | 'si' | 'ta', options?: {
  density?: 'compact' | 'normal' | 'relaxed' | 'comfortable'
  typographyScale?: 'standard' | 'enlarged' | 'sinhala'
  containerWidth?: 'narrow' | 'normal' | 'wide' | 'full'
}) {
  const config = getCulturalLayout(locale)

  return culturalLayoutVariants({
    locale,
    direction: config.direction,
    density: options?.density || (locale === 'si' ? 'comfortable' : 'normal'),
    typographyScale: options?.typographyScale || (locale === 'si' ? 'sinhala' : 'standard'),
    containerWidth: options?.containerWidth || 'normal',
  })
}

// Cultural responsive breakpoints
export const culturalBreakpoints = {
  // Standard breakpoints
  standard: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Sinhala-optimized breakpoints (wider containers for readability)
  sinhala: {
    sm: '680px',
    md: '820px',
    lg: '1100px',
    xl: '1400px',
    '2xl': '1680px',
  },
} as const

export type CulturalBreakpoint = keyof typeof culturalBreakpoints.standard

// Export types
export type { CulturalLayoutConfig }
export type CulturalLocale = 'en' | 'si' | 'ta'
export type CulturalDirection = 'ltr' | 'rtl'
export type CulturalDensity = 'compact' | 'normal' | 'relaxed' | 'comfortable'