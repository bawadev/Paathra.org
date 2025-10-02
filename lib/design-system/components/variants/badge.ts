/**
 * Enhanced Dana Design System - Badge Variants
 * Badge/tag variants with status and cultural support
 */

import { cva, type VariantProps } from 'class-variance-authority'

// Enhanced badge variants
export const badgeVariants = cva(
  // Base styles
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",

        outline:
          "border-border text-foreground hover:bg-accent hover:text-accent-foreground",

        // Status variants
        success:
          "border-transparent bg-compassion-500 text-white hover:bg-compassion-600",

        warning:
          "border-transparent bg-accent-500 text-white hover:bg-accent-600",

        error:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",

        info:
          "border-transparent bg-trust-500 text-white hover:bg-trust-600",

        // Buddhist/spiritual variants
        spiritual:
          "border-spiritual-200 bg-spiritual-100 text-spiritual-800 hover:bg-spiritual-200",

        trust:
          "border-trust-200 bg-trust-100 text-trust-800 hover:bg-trust-200",

        compassion:
          "border-compassion-200 bg-compassion-100 text-compassion-800 hover:bg-compassion-200",

        peaceful:
          "border-spiritual-200 bg-gradient-to-r from-spiritual-50 to-primary-50 text-spiritual-800 hover:from-spiritual-100 hover:to-primary-100",

        // Donation status variants
        pending:
          "border-accent-200 bg-accent-100 text-accent-800 hover:bg-accent-200",

        approved:
          "border-trust-200 bg-trust-100 text-trust-800 hover:bg-trust-200",

        confirmed:
          "border-compassion-200 bg-compassion-100 text-compassion-800 hover:bg-compassion-200",

        delivered:
          "border-compassion-300 bg-compassion-500 text-white hover:bg-compassion-600",

        cancelled:
          "border-neutral-300 bg-neutral-200 text-neutral-700 hover:bg-neutral-300",

        notDelivered:
          "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20",

        // Cultural variants
        sinhala:
          "border-accent-200 bg-accent-100 text-accent-800 font-sinhala hover:bg-accent-200",

        cultural:
          "border-secondary-200 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",

        // Enhanced variants
        gradient:
          "border-transparent bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600",

        glass:
          "border-white/20 bg-white/80 backdrop-blur-sm text-foreground hover:bg-white/90",

        subtle:
          "border-border/50 bg-muted/50 text-muted-foreground hover:bg-muted",
      },

      size: {
        sm: "h-5 px-2 text-[10px] rounded-md",
        default: "h-6 px-2.5 text-xs",
        lg: "h-7 px-3 text-sm rounded-lg",
        xl: "h-8 px-4 text-base rounded-xl",
      },

      // Icon support
      withIcon: {
        true: "pl-2",
        false: "",
      },

      // Removable badge
      removable: {
        true: "pr-1",
        false: "",
      },

      // Cultural typography
      cultural: {
        universal: "",
        sinhala: "font-sinhala text-sm px-3",
        english: "font-sans",
      },

      // Interactive state
      interactive: {
        true: "cursor-pointer hover:scale-105 active:scale-95",
        false: "",
      },

      // Animation
      animation: {
        none: "transition-none",
        subtle: "transition-colors duration-150",
        normal: "transition-all duration-200",
        enhanced: "transition-all duration-300 hover:shadow-md",
      },

      // Accessibility
      accessibility: {
        normal: "",
        "high-contrast": "border-2",
        "reduced-motion": "transition-none hover:scale-100",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      withIcon: false,
      removable: false,
      cultural: "universal",
      interactive: false,
      animation: "normal",
      accessibility: "normal",
    },

    // Compound variants
    compoundVariants: [
      {
        cultural: "sinhala",
        size: ["default", "lg"],
        className: "leading-relaxed",
      },
      {
        interactive: true,
        animation: "enhanced",
        className: "hover:-translate-y-0.5",
      },
      {
        accessibility: "reduced-motion",
        className: "transition-none hover:scale-100 hover:transform-none",
      },
      {
        variant: ["gradient", "peaceful"],
        animation: "enhanced",
        className: "hover:shadow-lg",
      },
    ],
  }
)

