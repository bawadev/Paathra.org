/**
 * Enhanced Dana Design System - Animation Tokens
 * Meditation-inspired animations for peaceful user experience
 */

// Animation duration scale inspired by natural breathing patterns
export const durationTokens = {
  instant: "0ms",
  breathe: "150ms",    // Quick breath
  inhale: "300ms",     // Natural inhale
  exhale: "500ms",     // Natural exhale
  meditate: "750ms",   // Meditative pause
  contemplate: "1000ms", // Deep contemplation
  journey: "1500ms",   // Spiritual journey
} as const

// Easing curves inspired by natural movements
export const easingTokens = {
  // Standard easings
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",

  // Custom meditation-inspired easings
  breathe: "cubic-bezier(0.4, 0, 0.2, 1)",           // Smooth breathing
  meditation: "cubic-bezier(0.16, 1, 0.3, 1)",       // Peaceful entry
  lotus: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",     // Lotus opening
  ripple: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",  // Water ripple
  gentle: "cubic-bezier(0.25, 0.1, 0.25, 1)",        // Gentle movement
  serene: "cubic-bezier(0.23, 1, 0.32, 1)",          // Serene transition
} as const

// Animation keyframes for spiritual contexts
export const keyframeTokens = {
  // Fade animations
  fadeIn: {
    from: { opacity: "0", transform: "translateY(20px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },

  fadeOut: {
    from: { opacity: "1", transform: "translateY(0)" },
    to: { opacity: "0", transform: "translateY(-20px)" },
  },

  // Floating animation for peaceful movement
  float: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-10px)" },
  },

  // Gentle pulse for attention-drawing
  pulse: {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.7" },
  },

  // Breathing animation for loading states
  breathe: {
    "0%, 100%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.05)" },
  },

  // Ripple effect for interactions
  ripple: {
    "0%": {
      transform: "scale(0)",
      opacity: "1",
    },
    "100%": {
      transform: "scale(4)",
      opacity: "0",
    },
  },

  // Lotus bloom for success states
  bloom: {
    "0%": {
      transform: "scale(0.8) rotate(-5deg)",
      opacity: "0",
    },
    "50%": {
      transform: "scale(1.1) rotate(2deg)",
      opacity: "0.8",
    },
    "100%": {
      transform: "scale(1) rotate(0deg)",
      opacity: "1",
    },
  },

  // Slide animations for navigation
  slideInFromRight: {
    from: { transform: "translateX(100%)" },
    to: { transform: "translateX(0)" },
  },

  slideOutToRight: {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(100%)" },
  },

  slideInFromLeft: {
    from: { transform: "translateX(-100%)" },
    to: { transform: "translateX(0)" },
  },

  slideOutToLeft: {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(-100%)" },
  },

  // Scale animations for modals
  scaleIn: {
    from: {
      transform: "scale(0.95)",
      opacity: "0",
    },
    to: {
      transform: "scale(1)",
      opacity: "1",
    },
  },

  scaleOut: {
    from: {
      transform: "scale(1)",
      opacity: "1",
    },
    to: {
      transform: "scale(0.95)",
      opacity: "0",
    },
  },
} as const

// Component-specific animation presets
export const animationRoles = {
  // Page transitions
  page: {
    enter: {
      duration: durationTokens.meditate,
      easing: easingTokens.meditation,
      keyframes: "fadeIn",
    },
    exit: {
      duration: durationTokens.exhale,
      easing: easingTokens.gentle,
      keyframes: "fadeOut",
    },
  },

  // Component interactions
  button: {
    hover: {
      duration: durationTokens.breathe,
      easing: easingTokens.gentle,
      transform: "translateY(-2px)",
    },
    press: {
      duration: durationTokens.instant,
      easing: easingTokens.ease,
      transform: "scale(0.98)",
    },
  },

  // Card animations
  card: {
    hover: {
      duration: durationTokens.inhale,
      easing: easingTokens.lotus,
      transform: "translateY(-4px)",
      shadow: "elegantLg",
    },
    appear: {
      duration: durationTokens.meditate,
      easing: easingTokens.bloom,
      keyframes: "bloom",
    },
  },

  // Modal animations
  modal: {
    backdrop: {
      duration: durationTokens.exhale,
      easing: easingTokens.ease,
      keyframes: "fadeIn",
    },
    content: {
      duration: durationTokens.meditate,
      easing: easingTokens.meditation,
      keyframes: "scaleIn",
    },
  },

  // Loading animations
  loading: {
    spinner: {
      duration: durationTokens.journey,
      easing: easingTokens.linear,
      infinite: true,
    },
    pulse: {
      duration: durationTokens.contemplate,
      easing: easingTokens.breathe,
      infinite: true,
      keyframes: "pulse",
    },
    breathe: {
      duration: durationTokens.contemplate,
      easing: easingTokens.breathe,
      infinite: true,
      keyframes: "breathe",
    },
  },

  // Success animations
  success: {
    bloom: {
      duration: durationTokens.journey,
      easing: easingTokens.lotus,
      keyframes: "bloom",
    },
    ripple: {
      duration: durationTokens.meditate,
      easing: easingTokens.ripple,
      keyframes: "ripple",
    },
  },

  // Cultural-specific animations
  cultural: {
    // Gentle animations for Sinhala context
    sinhala: {
      duration: durationTokens.meditate,
      easing: easingTokens.serene,
    },
    // Crisp animations for English context
    english: {
      duration: durationTokens.inhale,
      easing: easingTokens.meditation,
    },
  },
} as const

// Utility functions
export function getAnimationDuration(key: keyof typeof durationTokens): string {
  return durationTokens[key]
}

export function getAnimationEasing(key: keyof typeof easingTokens): string {
  return easingTokens[key]
}

export function createAnimation(
  keyframes: keyof typeof keyframeTokens,
  duration: keyof typeof durationTokens,
  easing: keyof typeof easingTokens,
  options?: {
    delay?: string
    fillMode?: "none" | "forwards" | "backwards" | "both"
    iterationCount?: number | "infinite"
  }
): string {
  const baseAnimation = `${keyframes} ${durationTokens[duration]} ${easingTokens[easing]}`

  if (!options) return baseAnimation

  const parts = [baseAnimation]

  if (options.delay) parts.push(options.delay)
  if (options.iterationCount) parts.push(String(options.iterationCount))
  if (options.fillMode) parts.push(options.fillMode)

  return parts.join(" ")
}

// Export tokens
export const {
  breathe,
  inhale,
  exhale,
  meditate,
  contemplate,
  journey,
} = durationTokens

export const {
  meditation,
  lotus,
  ripple,
  gentle,
  serene,
} = easingTokens

export type DurationToken = keyof typeof durationTokens
export type EasingToken = keyof typeof easingTokens
export type KeyframeToken = keyof typeof keyframeTokens
export type AnimationRole = keyof typeof animationRoles