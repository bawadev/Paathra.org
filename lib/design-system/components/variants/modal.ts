/**
 * Enhanced Dana Design System - Modal Variants
 * Modal/dialog variants with cultural and contextual theming
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Modal overlay variants
export const modalOverlayVariants = cva(
  // Base overlay with smooth transitions
  "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-black/80",
        spiritual: "bg-spiritual-900/80",
        peaceful: "bg-gradient-to-br from-spiritual-900/80 to-primary-900/80",
        trust: "bg-trust-900/80",
        light: "bg-black/60",
        heavy: "bg-black/90",
        glass: "bg-white/10 backdrop-blur-md",
      },
      blur: {
        none: "backdrop-blur-none",
        sm: "backdrop-blur-sm",
        default: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
      },
      animation: {
        normal: "",
        enhanced: "data-[state=open]:duration-300 data-[state=closed]:duration-200",
        peaceful: "data-[state=open]:duration-500 data-[state=closed]:duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
      blur: "default",
      animation: "normal",
    },
  }
)

// Modal content variants
export const modalContentVariants = cva(
  // Base content with entrance animations
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "border-border bg-background text-foreground",

        // Spiritual/Buddhist-inspired variants
        spiritual:
          "border-spiritual-200 bg-spiritual-50 text-spiritual-900",

        trust:
          "border-trust-200 bg-trust-50 text-trust-900",

        peaceful:
          "border-spiritual-200 bg-gradient-to-br from-spiritual-50 to-primary-50 text-spiritual-900",

        // Context-specific variants
        donation:
          "border-trust-200 bg-gradient-to-br from-trust-50 to-primary-50 text-trust-900",

        monastery:
          "border-primary-200 bg-gradient-to-br from-primary-50 to-spiritual-50 text-primary-900",

        // Enhanced variants
        glass:
          "border-white/20 bg-white/95 backdrop-blur-xl text-foreground shadow-2xl",

        card:
          "border-border bg-card text-card-foreground shadow-xl",

        alert:
          "border-destructive bg-destructive/10 text-destructive",

        success:
          "border-compassion-300 bg-compassion-50 text-compassion-900",
      },

      size: {
        xs: "max-w-xs p-4 gap-3",
        sm: "max-w-sm p-4 gap-3",
        default: "max-w-lg p-6 gap-4",
        lg: "max-w-2xl p-8 gap-6",
        xl: "max-w-4xl p-10 gap-8",
        full: "max-w-[95vw] max-h-[95vh] p-6 gap-4",
      },

      // Cultural typography
      cultural: {
        universal: "",
        sinhala: "font-sinhala p-8",
        english: "font-sans",
      },

      // Animation style
      animation: {
        none: "duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none",
        subtle: "duration-150",
        normal: "duration-200",
        enhanced: "duration-300",
        peaceful: "duration-500",
      },

      // Position
      position: {
        center: "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
        top: "top-[10%] left-[50%] translate-x-[-50%] translate-y-0",
        bottom: "bottom-[10%] left-[50%] translate-x-[-50%] translate-y-0",
      },

      // Shadow depth
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        default: "shadow-lg",
        lg: "shadow-xl",
        xl: "shadow-2xl",
      },

      // Accessibility
      accessibility: {
        normal: "",
        "high-contrast": "border-2",
        "reduced-motion": "duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      cultural: "universal",
      animation: "normal",
      position: "center",
      shadow: "default",
      accessibility: "normal",
    },

    // Compound variants
    compoundVariants: [
      {
        cultural: "sinhala",
        size: ["default", "lg"],
        className: "p-10 gap-6 leading-relaxed",
      },
      {
        variant: ["peaceful", "spiritual"],
        animation: "peaceful",
        className: "shadow-spiritual-500/20",
      },
      {
        size: "full",
        position: "center",
        className: "rounded-lg",
      },
      {
        accessibility: "reduced-motion",
        className: "duration-0 animate-none",
      },
    ],
  }
)

// Modal header variants
export const modalHeaderVariants = cva(
  "flex flex-col space-y-1.5 text-center sm:text-left",
  {
    variants: {
      variant: {
        default: "",
        spiritual: "border-b border-spiritual-200 pb-4",
        trust: "border-b border-trust-200 pb-4",
        peaceful: "border-b border-spiritual-100 pb-4",
        minimal: "",
      },
      cultural: {
        universal: "",
        sinhala: "space-y-3 pb-6",
        english: "",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
    },
  }
)

// Modal title variants
export const modalTitleVariants = cva(
  "text-lg font-semibold leading-none tracking-tight",
  {
    variants: {
      variant: {
        default: "text-foreground",
        spiritual: "text-spiritual-900",
        trust: "text-trust-900",
        peaceful: "text-spiritual-900",
        alert: "text-destructive",
        success: "text-compassion-900",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-xl leading-relaxed",
        english: "font-sans",
      },
      size: {
        sm: "text-base",
        default: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
      size: "default",
    },
  }
)

// Modal description variants
export const modalDescriptionVariants = cva(
  "text-sm text-muted-foreground",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        spiritual: "text-spiritual-700",
        trust: "text-trust-700",
        peaceful: "text-spiritual-700",
        alert: "text-destructive/90",
        success: "text-compassion-800",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-base leading-loose",
        english: "font-sans",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
    },
  }
)

// Modal footer variants
export const modalFooterVariants = cva(
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
  {
    variants: {
      variant: {
        default: "",
        spiritual: "border-t border-spiritual-200 pt-4 mt-4",
        trust: "border-t border-trust-200 pt-4 mt-4",
        peaceful: "border-t border-spiritual-100 pt-4 mt-4",
        minimal: "",
      },
      alignment: {
        left: "sm:justify-start",
        center: "sm:justify-center",
        right: "sm:justify-end",
        between: "sm:justify-between",
      },
      cultural: {
        universal: "",
        sinhala: "pt-6 mt-6 gap-4",
        english: "",
      },
    },
    defaultVariants: {
      variant: "default",
      alignment: "right",
      cultural: "universal",
    },
  }
)

// Modal close button variants
export const modalCloseVariants = cva(
  "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "hover:text-foreground",
        spiritual: "hover:text-spiritual-900 focus:ring-spiritual-300",
        trust: "hover:text-trust-900 focus:ring-trust-300",
        peaceful: "hover:text-spiritual-900 focus:ring-spiritual-200",
      },
      size: {
        sm: "right-3 top-3 h-4 w-4",
        default: "right-4 top-4 h-4 w-4",
        lg: "right-6 top-6 h-5 w-5",
        xl: "right-8 top-8 h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Enhanced modal props types
export type ModalOverlayVariantProps = VariantProps<typeof modalOverlayVariants>
export type ModalContentVariantProps = VariantProps<typeof modalContentVariants>
export type ModalHeaderVariantProps = VariantProps<typeof modalHeaderVariants>
export type ModalTitleVariantProps = VariantProps<typeof modalTitleVariants>
export type ModalDescriptionVariantProps = VariantProps<typeof modalDescriptionVariants>
export type ModalFooterVariantProps = VariantProps<typeof modalFooterVariants>
export type ModalCloseVariantProps = VariantProps<typeof modalCloseVariants>

// Preset modal configurations
export const modalPresets = {
  // Standard modals
  defaultModal: {
    overlay: { variant: "default" as const, blur: "default" as const },
    content: { variant: "default" as const, size: "default" as const },
    header: { variant: "default" as const },
    title: { variant: "default" as const },
    description: { variant: "default" as const },
    footer: { variant: "default" as const },
  },

  // Confirmation modals
  confirmModal: {
    overlay: { variant: "default" as const, blur: "lg" as const },
    content: { variant: "card" as const, size: "sm" as const, shadow: "xl" as const },
    header: { variant: "minimal" as const },
    title: { variant: "default" as const, size: "lg" as const },
    description: { variant: "default" as const },
    footer: { variant: "minimal" as const, alignment: "between" as const },
  },

  // Alert modals
  alertModal: {
    overlay: { variant: "heavy" as const, blur: "xl" as const },
    content: { variant: "alert" as const, size: "sm" as const, shadow: "xl" as const },
    header: { variant: "minimal" as const },
    title: { variant: "alert" as const, size: "lg" as const },
    description: { variant: "alert" as const },
    footer: { variant: "minimal" as const, alignment: "right" as const },
  },

  // Success modals
  successModal: {
    overlay: { variant: "default" as const, blur: "lg" as const, animation: "enhanced" as const },
    content: { variant: "success" as const, size: "default" as const, animation: "enhanced" as const },
    header: { variant: "minimal" as const },
    title: { variant: "success" as const },
    description: { variant: "success" as const },
    footer: { variant: "minimal" as const },
  },

  // Spiritual modals
  spiritualModal: {
    overlay: { variant: "spiritual" as const, blur: "lg" as const, animation: "peaceful" as const },
    content: { variant: "spiritual" as const, size: "default" as const, animation: "peaceful" as const },
    header: { variant: "spiritual" as const },
    title: { variant: "spiritual" as const },
    description: { variant: "spiritual" as const },
    footer: { variant: "spiritual" as const },
    close: { variant: "spiritual" as const },
  },

  // Peaceful modals
  peacefulModal: {
    overlay: { variant: "peaceful" as const, blur: "xl" as const, animation: "peaceful" as const },
    content: { variant: "peaceful" as const, size: "lg" as const, animation: "peaceful" as const, shadow: "xl" as const },
    header: { variant: "peaceful" as const },
    title: { variant: "peaceful" as const, size: "lg" as const },
    description: { variant: "peaceful" as const },
    footer: { variant: "peaceful" as const },
    close: { variant: "peaceful" as const },
  },

  // Donation modals
  donationModal: {
    overlay: { variant: "trust" as const, blur: "lg" as const, animation: "enhanced" as const },
    content: { variant: "donation" as const, size: "lg" as const, animation: "enhanced" as const },
    header: { variant: "trust" as const },
    title: { variant: "trust" as const, size: "lg" as const },
    description: { variant: "trust" as const },
    footer: { variant: "trust" as const },
    close: { variant: "trust" as const },
  },

  // Monastery modals
  monasteryModal: {
    overlay: { variant: "spiritual" as const, blur: "lg" as const, animation: "peaceful" as const },
    content: { variant: "monastery" as const, size: "default" as const, animation: "peaceful" as const },
    header: { variant: "spiritual" as const },
    title: { variant: "spiritual" as const },
    description: { variant: "spiritual" as const },
    footer: { variant: "spiritual" as const },
    close: { variant: "spiritual" as const },
  },

  // Glass modals
  glassModal: {
    overlay: { variant: "glass" as const, blur: "xl" as const, animation: "enhanced" as const },
    content: { variant: "glass" as const, size: "default" as const, animation: "enhanced" as const, shadow: "xl" as const },
    header: { variant: "minimal" as const },
    title: { variant: "default" as const },
    description: { variant: "default" as const },
    footer: { variant: "minimal" as const },
  },

  // Sinhala modals
  sinhalaModal: {
    overlay: { variant: "default" as const, blur: "default" as const },
    content: { variant: "default" as const, size: "lg" as const, cultural: "sinhala" as const },
    header: { variant: "default" as const, cultural: "sinhala" as const },
    title: { variant: "default" as const, cultural: "sinhala" as const },
    description: { variant: "default" as const, cultural: "sinhala" as const },
    footer: { variant: "default" as const, cultural: "sinhala" as const },
  },

  // Full screen modals
  fullScreenModal: {
    overlay: { variant: "default" as const, blur: "none" as const },
    content: { variant: "default" as const, size: "full" as const },
    header: { variant: "default" as const },
    title: { variant: "default" as const, size: "xl" as const },
    description: { variant: "default" as const },
    footer: { variant: "default" as const },
    close: { variant: "default" as const, size: "lg" as const },
  },
} as const

export type ModalPreset = keyof typeof modalPresets