// Badge icon variants
export const badgeIconVariants = cva(
  "h-3 w-3 shrink-0",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        success: "text-white",
        warning: "text-white",
        error: "text-destructive-foreground",
        info: "text-white",
        spiritual: "text-spiritual-700",
        trust: "text-trust-700",
        compassion: "text-compassion-700",
        outline: "text-foreground",
      },
      position: {
        left: "",
        right: "order-last",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "left",
    },
  }
)

// Badge remove button variants
export const badgeRemoveVariants = cva(
  "ml-1 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center hover:bg-foreground/20 transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary-foreground hover:bg-primary-foreground/20",
        success: "text-white hover:bg-white/20",
        warning: "text-white hover:bg-white/20",
        error: "text-destructive-foreground hover:bg-destructive-foreground/20",
        spiritual: "text-spiritual-700 hover:bg-spiritual-700/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Badge group container variants
export const badgeGroupVariants = cva(
  "flex flex-wrap items-center gap-2",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col items-start",
      },
      spacing: {
        tight: "gap-1",
        normal: "gap-2",
        relaxed: "gap-3",
        loose: "gap-4",
      },
      alignment: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      spacing: "normal",
      alignment: "start",
    },
  }
)

// Enhanced badge props types
export type BadgeVariantProps = VariantProps<typeof badgeVariants>
export type BadgeIconVariantProps = VariantProps<typeof badgeIconVariants>
export type BadgeRemoveVariantProps = VariantProps<typeof badgeRemoveVariants>
export type BadgeGroupVariantProps = VariantProps<typeof badgeGroupVariants>

// Preset badge configurations
export const badgePresets = {
  // Standard badge
  defaultBadge: {
    variant: "default" as const,
    size: "default" as const,
    animation: "normal" as const,
  },

  // Status badges for donations
  donationPending: {
    variant: "pending" as const,
    size: "default" as const,
    withIcon: true as const,
  },

  donationApproved: {
    variant: "approved" as const,
    size: "default" as const,
    withIcon: true as const,
  },

  donationConfirmed: {
    variant: "confirmed" as const,
    size: "default" as const,
    withIcon: true as const,
  },

  donationDelivered: {
    variant: "delivered" as const,
    size: "default" as const,
    withIcon: true as const,
  },

  donationCancelled: {
    variant: "cancelled" as const,
    size: "default" as const,
    withIcon: true as const,
  },

  donationNotDelivered: {
    variant: "notDelivered" as const,
    size: "default" as const,
    withIcon: true as const,
  },

  // Success/error badges
  successBadge: {
    variant: "success" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  errorBadge: {
    variant: "error" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  warningBadge: {
    variant: "warning" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  infoBadge: {
    variant: "info" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  // Spiritual badges
  spiritualBadge: {
    variant: "spiritual" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  peacefulBadge: {
    variant: "peaceful" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  // Cultural badges
  sinhalaBadge: {
    variant: "sinhala" as const,
    cultural: "sinhala" as const,
    size: "lg" as const,
  },

  // Interactive badges
  tagBadge: {
    variant: "outline" as const,
    size: "default" as const,
    interactive: true as const,
    removable: true as const,
  },

  // Enhanced badges
  gradientBadge: {
    variant: "gradient" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },

  glassBadge: {
    variant: "glass" as const,
    size: "default" as const,
    animation: "enhanced" as const,
  },
} as const

export type BadgePreset = keyof typeof badgePresets

// Badge with status mapping utility
export const statusBadgeMap = {
  pending: badgePresets.donationPending,
  monastery_approved: badgePresets.donationApproved,
  confirmed: badgePresets.donationConfirmed,
  delivered: badgePresets.donationDelivered,
  not_delivered: badgePresets.donationNotDelivered,
  cancelled: badgePresets.donationCancelled,
} as const

export type DonationStatus = keyof typeof statusBadgeMap
