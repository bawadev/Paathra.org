/**
 * Design Tokens - Logo Color System
 *
 * This file contains the centralized color system based on the Paathra logo colors.
 * Use these tokens consistently across the application for brand coherence.
 */

// Primary Logo Colors (Exact values from logo)
export const LOGO_COLORS = {
  // Primary gold color from logo
  gold: '#D4A574',
  // Primary coral/orange color from logo
  coral: '#EA8B6F',
} as const

// Hover State Colors (Darker variants for interactive elements)
export const LOGO_HOVER_COLORS = {
  // Darker gold for hover states
  gold: '#C69564',
  // Darker coral for hover states
  coral: '#DA7B5F',
} as const

// Gradient Utilities
export const LOGO_GRADIENTS = {
  // Primary gradient using logo colors
  primary: `linear-gradient(to right, ${LOGO_COLORS.gold}, ${LOGO_COLORS.coral})`,
  // Primary gradient for hover states
  primaryHover: `linear-gradient(to right, ${LOGO_HOVER_COLORS.gold}, ${LOGO_HOVER_COLORS.coral})`,
  // Bottom-right gradient
  br: `linear-gradient(to bottom right, ${LOGO_COLORS.gold}, ${LOGO_COLORS.coral})`,
  // Bottom-right hover gradient
  brHover: `linear-gradient(to bottom right, ${LOGO_HOVER_COLORS.gold}, ${LOGO_HOVER_COLORS.coral})`,
} as const

// Tailwind CSS class strings for gradients (for inline usage)
export const LOGO_GRADIENT_CLASSES = {
  // Standard gradient (left to right)
  primary: 'bg-gradient-to-r from-[#D4A574] to-[#EA8B6F]',
  // Hover state gradient
  primaryHover: 'hover:from-[#C69564] hover:to-[#DA7B5F]',
  // Bottom-right gradient
  br: 'bg-gradient-to-br from-[#D4A574] to-[#EA8B6F]',
  // Bottom-right hover gradient
  brHover: 'hover:from-[#C69564] hover:to-[#DA7B5F]',
  // Combined primary with hover
  primaryWithHover: 'bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F]',
  // Combined bottom-right with hover
  brWithHover: 'bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F]',
} as const

// Type exports for TypeScript autocomplete
export type LogoColor = keyof typeof LOGO_COLORS
export type LogoHoverColor = keyof typeof LOGO_HOVER_COLORS
export type LogoGradient = keyof typeof LOGO_GRADIENTS
export type LogoGradientClass = keyof typeof LOGO_GRADIENT_CLASSES
