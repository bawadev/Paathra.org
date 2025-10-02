/**
 * Enhanced Dana Design System - Button Variants
 * Extended button variants for cultural and contextual theming
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Enhanced button variants with cultural and contextual support
export const buttonVariants = cva(
  // Base styles with spiritual-inspired interactions
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Core variants enhanced with subtle elevation
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",

        outline:
          "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50",

        secondary:
          "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 active:translate-y-0",

        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",

        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto min-h-0 hover:text-primary/80",

        // NEW: Spiritual/Buddhist-inspired variants
        spiritual:
          "bg-spiritual-500 text-white hover:bg-spiritual/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-spiritual-300",

        trust:
          "bg-trust-500 text-white hover:bg-trust/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-trust-300",

        compassion:
          "bg-compassion-500 text-white hover:bg-compassion/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-compassion-300",

        // NEW: Context-specific variants
        donate:
          "bg-gradient-to-r from-trust-500 to-primary-500 text-white hover:from-trust-600 hover:to-primary-600 shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 focus-visible:ring-trust-300",

        monastery:
          "bg-gradient-to-r from-primary-500 to-spiritual-400 text-white hover:from-primary-600 hover:to-spiritual-500 shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 focus-visible:ring-primary-300",

        peaceful:
          "bg-spiritual-100 text-spiritual-800 border border-spiritual-200 hover:bg-spiritual-200 hover:border-spiritual-300 shadow-sm hover:shadow-md hover:-translate-y-0.5",

        // NEW: Cultural variants
        sinhala:
          "bg-primary-500 text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 font-sinhala active:translate-y-0",

        cultural:
          "bg-accent-500 text-white hover:bg-accent/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",

        // NEW: Elegant variants with lotus-inspired design
        lotus:
          "bg-gradient-to-br from-spiritual-400 via-primary-400 to-accent-400 text-white hover:from-spiritual-500 hover:via-primary-500 hover:to-accent-500 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 border border-spiritual-200/20",

        enlightened:
          "bg-gradient-to-r from-neutral-100 to-primary-100 text-primary-800 border border-primary-200 hover:from-primary-50 hover:to-primary-150 hover:border-primary-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5",
      },

      size: {
        sm: "h-9 px-3 py-2 text-sm rounded-md",
        default: "h-12 px-6 py-3 text-sm",
        lg: "h-14 px-8 py-4 text-base rounded-xl",
        xl: "h-16 px-10 py-5 text-lg rounded-2xl",
        icon: "size-12 p-0",
        "icon-sm": "size-11 p-0", // Changed from size-9 (36px) to size-11 (44px) for WCAG AAA touch targets
        "icon-lg": "size-14 p-0",
      },

      // NEW: Animation intensity for different contexts
      animation: {
        none: "",
        subtle: "transition-all duration-200",
        normal: "transition-all duration-300",
        enhanced: "transition-all duration-500 hover:scale-105",
        meditative: "transition-all duration-750 hover:scale-102",
      },

      // NEW: Cultural styling
      cultural: {
        universal: "",
        sinhala: "font-sinhala tracking-wide",
        english: "font-sans tracking-normal",
      },

      // NEW: Spiritual context
      context: {
        general: "",
        donation: "shadow-trust/20 hover:shadow-trust/30",
        monastery: "shadow-spiritual/20 hover:shadow-spiritual/30",
        spiritual: "shadow-primary/20 hover:shadow-primary/30",
        admin: "shadow-neutral/20 hover:shadow-neutral/30",
      },

      // NEW: Accessibility enhancements
      accessibility: {
        normal: "",
        "high-contrast": "border-2 border-current",
        "reduced-motion": "transition-none hover:transform-none",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "normal",
      cultural: "universal",
      context: "general",
      accessibility: "normal",
    },

    // Compound variants for specific combinations
    compoundVariants: [
      {
        variant: "spiritual",
        size: "lg",
        className: "shadow-lg hover:shadow-xl",
      },
      {
        variant: "donate",
        size: ["lg", "xl"],
        className: "shadow-xl hover:shadow-2xl",
      },
      {
        cultural: "sinhala",
        size: ["lg", "xl"],
        className: "leading-relaxed",
      },
      {
        context: "spiritual",
        animation: "meditative",
        className: "hover:shadow-spiritual-200/50",
      },
      {
        accessibility: "reduced-motion",
        animation: ["enhanced", "meditative"],
        className: "transition-none transform-none",
      },
    ],
  }
)

// Enhanced button props type
export type ButtonVariantProps = VariantProps<typeof buttonVariants>

// Preset button configurations for common use cases
export const buttonPresets = {
  // Primary actions
  primaryAction: {
    variant: "default" as const,
    size: "default" as const,
    animation: "normal" as const,
  },

  // Donation flow buttons
  donateButton: {
    variant: "donate" as const,
    size: "lg" as const,
    animation: "enhanced" as const,
    context: "donation" as const,
  },

  // Monastery actions
  monasteryAction: {
    variant: "monastery" as const,
    size: "default" as const,
    animation: "meditative" as const,
    context: "monastery" as const,
  },

  // Spiritual/peaceful actions
  spiritualAction: {
    variant: "spiritual" as const,
    size: "default" as const,
    animation: "meditative" as const,
    context: "spiritual" as const,
  },

  // Trust-building actions
  trustAction: {
    variant: "trust" as const,
    size: "default" as const,
    animation: "normal" as const,
    context: "donation" as const,
  },

  // Cultural variants
  sinhalaButton: {
    variant: "sinhala" as const,
    cultural: "sinhala" as const,
    size: "default" as const,
  },

  // Peaceful secondary actions
  peacefulSecondary: {
    variant: "peaceful" as const,
    size: "default" as const,
    animation: "subtle" as const,
  },

  // Lotus-inspired feature buttons
  lotusFeature: {
    variant: "lotus" as const,
    size: "lg" as const,
    animation: "enhanced" as const,
  },
} as const

export type ButtonPreset = keyof typeof buttonPresets