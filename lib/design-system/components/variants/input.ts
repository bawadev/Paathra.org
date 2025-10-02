/**
 * Enhanced Dana Design System - Input Variants
 * Multilingual-optimized input variants with cultural sensitivity
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Enhanced input variants with cultural and accessibility support
export const inputVariants = cva(
  // Base styles with peaceful focus states - Mobile-optimized with 16px font to prevent iOS zoom
  "flex w-full rounded-lg border bg-input px-3 py-2 text-base transition-all duration-300 file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "border-border focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50",

        outline:
          "border-border bg-transparent focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50",

        filled:
          "border-transparent bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background",

        // NEW: Spiritual/Buddhist-inspired variants
        spiritual:
          "border-spiritual-200 focus-visible:ring-2 focus-visible:ring-spiritual-300 focus-visible:border-spiritual-400 hover:border-spiritual-300 bg-spiritual-25/50",

        trust:
          "border-trust-200 focus-visible:ring-2 focus-visible:ring-trust-300 focus-visible:border-trust-400 hover:border-trust-300 bg-trust-25/50",

        peaceful:
          "border-spiritual-100 focus-visible:ring-2 focus-visible:ring-spiritual-200 focus-visible:border-spiritual-300 hover:border-spiritual-200 bg-gradient-to-r from-spiritual-25/30 to-primary-25/30",

        // NEW: Context-specific variants
        donation:
          "border-trust-200 focus-visible:ring-2 focus-visible:ring-trust-300 focus-visible:border-trust-400 hover:border-trust-300 bg-gradient-to-r from-trust-25/20 to-primary-25/20",

        monastery:
          "border-primary-200 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:border-primary-400 hover:border-primary-300 bg-gradient-to-r from-primary-25/30 to-spiritual-25/30",

        // NEW: Validation states with cultural sensitivity
        success:
          "border-compassion-300 focus-visible:ring-2 focus-visible:ring-compassion-200 bg-compassion-25/50 text-compassion-800",

        warning:
          "border-accent-300 focus-visible:ring-2 focus-visible:ring-accent-200 bg-accent-25/50 text-accent-800",

        error:
          "border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20 bg-destructive/5 text-destructive",

        // NEW: Cultural variants
        sinhala:
          "border-accent-200 focus-visible:ring-2 focus-visible:ring-accent-300 font-sinhala leading-relaxed tracking-wide text-base",

        cultural:
          "border-secondary-200 focus-visible:ring-2 focus-visible:ring-secondary-300 hover:border-secondary-300",

        // NEW: Elegant glass effect
        glass:
          "border-white/20 bg-white/80 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:bg-white/90 hover:bg-white/85",

        minimal:
          "border-0 border-b-2 border-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary hover:border-primary/70",
      },

      size: {
        sm: "h-9 px-3 py-1 text-sm rounded-md",
        default: "h-12 px-4 py-3 text-base", // Changed from text-sm to text-base (16px) to prevent iOS zoom
        lg: "h-14 px-6 py-4 text-base rounded-xl",
        xl: "h-16 px-8 py-5 text-lg rounded-2xl",
      },

      // NEW: Cultural typography support
      cultural: {
        universal: "",
        sinhala: "font-sinhala leading-relaxed tracking-wide text-base placeholder:font-sans placeholder:text-sm",
        english: "font-sans leading-normal tracking-normal",
      },

      // NEW: Input types with optimized styling
      inputType: {
        text: "",
        email: "placeholder:text-muted-foreground/70",
        password: "placeholder:text-muted-foreground/70",
        number: "tabular-nums",
        tel: "tabular-nums",
        url: "placeholder:text-muted-foreground/70",
        search: "placeholder:text-muted-foreground/70 pr-10",
      },

      // NEW: Focus intensity for different contexts
      focusIntensity: {
        subtle: "focus-visible:ring-1 focus-visible:ring-offset-0",
        normal: "focus-visible:ring-2 focus-visible:ring-offset-0",
        enhanced: "focus-visible:ring-2 focus-visible:ring-offset-2",
        meditative: "focus-visible:ring-3 focus-visible:ring-offset-1 focus-visible:ring-opacity-50",
      },

      // NEW: Animation style
      animation: {
        none: "transition-none",
        subtle: "transition-colors duration-200",
        normal: "transition-all duration-300",
        enhanced: "transition-all duration-500",
      },

      // NEW: Border style variations
      borderStyle: {
        solid: "border-solid",
        dashed: "border-dashed",
        dotted: "border-dotted",
        none: "border-0",
      },

      // NEW: Accessibility enhancements
      accessibility: {
        normal: "",
        "high-contrast": "border-2 focus-visible:ring-4",
        "reduced-motion": "transition-none",
        "large-text": "text-lg leading-relaxed",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      cultural: "universal",
      inputType: "text",
      focusIntensity: "normal",
      animation: "normal",
      borderStyle: "solid",
      accessibility: "normal",
    },

    // Compound variants for specific combinations
    compoundVariants: [
      {
        variant: "sinhala",
        cultural: "sinhala",
        className: "min-h-[3.5rem] py-4",
      },
      {
        variant: "spiritual",
        focusIntensity: "meditative",
        className: "focus-visible:shadow-lg focus-visible:shadow-spiritual-200/30",
      },
      {
        variant: "donation",
        focusIntensity: "enhanced",
        className: "focus-visible:shadow-md focus-visible:shadow-trust-200/30",
      },
      {
        inputType: "search",
        size: ["default", "lg"],
        className: "pr-12",
      },
      {
        cultural: "sinhala",
        size: ["lg", "xl"],
        className: "leading-loose py-5",
      },
      {
        accessibility: "reduced-motion",
        animation: ["enhanced", "normal"],
        className: "transition-none",
      },
      {
        variant: ["spiritual", "peaceful"],
        animation: "enhanced",
        className: "focus-visible:scale-[1.02]",
      },
    ],
  }
)

// Label variants for consistent styling
export const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        spiritual: "text-spiritual-700",
        trust: "text-trust-700",
        cultural: "text-secondary-700",
        required: "text-foreground after:content-['*'] after:ml-0.5 after:text-destructive",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-base leading-relaxed",
        english: "font-sans",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
      size: "default",
    },
  }
)

// Helper text variants
export const helperTextVariants = cva(
  "text-xs mt-2",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        success: "text-compassion-600",
        warning: "text-accent-600",
        error: "text-destructive",
        info: "text-trust-600",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-sm leading-relaxed",
        english: "font-sans",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
    },
  }
)

// Enhanced input props types
export type InputVariantProps = VariantProps<typeof inputVariants>
export type LabelVariantProps = VariantProps<typeof labelVariants>
export type HelperTextVariantProps = VariantProps<typeof helperTextVariants>

// Preset input configurations for common use cases
export const inputPresets = {
  // Standard form inputs
  defaultInput: {
    variant: "default" as const,
    size: "default" as const,
    animation: "normal" as const,
  },

  // Donation form inputs
  donationInput: {
    variant: "donation" as const,
    size: "lg" as const,
    focusIntensity: "enhanced" as const,
    animation: "enhanced" as const,
  },

  // Monastery form inputs
  monasteryInput: {
    variant: "monastery" as const,
    size: "default" as const,
    focusIntensity: "meditative" as const,
    animation: "enhanced" as const,
  },

  // Spiritual/peaceful inputs
  spiritualInput: {
    variant: "spiritual" as const,
    size: "default" as const,
    focusIntensity: "meditative" as const,
    animation: "enhanced" as const,
  },

  // Trust-building inputs
  trustInput: {
    variant: "trust" as const,
    size: "default" as const,
    focusIntensity: "enhanced" as const,
  },

  // Sinhala language inputs
  sinhalaInput: {
    variant: "sinhala" as const,
    cultural: "sinhala" as const,
    size: "lg" as const,
  },

  // Search inputs
  searchInput: {
    variant: "default" as const,
    inputType: "search" as const,
    size: "default" as const,
    borderStyle: "solid" as const,
  },

  // Minimal inputs for clean layouts
  minimalInput: {
    variant: "minimal" as const,
    size: "default" as const,
    animation: "subtle" as const,
  },

  // Glass effect inputs
  glassInput: {
    variant: "glass" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  // Required field inputs
  requiredInput: {
    variant: "default" as const,
    size: "default" as const,
    // Label with required indicator handled separately
  },
} as const

export type InputPreset = keyof typeof inputPresets

// Form group preset configurations
export const formGroupPresets = {
  donationForm: {
    input: inputPresets.donationInput,
    label: { variant: "trust" as const, size: "default" as const },
    helper: { variant: "info" as const },
  },

  monasteryForm: {
    input: inputPresets.monasteryInput,
    label: { variant: "spiritual" as const, size: "default" as const },
    helper: { variant: "default" as const },
  },

  sinhalaForm: {
    input: inputPresets.sinhalaInput,
    label: { variant: "cultural" as const, cultural: "sinhala" as const },
    helper: { variant: "default" as const, cultural: "sinhala" as const },
  },
} as const

export type FormGroupPreset = keyof typeof formGroupPresets