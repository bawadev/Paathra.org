/**
 * Gradient Helper Utilities
 * Utilities for creating consistent gradient patterns using design system colors
 */

import { colorTokens } from '@/lib/design-system/tokens/colors'

// Gradient direction types
export type GradientDirection =
  | 'to-r'
  | 'to-l'
  | 'to-t'
  | 'to-b'
  | 'to-br'
  | 'to-bl'
  | 'to-tr'
  | 'to-tl'

// Gradient types based on context
export type GradientType =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'trust'
  | 'spiritual'
  | 'compassion'
  | 'peaceful'
  | 'donation'
  | 'monastery'
  | 'lotus'
  | 'enlightened'
  | 'sunset'
  | 'sunrise'
  | 'ocean'
  | 'forest'

// Gradient configuration interface
export interface GradientConfig {
  from: string
  via?: string
  to: string
  direction: GradientDirection
  opacity?: number
}

// Predefined gradient configurations
export const gradientConfigs: Record<GradientType, GradientConfig> = {
  // Core gradients
  primary: {
    from: colorTokens.primary[500],
    to: colorTokens.primary[700],
    direction: 'to-r',
  },
  secondary: {
    from: colorTokens.secondary[500],
    to: colorTokens.secondary[700],
    direction: 'to-r',
  },
  accent: {
    from: colorTokens.accent[400],
    to: colorTokens.accent[600],
    direction: 'to-r',
  },

  // Spiritual gradients
  trust: {
    from: colorTokens.trust[400],
    to: colorTokens.trust[600],
    direction: 'to-r',
  },
  spiritual: {
    from: colorTokens.spiritual[400],
    via: colorTokens.spiritual[500],
    to: colorTokens.spiritual[600],
    direction: 'to-br',
  },
  compassion: {
    from: colorTokens.compassion[400],
    to: colorTokens.compassion[600],
    direction: 'to-r',
  },

  // Context gradients
  peaceful: {
    from: colorTokens.spiritual[200],
    via: colorTokens.primary[200],
    to: colorTokens.spiritual[300],
    direction: 'to-br',
  },
  donation: {
    from: colorTokens.trust[500],
    to: colorTokens.primary[500],
    direction: 'to-r',
  },
  monastery: {
    from: colorTokens.primary[500],
    via: colorTokens.spiritual[400],
    to: colorTokens.spiritual[500],
    direction: 'to-br',
  },

  // Special gradients
  lotus: {
    from: colorTokens.spiritual[400],
    via: colorTokens.primary[400],
    to: colorTokens.accent[400],
    direction: 'to-br',
  },
  enlightened: {
    from: colorTokens.neutral[100],
    via: colorTokens.primary[100],
    to: colorTokens.primary[200],
    direction: 'to-r',
  },

  // Nature-inspired gradients
  sunset: {
    from: colorTokens.accent[400],
    via: colorTokens.primary[500],
    to: colorTokens.secondary[600],
    direction: 'to-br',
  },
  sunrise: {
    from: colorTokens.primary[300],
    via: colorTokens.accent[400],
    to: colorTokens.accent[500],
    direction: 'to-tr',
  },
  ocean: {
    from: colorTokens.trust[400],
    via: colorTokens.trust[500],
    to: colorTokens.spiritual[600],
    direction: 'to-br',
  },
  forest: {
    from: colorTokens.compassion[400],
    via: colorTokens.compassion[500],
    to: colorTokens.compassion[700],
    direction: 'to-br',
  },
}

// Get gradient CSS class string
export function getGradientClass(
  type: GradientType,
  customConfig?: Partial<GradientConfig>
): string {
  const config = { ...gradientConfigs[type], ...customConfig }
  const classes = [`bg-gradient-${config.direction}`]

  if (config.from) classes.push(`from-[${config.from}]`)
  if (config.via) classes.push(`via-[${config.via}]`)
  if (config.to) classes.push(`to-[${config.to}]`)
  if (config.opacity !== undefined) classes.push(`opacity-${config.opacity}`)

  return classes.join(' ')
}

// Get gradient CSS inline style
export function getGradientStyle(
  type: GradientType,
  customConfig?: Partial<GradientConfig>
): React.CSSProperties {
  const config = { ...gradientConfigs[type], ...customConfig }
  const directionMap: Record<GradientDirection, string> = {
    'to-r': 'to right',
    'to-l': 'to left',
    'to-t': 'to top',
    'to-b': 'to bottom',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
  }

  const direction = directionMap[config.direction]
  const colors = [config.from, config.via, config.to].filter(Boolean).join(', ')

  return {
    backgroundImage: `linear-gradient(${direction}, ${colors})`,
    ...(config.opacity !== undefined && { opacity: config.opacity }),
  }
}

