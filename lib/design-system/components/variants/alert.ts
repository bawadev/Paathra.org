/**
 * Enhanced Dana Design System - Alert Variants
 * Alert/toast/notification variants with cultural sensitivity
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Enhanced alert variants
export const alertVariants = cva(
  // Base styles with peaceful presentation
  "relative w-full rounded-lg border p-4 transition-all duration-300 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "bg-background text-foreground border-border",

        // Status variants
        success:
          "border-compassion-300 bg-compassion-50 text-compassion-900 [&>svg]:text-compassion-600",

        warning:
          "border-accent-300 bg-accent-50 text-accent-900 [&>svg]:text-accent-600",

        error:
          "border-destructive bg-destructive/10 text-destructive [&>svg]:text-destructive",

        info:
          "border-trust-300 bg-trust-50 text-trust-900 [&>svg]:text-trust-600",

        // Spiritual/Buddhist-inspired variants
        spiritual:
          "border-spiritual-300 bg-spiritual-50 text-spiritual-900 [&>svg]:text-spiritual-600",

        trust:
          "border-trust-300 bg-trust-50 text-trust-900 [&>svg]:text-trust-600",

        compassion:
          "border-compassion-300 bg-compassion-50 text-compassion-900 [&>svg]:text-compassion-600",

        peaceful:
          "border-spiritual-200 bg-gradient-to-r from-spiritual-50 to-primary-50 text-spiritual-900 [&>svg]:text-spiritual-500",

        // Context-specific variants
        donation:
          "border-trust-300 bg-gradient-to-r from-trust-50 to-primary-50 text-trust-900 [&>svg]:text-trust-600",

        monastery:
          "border-primary-300 bg-gradient-to-r from-primary-50 to-spiritual-50 text-primary-900 [&>svg]:text-primary-600",

        // Enhanced variants
        gradient:
          "border-transparent bg-gradient-to-r from-primary-100 to-accent-100 text-foreground [&>svg]:text-primary-600",

        glass:
          "border-white/20 bg-white/80 backdrop-blur-lg text-foreground [&>svg]:text-primary-600",

        outline:
          "border-border bg-background text-foreground [&>svg]:text-foreground",

        subtle:
          "border-transparent bg-muted/50 text-muted-foreground [&>svg]:text-muted-foreground",
      },

      size: {
        sm: "p-3 text-sm [&>svg]:top-3 [&>svg]:left-3 [&>svg~*]:pl-6",
        default: "p-4 text-sm",
        lg: "p-6 text-base [&>svg]:top-5 [&>svg]:left-5 [&>svg~*]:pl-8",
        xl: "p-8 text-lg [&>svg]:top-7 [&>svg]:left-7 [&>svg~*]:pl-10",
      },

      // Cultural typography
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-base leading-relaxed",
        english: "font-sans",
      },

      // Dismissable
      dismissable: {
        true: "pr-12",
        false: "",
      },

      // Animation style
      animation: {
        none: "transition-none",
        subtle: "transition-opacity duration-200",
        normal: "transition-all duration-300",
        enhanced: "transition-all duration-500 hover:shadow-lg",
        peaceful: "transition-all duration-700",
      },

      // Shadow depth
      shadow: {
        none: "",
        sm: "shadow-sm",
        default: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },

      // Accessibility
      accessibility: {
        normal: "",
        "high-contrast": "border-2",
        "reduced-motion": "transition-none",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      cultural: "universal",
      dismissable: false,
      animation: "normal",
      shadow: "default",
      accessibility: "normal",
    },

    // Compound variants
    compoundVariants: [
      {
        cultural: "sinhala",
        size: ["default", "lg"],
        className: "p-5 leading-loose",
      },
      {
        variant: ["peaceful", "spiritual"],
        animation: "peaceful",
        className: "hover:shadow-spiritual-200/50",
      },
      {
        dismissable: true,
        size: "sm",
        className: "pr-10",
      },
      {
        accessibility: "reduced-motion",
        className: "transition-none",
      },
    ],
  }
)

// Alert title variants
export const alertTitleVariants = cva(
  "mb-1 font-semibold leading-none tracking-tight",
  {
    variants: {
      variant: {
        default: "text-foreground",
        success: "text-compassion-900",
        warning: "text-accent-900",
        error: "text-destructive",
        info: "text-trust-900",
        spiritual: "text-spiritual-900",
        peaceful: "text-spiritual-900",
      },
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-lg mb-2",
        english: "font-sans",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      cultural: "universal",
      size: "default",
    },
  }
)

// Alert description variants
export const alertDescriptionVariants = cva(
  "text-sm [&_p]:leading-relaxed",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        success: "text-compassion-800",
        warning: "text-accent-800",
        error: "text-destructive/90",
        info: "text-trust-800",
        spiritual: "text-spiritual-800",
        peaceful: "text-spiritual-800",
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

// Alert icon variants
export const alertIconVariants = cva(
  "h-5 w-5",
  {
    variants: {
      variant: {
        default: "text-foreground",
        success: "text-compassion-600",
        warning: "text-accent-600",
        error: "text-destructive",
        info: "text-trust-600",
        spiritual: "text-spiritual-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Alert close button variants
export const alertCloseVariants = cva(
  "absolute right-4 top-4 rounded-md p-1 text-foreground/50 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "hover:text-foreground",
        success: "hover:text-compassion-900",
        warning: "hover:text-accent-900",
        error: "hover:text-destructive",
        info: "hover:text-trust-900",
        spiritual: "hover:text-spiritual-900",
      },
      size: {
        sm: "right-3 top-3",
        default: "right-4 top-4",
        lg: "right-5 top-5",
        xl: "right-7 top-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Toast variants (for toast notifications)
export const toastVariants = cva(
  // Base toast styles with entrance animations
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        success: "border-compassion-300 bg-compassion-50 text-compassion-900",
        warning: "border-accent-300 bg-accent-50 text-accent-900",
        error: "border-destructive bg-destructive text-destructive-foreground",
        info: "border-trust-300 bg-trust-50 text-trust-900",
        spiritual: "border-spiritual-300 bg-spiritual-50 text-spiritual-900",
        peaceful: "border-spiritual-200 bg-gradient-to-r from-spiritual-50 to-primary-50 text-spiritual-900",
        glass: "border-white/20 bg-white/95 backdrop-blur-lg text-foreground",
      },
      animation: {
        normal: "",
        enhanced: "data-[state=open]:duration-500 data-[state=closed]:duration-300",
        peaceful: "data-[state=open]:duration-700 data-[state=closed]:duration-500",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "normal",
    },
  }
)

// Enhanced alert props types
export type AlertVariantProps = VariantProps<typeof alertVariants>
export type AlertTitleVariantProps = VariantProps<typeof alertTitleVariants>
export type AlertDescriptionVariantProps = VariantProps<typeof alertDescriptionVariants>
export type AlertIconVariantProps = VariantProps<typeof alertIconVariants>
export type AlertCloseVariantProps = VariantProps<typeof alertCloseVariants>
export type ToastVariantProps = VariantProps<typeof toastVariants>

// Preset alert configurations
export const alertPresets = {
  // Standard alerts
  defaultAlert: {
    alert: { variant: "default" as const, size: "default" as const },
    title: { variant: "default" as const },
    description: { variant: "default" as const },
  },

  successAlert: {
    alert: { variant: "success" as const, size: "default" as const, animation: "enhanced" as const },
    title: { variant: "success" as const },
    description: { variant: "success" as const },
    icon: { variant: "success" as const },
  },

  errorAlert: {
    alert: { variant: "error" as const, size: "default" as const, animation: "enhanced" as const },
    title: { variant: "error" as const },
    description: { variant: "error" as const },
    icon: { variant: "error" as const },
  },

  warningAlert: {
    alert: { variant: "warning" as const, size: "default" as const, animation: "enhanced" as const },
    title: { variant: "warning" as const },
    description: { variant: "warning" as const },
    icon: { variant: "warning" as const },
  },

  infoAlert: {
    alert: { variant: "info" as const, size: "default" as const, animation: "enhanced" as const },
    title: { variant: "info" as const },
    description: { variant: "info" as const },
    icon: { variant: "info" as const },
  },

  // Spiritual alerts
  spiritualAlert: {
    alert: { variant: "spiritual" as const, size: "default" as const, animation: "peaceful" as const },
    title: { variant: "spiritual" as const },
    description: { variant: "spiritual" as const },
    icon: { variant: "spiritual" as const },
  },

  peacefulAlert: {
    alert: { variant: "peaceful" as const, size: "default" as const, animation: "peaceful" as const },
    title: { variant: "peaceful" as const },
    description: { variant: "peaceful" as const },
  },

  // Context-specific alerts
  donationAlert: {
    alert: { variant: "donation" as const, size: "lg" as const, animation: "enhanced" as const },
    title: { variant: "info" as const },
    description: { variant: "info" as const },
  },

  monasteryAlert: {
    alert: { variant: "monastery" as const, size: "default" as const, animation: "peaceful" as const },
    title: { variant: "spiritual" as const },
    description: { variant: "spiritual" as const },
  },

  // Cultural alerts
  sinhalaAlert: {
    alert: { variant: "default" as const, cultural: "sinhala" as const, size: "lg" as const },
    title: { variant: "default" as const, cultural: "sinhala" as const },
    description: { variant: "default" as const, cultural: "sinhala" as const },
  },

  // Toast presets
  successToast: {
    variant: "success" as const,
    animation: "enhanced" as const,
  },

  errorToast: {
    variant: "error" as const,
    animation: "enhanced" as const,
  },

  infoToast: {
    variant: "info" as const,
    animation: "normal" as const,
  },

  spiritualToast: {
    variant: "spiritual" as const,
    animation: "peaceful" as const,
  },

  peacefulToast: {
    variant: "peaceful" as const,
    animation: "peaceful" as const,
  },

  glassToast: {
    variant: "glass" as const,
    animation: "enhanced" as const,
  },
} as const

export type AlertPreset = keyof typeof alertPresets
