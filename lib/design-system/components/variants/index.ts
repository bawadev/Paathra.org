/**
 * Enhanced Dana Design System - Component Variants Index
 * Central export for all component variants
 */

// Export button variants
export {
  buttonVariants,
  buttonPresets,
  type ButtonVariantProps,
  type ButtonPreset,
} from './button'

// Export card variants
export {
  cardVariants,
  cardHeaderVariants,
  cardContentVariants,
  cardFooterVariants,
  cardPresets,
  type CardVariantProps,
  type CardHeaderVariantProps,
  type CardContentVariantProps,
  type CardFooterVariantProps,
  type CardPreset,
} from './card'

// Export input variants
export {
  inputVariants,
  labelVariants,
  helperTextVariants,
  inputPresets,
  formGroupPresets,
  type InputVariantProps,
  type LabelVariantProps,
  type HelperTextVariantProps,
  type InputPreset,
  type FormGroupPreset,
} from './input'

// Export select variants
export {
  selectVariants,
  selectIconVariants,
  selectContentVariants,
  selectItemVariants,
  selectLabelVariants,
  selectSeparatorVariants,
  selectPresets,
  type SelectVariantProps,
  type SelectIconVariantProps,
  type SelectContentVariantProps,
  type SelectItemVariantProps,
  type SelectLabelVariantProps,
  type SelectSeparatorVariantProps,
  type SelectPreset,
} from './select'

// Export badge variants
export {
  badgeVariants,
  badgeIconVariants,
  badgeRemoveVariants,
  badgeGroupVariants,
  badgePresets,
  statusBadgeMap,
  type BadgeVariantProps,
  type BadgeIconVariantProps,
  type BadgeRemoveVariantProps,
  type BadgeGroupVariantProps,
  type BadgePreset,
  type DonationStatus,
} from './badge'

// Export alert variants
export {
  alertVariants,
  alertTitleVariants,
  alertDescriptionVariants,
  alertIconVariants,
  alertCloseVariants,
  toastVariants,
  alertPresets,
  type AlertVariantProps,
  type AlertTitleVariantProps,
  type AlertDescriptionVariantProps,
  type AlertIconVariantProps,
  type AlertCloseVariantProps,
  type ToastVariantProps,
  type AlertPreset,
} from './alert'

// Export modal variants
export {
  modalOverlayVariants,
  modalContentVariants,
  modalHeaderVariants,
  modalTitleVariants,
  modalDescriptionVariants,
  modalFooterVariants,
  modalCloseVariants,
  modalPresets,
  type ModalOverlayVariantProps,
  type ModalContentVariantProps,
  type ModalHeaderVariantProps,
  type ModalTitleVariantProps,
  type ModalDescriptionVariantProps,
  type ModalFooterVariantProps,
  type ModalCloseVariantProps,
  type ModalPreset,
} from './modal'

// Utility functions for variant management
export function getVariantClasses<T extends Record<string, any>>(
  variants: T,
  props: Partial<T>
): string {
  const keys = Object.keys(props) as Array<keyof T>
  return keys
    .filter(key => props[key] !== undefined)
    .map(key => `${String(key)}-${String(props[key])}`)
    .join(' ')
}

// Preset utility for applying multiple variants
export function applyPreset<T extends Record<string, any>>(
  preset: T,
  overrides?: Partial<T>
): T {
  return { ...preset, ...overrides }
}

// Cultural variant utilities
export function getCulturalVariants(locale: 'en' | 'si' | 'ta') {
  switch (locale) {
    case 'si':
      return {
        button: { cultural: 'sinhala' as const },
        card: { cultural: 'sinhala' as const },
        input: { cultural: 'sinhala' as const },
      }
    case 'en':
      return {
        button: { cultural: 'english' as const },
        card: { cultural: 'english' as const },
        input: { cultural: 'english' as const },
      }
    case 'ta':
    default:
      return {
        button: { cultural: 'universal' as const },
        card: { cultural: 'universal' as const },
        input: { cultural: 'universal' as const },
      }
  }
}

// Context-aware variant utilities
export function getContextualVariants(context: 'donation' | 'monastery' | 'spiritual' | 'admin' | 'general') {
  switch (context) {
    case 'donation':
      return {
        button: buttonPresets.donateButton,
        card: cardPresets.donationCard,
        input: inputPresets.donationInput,
      }
    case 'monastery':
      return {
        button: buttonPresets.monasteryAction,
        card: cardPresets.monasteryCard,
        input: inputPresets.monasteryInput,
      }
    case 'spiritual':
      return {
        button: buttonPresets.spiritualAction,
        card: cardPresets.spiritualCard,
        input: inputPresets.spiritualInput,
      }
    case 'admin':
      return {
        button: { variant: 'default' as const, context: 'admin' as const },
        card: cardPresets.adminCard,
        input: { variant: 'default' as const },
      }
    case 'general':
    default:
      return {
        button: buttonPresets.primaryAction,
        card: { variant: 'default' as const },
        input: inputPresets.defaultInput,
      }
  }
}

// Accessibility variant utilities
export function getAccessibilityVariants(preferences: {
  reducedMotion?: boolean
  highContrast?: boolean
  largeText?: boolean
}) {
  const variants: Record<string, any> = {}

  if (preferences.reducedMotion) {
    variants.animation = 'none'
    variants.accessibility = 'reduced-motion'
  }

  if (preferences.highContrast) {
    variants.accessibility = 'high-contrast'
  }

  if (preferences.largeText) {
    variants.size = 'lg'
    variants.accessibility = 'large-text'
  }

  return variants
}

// Component variant combinations for common patterns
export const componentPatterns = {
  // Donation flow components
  donationFlow: {
    primaryButton: applyPreset(buttonPresets.donateButton),
    secondaryButton: applyPreset(buttonPresets.trustAction, { variant: 'outline' }),
    card: applyPreset(cardPresets.donationCard),
    input: applyPreset(inputPresets.donationInput),
  },

  // Monastery management components
  monasteryManagement: {
    primaryButton: applyPreset(buttonPresets.monasteryAction),
    secondaryButton: applyPreset(buttonPresets.peacefulSecondary),
    card: applyPreset(cardPresets.monasteryCard),
    input: applyPreset(inputPresets.monasteryInput),
  },

  // Spiritual content components
  spiritualContent: {
    primaryButton: applyPreset(buttonPresets.spiritualAction),
    secondaryButton: applyPreset(buttonPresets.peacefulSecondary),
    card: applyPreset(cardPresets.spiritualCard),
    input: applyPreset(inputPresets.spiritualInput),
  },

  // Cultural Sinhala components
  sinhalaComponents: {
    primaryButton: applyPreset(buttonPresets.sinhalaButton),
    card: applyPreset(cardPresets.sinhalaCard),
    input: applyPreset(inputPresets.sinhalaInput),
  },

  // Admin interface components
  adminInterface: {
    primaryButton: { variant: 'default' as const, context: 'admin' as const },
    secondaryButton: { variant: 'outline' as const, context: 'admin' as const },
    card: applyPreset(cardPresets.adminCard),
    input: applyPreset(inputPresets.defaultInput),
  },
} as const

export type ComponentPattern = keyof typeof componentPatterns

// Export all variant types for convenience
export type AllVariantProps = {
  button: ButtonVariantProps
  card: CardVariantProps
  input: InputVariantProps
}

// Export preset types
export type AllPresets = {
  button: ButtonPreset
  card: CardPreset
  input: InputPreset
}