/**
 * Enhanced Dana Design System - Card Variants
 * Cultural and contextual card variants for Buddhist monastery platform
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Enhanced card variants with spiritual and cultural theming
export const cardVariants = cva(
  // Base styles with peaceful interactions
  "bg-card text-card-foreground rounded-2xl border transition-all duration-300 flex flex-col",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "border-border/50 shadow-md hover:shadow-xl hover:-translate-y-1",

        outlined:
          "border-border shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",

        elevated:
          "border-border/30 shadow-lg hover:shadow-xl hover:-translate-y-2",

        flat:
          "border-border/30 shadow-none hover:shadow-md hover:-translate-y-0.5",

        // NEW: Spiritual/Buddhist-inspired variants
        spiritual:
          "border-spiritual-200/50 bg-gradient-to-br from-spiritual-50/50 to-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-spiritual-300/50",

        monastery:
          "border-primary-200/50 bg-gradient-to-br from-primary-50/30 to-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-primary-300/50",

        trust:
          "border-trust-200/50 bg-gradient-to-br from-trust-50/30 to-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-trust-300/50",

        compassion:
          "border-compassion-200/50 bg-gradient-to-br from-compassion-50/30 to-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-compassion-300/50",

        // NEW: Context-specific variants
        donation:
          "border-trust-200/50 bg-gradient-to-br from-trust-50/20 via-white to-primary-50/20 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-trust-300/60",

        peaceful:
          "border-spiritual-100 bg-gradient-to-br from-spiritual-25 to-neutral-25 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-spiritual-200",

        // NEW: Lotus-inspired elegant cards
        lotus:
          "border-gradient-to-r from-spiritual-200 via-primary-200 to-accent-200 bg-gradient-to-br from-spiritual-25 via-white to-primary-25 shadow-lg hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden",

        enlightened:
          "border-primary-200/30 bg-gradient-to-br from-white via-primary-25/50 to-spiritual-25/50 shadow-md hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm",

        // NEW: Cultural variants
        sinhala:
          "border-accent-200/50 bg-gradient-to-br from-accent-25/30 to-white shadow-md hover:shadow-xl hover:-translate-y-1 font-sinhala",

        cultural:
          "border-secondary-200/50 bg-gradient-to-br from-secondary-50/20 to-white shadow-md hover:shadow-xl hover:-translate-y-1",

        // NEW: Interactive states
        interactive:
          "border-border/50 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20",

        glass:
          "border-white/20 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white/90",
      },

      size: {
        sm: "p-4 gap-3",
        default: "p-6 gap-4",
        lg: "p-8 gap-6",
        xl: "p-10 gap-8",
      },

      // NEW: Padding variants for different layouts
      padding: {
        none: "p-0",
        tight: "p-3",
        normal: "p-6",
        relaxed: "p-8",
        loose: "p-10",
      },

      // NEW: Animation intensity
      animation: {
        none: "transition-none",
        subtle: "transition-all duration-200",
        normal: "transition-all duration-300",
        enhanced: "transition-all duration-500",
        meditative: "transition-all duration-750",
      },

      // NEW: Cultural styling
      cultural: {
        universal: "",
        sinhala: "font-sinhala leading-relaxed",
        english: "font-sans leading-normal",
      },

      // NEW: Context-aware shadows
      context: {
        general: "",
        donation: "hover:shadow-trust/10",
        monastery: "hover:shadow-spiritual/10",
        spiritual: "hover:shadow-primary/10",
        admin: "hover:shadow-neutral/10",
      },

      // NEW: Layout orientation
      orientation: {
        vertical: "flex-col",
        horizontal: "flex-row items-center",
      },

      // NEW: Border radius variations
      radius: {
        none: "rounded-none",
        sm: "rounded-lg",
        default: "rounded-2xl",
        lg: "rounded-3xl",
        full: "rounded-full",
      },

      // NEW: Accessibility enhancements
      accessibility: {
        normal: "",
        "high-contrast": "border-2",
        "reduced-motion": "transition-none hover:transform-none",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      padding: "normal",
      animation: "normal",
      cultural: "universal",
      context: "general",
      orientation: "vertical",
      radius: "default",
      accessibility: "normal",
    },

    // Compound variants for specific combinations
    compoundVariants: [
      {
        variant: "spiritual",
        size: "lg",
        className: "shadow-lg hover:shadow-2xl",
      },
      {
        variant: "donation",
        animation: "enhanced",
        className: "hover:scale-[1.02]",
      },
      {
        variant: "lotus",
        size: ["lg", "xl"],
        className: "before:absolute before:inset-0 before:bg-gradient-to-r before:from-spiritual-100/20 before:via-transparent before:to-primary-100/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      },
      {
        cultural: "sinhala",
        size: ["lg", "xl"],
        className: "leading-loose tracking-wide",
      },
      {
        context: "spiritual",
        animation: "meditative",
        className: "hover:shadow-spiritual-200/30",
      },
      {
        orientation: "horizontal",
        size: "default",
        className: "gap-6",
      },
      {
        accessibility: "reduced-motion",
        animation: ["enhanced", "meditative"],
        className: "transition-none transform-none",
      },
    ],
  }
)

// Enhanced card sub-component variants
export const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto]",
  {
    variants: {
      spacing: {
        tight: "gap-1 px-4 pb-3",
        normal: "gap-1.5 px-6 pb-4",
        relaxed: "gap-2 px-8 pb-6",
      },
      border: {
        none: "",
        bottom: "border-b border-border/50 pb-4",
      },
    },
    defaultVariants: {
      spacing: "normal",
      border: "none",
    },
  }
)

export const cardContentVariants = cva(
  "",
  {
    variants: {
      spacing: {
        tight: "px-4",
        normal: "px-6",
        relaxed: "px-8",
        none: "px-0",
      },
    },
    defaultVariants: {
      spacing: "normal",
    },
  }
)

export const cardFooterVariants = cva(
  "flex items-center",
  {
    variants: {
      spacing: {
        tight: "px-4 pt-3",
        normal: "px-6 pt-4",
        relaxed: "px-8 pt-6",
      },
      border: {
        none: "",
        top: "border-t border-border/50 pt-4",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
      },
    },
    defaultVariants: {
      spacing: "normal",
      border: "none",
      justify: "start",
    },
  }
)

// Enhanced card props types
export type CardVariantProps = VariantProps<typeof cardVariants>
export type CardHeaderVariantProps = VariantProps<typeof cardHeaderVariants>
export type CardContentVariantProps = VariantProps<typeof cardContentVariants>
export type CardFooterVariantProps = VariantProps<typeof cardFooterVariants>

// Preset card configurations for common use cases
export const cardPresets = {
  // Monastery cards
  monasteryCard: {
    variant: "monastery" as const,
    size: "lg" as const,
    animation: "meditative" as const,
    context: "monastery" as const,
    radius: "lg" as const,
  },

  // Donation cards
  donationCard: {
    variant: "donation" as const,
    size: "default" as const,
    animation: "enhanced" as const,
    context: "donation" as const,
  },

  // Spiritual content cards
  spiritualCard: {
    variant: "spiritual" as const,
    size: "default" as const,
    animation: "meditative" as const,
    context: "spiritual" as const,
  },

  // Feature cards with lotus inspiration
  lotusFeatureCard: {
    variant: "lotus" as const,
    size: "lg" as const,
    animation: "enhanced" as const,
  },

  // Trust-building cards
  trustCard: {
    variant: "trust" as const,
    size: "default" as const,
    animation: "normal" as const,
    context: "donation" as const,
  },

  // Peaceful info cards
  peacefulCard: {
    variant: "peaceful" as const,
    size: "default" as const,
    animation: "subtle" as const,
    context: "spiritual" as const,
  },

  // Interactive cards for selections
  interactiveCard: {
    variant: "interactive" as const,
    size: "default" as const,
    animation: "normal" as const,
  },

  // Cultural Sinhala cards
  sinhalaCard: {
    variant: "sinhala" as const,
    cultural: "sinhala" as const,
    size: "default" as const,
  },

  // Admin dashboard cards
  adminCard: {
    variant: "outlined" as const,
    size: "default" as const,
    context: "admin" as const,
  },

  // Glass effect cards
  glassCard: {
    variant: "glass" as const,
    size: "default" as const,
    animation: "subtle" as const,
  },
} as const

export type CardPreset = keyof typeof cardPresets