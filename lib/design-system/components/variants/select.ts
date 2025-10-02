/**
 * Enhanced Dana Design System - Select Variants
 * Dropdown/select variants with cultural and accessibility support
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Enhanced select/dropdown variants
export const selectVariants = cva(
  // Base styles with peaceful focus states
  "flex h-12 w-full items-center justify-between rounded-lg border bg-input px-3 py-2 text-sm transition-all duration-300 placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "border-border focus:ring-2 focus:ring-ring hover:border-primary/50",

        outline:
          "border-border bg-transparent focus:ring-2 focus:ring-ring hover:border-primary/50",

        filled:
          "border-transparent bg-muted focus:ring-2 focus:ring-ring focus:bg-background",

        // Spiritual/Buddhist-inspired variants
        spiritual:
          "border-spiritual-200 focus:ring-2 focus:ring-spiritual-300 focus:border-spiritual-400 hover:border-spiritual-300 bg-spiritual-25/50",

        trust:
          "border-trust-200 focus:ring-2 focus:ring-trust-300 focus:border-trust-400 hover:border-trust-300 bg-trust-25/50",

        peaceful:
          "border-spiritual-100 focus:ring-2 focus:ring-spiritual-200 focus:border-spiritual-300 hover:border-spiritual-200 bg-gradient-to-r from-spiritual-25/30 to-primary-25/30",

        // Context-specific variants
        donation:
          "border-trust-200 focus:ring-2 focus:ring-trust-300 focus:border-trust-400 hover:border-trust-300 bg-gradient-to-r from-trust-25/20 to-primary-25/20",

        monastery:
          "border-primary-200 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 hover:border-primary-300 bg-gradient-to-r from-primary-25/30 to-spiritual-25/30",

        // Cultural variants
        sinhala:
          "border-accent-200 focus:ring-2 focus:ring-accent-300 font-sinhala leading-relaxed tracking-wide text-base",

        cultural:
          "border-secondary-200 focus:ring-2 focus:ring-secondary-300 hover:border-secondary-300",

        // Elegant glass effect
        glass:
          "border-white/20 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 focus:bg-white/90 hover:bg-white/85",

        minimal:
          "border-0 border-b-2 border-border rounded-none bg-transparent px-0 focus:ring-0 focus:border-primary hover:border-primary/70",
      },

      size: {
        sm: "h-9 px-3 py-1 text-sm rounded-md",
        default: "h-12 px-4 py-3 text-sm",
        lg: "h-14 px-6 py-4 text-base rounded-xl",
        xl: "h-16 px-8 py-5 text-lg rounded-2xl",
      },

      // Cultural typography support
      cultural: {
        universal: "",
        sinhala: "font-sinhala leading-relaxed tracking-wide text-base",
        english: "font-sans leading-normal tracking-normal",
      },

      // Focus intensity
      focusIntensity: {
        subtle: "focus:ring-1 focus:ring-offset-0",
        normal: "focus:ring-2 focus:ring-offset-0",
        enhanced: "focus:ring-2 focus:ring-offset-2",
        meditative: "focus:ring-3 focus:ring-offset-1 focus:ring-opacity-50",
      },

      // Animation style
      animation: {
        none: "transition-none",
        subtle: "transition-colors duration-200",
        normal: "transition-all duration-300",
        enhanced: "transition-all duration-500",
      },

      // Accessibility enhancements
      accessibility: {
        normal: "",
        "high-contrast": "border-2 focus:ring-4",
        "reduced-motion": "transition-none",
        "large-text": "text-lg leading-relaxed",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      cultural: "universal",
      focusIntensity: "normal",
      animation: "normal",
      accessibility: "normal",
    },

    // Compound variants
    compoundVariants: [
      {
        variant: "sinhala",
        cultural: "sinhala",
        className: "min-h-[3.5rem] py-4",
      },
      {
        variant: "spiritual",
        focusIntensity: "meditative",
        className: "focus:shadow-lg focus:shadow-spiritual-200/30",
      },
      {
        variant: "donation",
        focusIntensity: "enhanced",
        className: "focus:shadow-md focus:shadow-trust-200/30",
      },
      {
        accessibility: "reduced-motion",
        animation: ["enhanced", "normal"],
        className: "transition-none",
      },
    ],
  }
)

// Select trigger icon variants
export const selectIconVariants = cva(
  "h-4 w-4 opacity-50 transition-transform duration-200",
  {
    variants: {
      state: {
        closed: "",
        open: "rotate-180",
      },
      variant: {
        default: "text-foreground",
        spiritual: "text-spiritual-600",
        trust: "text-trust-600",
        cultural: "text-secondary-600",
      },
    },
    defaultVariants: {
      state: "closed",
      variant: "default",
    },
  }
)

// Select content (dropdown) variants
export const selectContentVariants = cva(
  "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground border-border",
        spiritual: "bg-spiritual-50 text-spiritual-900 border-spiritual-200",
        trust: "bg-trust-50 text-trust-900 border-trust-200",
        peaceful: "bg-gradient-to-b from-spiritual-50 to-primary-50 border-spiritual-200",
        glass: "bg-white/95 backdrop-blur-lg border-white/20",
      },
      animation: {
        normal: "",
        enhanced: "data-[state=open]:animate-in data-[state=closed]:animate-out",
        peaceful: "data-[state=open]:duration-500 data-[state=closed]:duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "normal",
    },
  }
)

// Select item variants
export const selectItemVariants = cva(
  "relative flex w-full cursor-default select-none items-center rounded-md py-2 px-3 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "hover:bg-accent/50",
        spiritual: "hover:bg-spiritual-100 focus:bg-spiritual-200 focus:text-spiritual-900",
        trust: "hover:bg-trust-100 focus:bg-trust-200 focus:text-trust-900",
        peaceful: "hover:bg-spiritual-50 focus:bg-gradient-to-r focus:from-spiritual-100 focus:to-primary-100",
        cultural: "hover:bg-secondary-50 focus:bg-secondary-100",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-base leading-relaxed py-3",
        english: "font-sans",
      },
      state: {
        default: "",
        selected: "bg-primary-50 text-primary-900 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
      state: "default",
    },
  }
)

// Select label variants
export const selectLabelVariants = cva(
  "px-3 py-2 text-sm font-semibold",
  {
    variants: {
      variant: {
        default: "text-foreground",
        spiritual: "text-spiritual-700",
        trust: "text-trust-700",
        cultural: "text-secondary-700",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-base",
        english: "font-sans",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
    },
  }
)

// Select separator variants
export const selectSeparatorVariants = cva(
  "-mx-1 my-1 h-px",
  {
    variants: {
      variant: {
        default: "bg-border",
        spiritual: "bg-spiritual-200",
        trust: "bg-trust-200",
        peaceful: "bg-gradient-to-r from-spiritual-200 to-primary-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Enhanced select props types
export type SelectVariantProps = VariantProps<typeof selectVariants>
export type SelectIconVariantProps = VariantProps<typeof selectIconVariants>
export type SelectContentVariantProps = VariantProps<typeof selectContentVariants>
export type SelectItemVariantProps = VariantProps<typeof selectItemVariants>
export type SelectLabelVariantProps = VariantProps<typeof selectLabelVariants>
export type SelectSeparatorVariantProps = VariantProps<typeof selectSeparatorVariants>

// Preset select configurations
export const selectPresets = {
  // Standard select
  defaultSelect: {
    select: { variant: "default" as const, size: "default" as const },
    content: { variant: "default" as const },
    item: { variant: "default" as const },
  },

  // Donation form selects
  donationSelect: {
    select: {
      variant: "donation" as const,
      size: "lg" as const,
      focusIntensity: "enhanced" as const,
      animation: "enhanced" as const,
    },
    content: { variant: "trust" as const, animation: "enhanced" as const },
    item: { variant: "trust" as const },
  },

  // Monastery form selects
  monasterySelect: {
    select: {
      variant: "monastery" as const,
      size: "default" as const,
      focusIntensity: "meditative" as const,
      animation: "enhanced" as const,
    },
    content: { variant: "spiritual" as const, animation: "peaceful" as const },
    item: { variant: "spiritual" as const },
  },

  // Spiritual/peaceful selects
  spiritualSelect: {
    select: {
      variant: "spiritual" as const,
      size: "default" as const,
      focusIntensity: "meditative" as const,
      animation: "enhanced" as const,
    },
    content: { variant: "peaceful" as const, animation: "peaceful" as const },
    item: { variant: "peaceful" as const },
  },

  // Sinhala language selects
  sinhalaSelect: {
    select: {
      variant: "sinhala" as const,
      cultural: "sinhala" as const,
      size: "lg" as const,
    },
    content: { variant: "default" as const },
    item: { variant: "cultural" as const, cultural: "sinhala" as const },
    label: { variant: "cultural" as const, cultural: "sinhala" as const },
  },

  // Glass effect selects
  glassSelect: {
    select: {
      variant: "glass" as const,
      size: "default" as const,
      animation: "enhanced" as const,
    },
    content: { variant: "glass" as const, animation: "enhanced" as const },
    item: { variant: "default" as const },
  },

  // Minimal selects
  minimalSelect: {
    select: {
      variant: "minimal" as const,
      size: "default" as const,
      animation: "subtle" as const,
    },
    content: { variant: "default" as const },
    item: { variant: "default" as const },
  },
} as const

export type SelectPreset = keyof typeof selectPresets
