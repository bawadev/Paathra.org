// Re-export all stores for easy importing
export { useAuthStore } from './useAuthStore'
export { useUIStore } from './useUIStore'
export { useMonasteryStore } from './useMonasteryStore'
export { useDonationStore } from './useDonationStore'

// Store types for TypeScript
export type {
  AuthState,
  UIState,
  MonasteryState,
  DonationState,
} from './types'