// Get text gradient class (for gradient text)
export function getTextGradientClass(type: GradientType): string {
  return `${getGradientClass(type)} bg-clip-text text-transparent`
}

// Get background gradient with overlay (for cards/sections)
export function getBackgroundGradient(
  type: GradientType,
  opacity: number = 0.1
): string {
  const config = gradientConfigs[type]
  return `bg-gradient-${config.direction} from-[${config.from}]/${opacity * 100} ${
    config.via ? `via-[${config.via}]/${opacity * 100}` : ''
  } to-[${config.to}]/${opacity * 100}`
}

// Get subtle background gradient (for hover states)
export function getSubtleGradient(type: GradientType): string {
  return getBackgroundGradient(type, 0.05)
}

// Get border gradient (using border-image approach)
export function getBorderGradient(type: GradientType): React.CSSProperties {
  const config = gradientConfigs[type]
  const directionMap: Record<GradientDirection, string> = {
    'to-r': 'to right',
    'to-l': 'to left',
    'to-t': 'to top',
    'to-b': 'to bottom',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
  }

  const direction = directionMap[config.direction]
  const colors = [config.from, config.via, config.to].filter(Boolean).join(', ')

  return {
    borderImage: `linear-gradient(${direction}, ${colors}) 1`,
  }
}

// Create custom gradient
export function createGradient(
  from: string,
  to: string,
  via?: string,
  direction: GradientDirection = 'to-r'
): GradientConfig {
  return {
    from,
    via,
    to,
    direction,
  }
}

// Gradient presets for common use cases
export const gradientPresets = {
  // Button gradients
  buttonPrimary: 'donation',
  buttonSecondary: 'peaceful',
  buttonSpiritual: 'spiritual',
  buttonMonastery: 'monastery',
  buttonLotus: 'lotus',

  // Card gradients
  cardDonation: 'donation',
  cardMonastery: 'monastery',
  cardSpiritual: 'peaceful',
  cardEnlightened: 'enlightened',

  // Background gradients
  backgroundPeaceful: 'peaceful',
  backgroundTrust: 'trust',
  backgroundSpiritual: 'spiritual',

  // Hero gradients
  heroSunrise: 'sunrise',
  heroSunset: 'sunset',
  heroOcean: 'ocean',
  heroForest: 'forest',

  // Overlay gradients
  overlayDark: 'spiritual',
  overlayLight: 'enlightened',
} as const

// Get preset gradient
export function getPresetGradient(preset: keyof typeof gradientPresets): GradientConfig {
  const type = gradientPresets[preset] as GradientType
  return gradientConfigs[type]
}

// Animated gradient class generator
export function getAnimatedGradient(type: GradientType): string {
  return `${getGradientClass(type)} bg-[length:200%_200%] animate-gradient`
}

// Gradient with stops (for more control)
export interface GradientStop {
  color: string
  position: number // 0-100
}

export function createGradientWithStops(
  stops: GradientStop[],
  direction: GradientDirection = 'to-r'
): string {
  const directionMap: Record<GradientDirection, string> = {
    'to-r': 'to right',
    'to-l': 'to left',
    'to-t': 'to top',
    'to-b': 'to bottom',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
  }

  const dir = directionMap[direction]
  const colorStops = stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')

  return `linear-gradient(${dir}, ${colorStops})`
}

// Radial gradient helper
export function getRadialGradient(
  type: GradientType,
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' = 'center'
): string {
  const config = gradientConfigs[type]
  const colors = [config.from, config.via, config.to].filter(Boolean).join(', ')

  return `radial-gradient(circle at ${position}, ${colors})`
}

// Conic gradient helper (for circular designs)
export function getConicGradient(type: GradientType, startAngle: number = 0): string {
  const config = gradientConfigs[type]
  const colors = [config.from, config.via, config.to].filter(Boolean).join(', ')

  return `conic-gradient(from ${startAngle}deg, ${colors})`
}

// Mesh gradient (multiple gradients layered)
export function getMeshGradient(types: GradientType[]): string {
  return types
    .map((type, index) => {
      const opacity = 1 - index * 0.2
      const config = gradientConfigs[type]
      const colors = [config.from, config.via, config.to].filter(Boolean).join(', ')
      return `linear-gradient(${config.direction.replace('to-', '')}, ${colors})`
    })
    .join(', ')
}

// Get gradient for specific context
export function getContextGradient(
  context: 'donation' | 'monastery' | 'spiritual' | 'admin' | 'general'
): GradientType {
  const contextMap: Record<typeof context, GradientType> = {
    donation: 'donation',
    monastery: 'monastery',
    spiritual: 'spiritual',
    admin: 'secondary',
    general: 'primary',
  }

  return contextMap[context]
}

// Export for convenience
export { colorTokens }
