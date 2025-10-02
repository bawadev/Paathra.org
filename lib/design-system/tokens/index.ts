/**
 * Enhanced Dana Design System - Design Tokens Index
 * Central export for all design tokens
 */

// Export all token modules
export * from './colors'
export * from './typography'
export * from './spacing'
export * from './animations'

// Re-export commonly used tokens for convenience
export {
  colorTokens,
  colorRoles,
  getColorValue,
  type ColorToken,
  type ColorScale,
  type SemanticColor,
  type CulturalTheme,
} from './colors'

export {
  typographyTokens,
  typographyRoles,
  getTypographyClass,
  getCulturalTypography,
  type FontFamily,
  type FontWeight,
  type FontSize,
  type TypographyRole,
} from './typography'

export {
  spacingTokens,
  spacingRoles,
  radiusTokens,
  radiusRoles,
  shadowTokens,
  zIndexTokens,
  getSpacing,
  getRadius,
  getShadow,
  getZIndex,
  type SpacingToken,
  type SpacingRole,
  type RadiusToken,
  type ShadowToken,
  type ZIndexToken,
} from './spacing'

export {
  durationTokens,
  easingTokens,
  keyframeTokens,
  animationRoles,
  getAnimationDuration,
  getAnimationEasing,
  createAnimation,
  type DurationToken,
  type EasingToken,
  type KeyframeToken,
  type AnimationRole,
} from './animations'

// Design token utilities
export const designTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
  zIndex: zIndexTokens,
  durations: durationTokens,
  easings: easingTokens,
  keyframes: keyframeTokens,
} as const

// Token categories for organization
export const tokenCategories = {
  color: ['primary', 'secondary', 'accent', 'trust', 'spiritual', 'compassion', 'neutral', 'semantic', 'cultural'] as const,
  typography: ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'cultural'] as const,
  spacing: ['component', 'layout', 'container', 'card', 'form', 'button', 'navigation', 'cultural'] as const,
  animation: ['duration', 'easing', 'keyframes', 'roles'] as const,
} as const

export type DesignTokenCategory = keyof typeof tokenCategories
export type DesignTokens = typeof designTokens