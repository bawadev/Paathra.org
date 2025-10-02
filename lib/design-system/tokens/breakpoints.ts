/**
 * Enhanced Dana Design System - Responsive Breakpoints
 * Mobile-first breakpoint system with device-specific optimizations
 */

// Breakpoint tokens following standard conventions
export const breakpointTokens = {
  // Mobile-first breakpoints
  xs: '375px',     // Small mobile (iPhone SE, older devices)
  sm: '640px',     // Mobile landscape / small tablets
  md: '768px',     // Tablets portrait
  lg: '1024px',    // Tablets landscape / small laptops
  xl: '1280px',    // Laptops / desktops
  '2xl': '1536px', // Large desktops

  // Device-specific breakpoints for precise targeting
  mobile: {
    small: '375px',    // iPhone SE, small Android
    medium: '390px',   // iPhone 12/13/14
    large: '428px',    // iPhone 14 Pro Max
  },

  tablet: {
    small: '768px',    // iPad Mini, small tablets
    medium: '810px',   // iPad Air
    large: '1024px',   // iPad Pro 11"
    xlarge: '1366px',  // iPad Pro 12.9"
  },

  // Orientation-based breakpoints
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // Touch-specific queries
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
} as const

// Responsive typography scales
export const responsiveTypography = {
  // Display text - Hero sections
  display: {
    mobile: '2rem',      // 32px
    tablet: '2.5rem',    // 40px
    desktop: '3rem',     // 48px
  },

  // H1 headings
  h1: {
    mobile: '1.75rem',   // 28px
    tablet: '2.25rem',   // 36px
    desktop: '3rem',     // 48px
  },

  // H2 headings
  h2: {
    mobile: '1.5rem',    // 24px
    tablet: '1.875rem',  // 30px
    desktop: '2.25rem',  // 36px
  },

  // H3 headings
  h3: {
    mobile: '1.25rem',   // 20px
    tablet: '1.5rem',    // 24px
    desktop: '1.875rem', // 30px
  },

  // H4 headings
  h4: {
    mobile: '1.125rem',  // 18px
    tablet: '1.25rem',   // 20px
    desktop: '1.5rem',   // 24px
  },

  // Body text - CRITICAL: 16px minimum on mobile to prevent iOS zoom
  body: {
    large: {
      mobile: '1rem',      // 16px - iOS zoom prevention
      tablet: '1.125rem',  // 18px
      desktop: '1.25rem',  // 20px
    },
    default: {
      mobile: '1rem',      // 16px - iOS zoom prevention
      tablet: '1rem',      // 16px
      desktop: '1rem',     // 16px
    },
    small: {
      mobile: '0.875rem',  // 14px - Only for secondary text
      tablet: '0.875rem',  // 14px
      desktop: '0.875rem', // 14px
    },
  },

  // Form inputs - CRITICAL: Must be 16px on mobile
  input: {
    mobile: '1rem',      // 16px - Prevents iOS auto-zoom
    tablet: '1rem',      // 16px
    desktop: '0.875rem', // 14px - Can be smaller on desktop
  },

  // Labels
  label: {
    mobile: '0.875rem',  // 14px
    tablet: '0.875rem',  // 14px
    desktop: '0.875rem', // 14px
  },

  // Helper text
  helper: {
    mobile: '0.8125rem', // 13px
    tablet: '0.75rem',   // 12px
    desktop: '0.75rem',  // 12px
  },
} as const

// Touch target sizes (WCAG 2.1 Level AAA)
export const touchTargets = {
  // Minimum sizes
  minimum: '44px',       // WCAG AAA minimum
  recommended: '48px',   // Recommended for better UX
  comfortable: '56px',   // Extra comfortable on mobile

  // Context-specific targets
  icon: {
    small: '44px',       // Minimum for icon-only buttons
    default: '48px',     // Standard icon buttons
    large: '56px',       // Large prominent actions
  },

  button: {
    height: {
      small: '44px',     // Minimum height
      default: '48px',   // Standard button
      large: '56px',     // Large CTA buttons
    },
    padding: {
      mobile: '1rem',    // 16px horizontal padding
      tablet: '1.5rem',  // 24px
      desktop: '2rem',   // 32px
    },
  },

  input: {
    height: {
      mobile: '48px',    // Comfortable mobile input
      tablet: '48px',    // Standard
      desktop: '44px',   // Can be slightly smaller on desktop
    },
  },

  navItem: {
    height: '44px',      // Minimum for all nav items
    padding: '0.75rem',  // 12px vertical minimum
  },
} as const

// Spacing scales for different breakpoints
export const responsiveSpacing = {
  // Container padding
  container: {
    mobile: '1rem',      // 16px
    tablet: '1.5rem',    // 24px
    desktop: '2rem',     // 32px
  },

  // Section spacing
  section: {
    mobile: '2rem',      // 32px
    tablet: '3rem',      // 48px
    desktop: '4rem',     // 64px
  },

  // Component spacing
  component: {
    mobile: '1rem',      // 16px
    tablet: '1.5rem',    // 24px
    desktop: '2rem',     // 32px
  },

  // Element spacing (gaps, margins)
  element: {
    small: {
      mobile: '0.5rem',  // 8px
      tablet: '0.75rem', // 12px
      desktop: '1rem',   // 16px
    },
    default: {
      mobile: '1rem',    // 16px
      tablet: '1.25rem', // 20px
      desktop: '1.5rem', // 24px
    },
    large: {
      mobile: '1.5rem',  // 24px
      tablet: '2rem',    // 32px
      desktop: '2.5rem', // 40px
    },
  },
} as const

// Viewport-specific utilities
export const viewportUtils = {
  // Mobile-specific
  mobile: {
    hideOn: 'lg:hidden',           // Hide on desktop
    showOn: 'lg:block',            // Show only on desktop
    onlyMobile: 'lg:hidden',       // Mobile only
  },

  // Desktop-specific
  desktop: {
    hideOn: 'hidden lg:block',     // Hide on mobile
    showOn: 'block lg:hidden',     // Show only on mobile
    onlyDesktop: 'hidden lg:block', // Desktop only
  },

  // Tablet-specific
  tablet: {
    onlyTablet: 'hidden md:block lg:hidden', // Tablet only
  },
} as const

// Media query helpers for CSS-in-JS or styled components
export const mediaQueries = {
  // Min-width queries (mobile-first)
  up: {
    xs: `@media (min-width: ${breakpointTokens.xs})`,
    sm: `@media (min-width: ${breakpointTokens.sm})`,
    md: `@media (min-width: ${breakpointTokens.md})`,
    lg: `@media (min-width: ${breakpointTokens.lg})`,
    xl: `@media (min-width: ${breakpointTokens.xl})`,
    '2xl': `@media (min-width: ${breakpointTokens['2xl']})`,
  },

  // Max-width queries (desktop-first)
  down: {
    xs: `@media (max-width: calc(${breakpointTokens.xs} - 1px))`,
    sm: `@media (max-width: calc(${breakpointTokens.sm} - 1px))`,
    md: `@media (max-width: calc(${breakpointTokens.md} - 1px))`,
    lg: `@media (max-width: calc(${breakpointTokens.lg} - 1px))`,
    xl: `@media (max-width: calc(${breakpointTokens.xl} - 1px))`,
    '2xl': `@media (max-width: calc(${breakpointTokens['2xl']}) - 1px))`,
  },

  // Device-specific
  mobile: {
    all: `@media (max-width: calc(${breakpointTokens.md} - 1px))`,
    small: `@media (max-width: calc(${breakpointTokens.mobile.small} - 1px))`,
    medium: `@media (min-width: ${breakpointTokens.mobile.medium}) and (max-width: calc(${breakpointTokens.md} - 1px))`,
    large: `@media (min-width: ${breakpointTokens.mobile.large}) and (max-width: calc(${breakpointTokens.md} - 1px))`,
  },

  // Orientation
  landscape: `@media ${breakpointTokens.landscape}`,
  portrait: `@media ${breakpointTokens.portrait}`,

  // Touch capabilities
  touch: `@media ${breakpointTokens.touch}`,
  mouse: `@media ${breakpointTokens.mouse}`,
} as const

// Responsive component patterns
export const responsivePatterns = {
  // Stack on mobile, row on desktop
  stackToRow: 'flex flex-col md:flex-row',

  // Row on mobile, stack on desktop (rare, but useful)
  rowToStack: 'flex flex-row md:flex-col',

  // 1 column mobile, 2 tablet, 3 desktop
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',

  // 1 column mobile, 2 desktop
  gridTwoCol: 'grid grid-cols-1 md:grid-cols-2',

  // Full width mobile, auto desktop
  fullToAuto: 'w-full md:w-auto',

  // Hidden mobile, visible desktop
  hiddenMobile: 'hidden md:block',

  // Visible mobile, hidden desktop
  visibleMobile: 'block md:hidden',

  // Text sizes responsive
  textResponsive: 'text-sm md:text-base lg:text-lg',

  // Padding responsive
  paddingResponsive: 'p-4 md:p-6 lg:p-8',

  // Gap responsive
  gapResponsive: 'gap-4 md:gap-6 lg:gap-8',
} as const

// Export types
export type Breakpoint = keyof typeof breakpointTokens
export type ResponsiveTypographyScale = keyof typeof responsiveTypography

// Utility function to get breakpoint value
export function getBreakpoint(breakpoint: Breakpoint): string {
  return breakpointTokens[breakpoint]
}

// Utility function to check if viewport is mobile
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < parseInt(breakpointTokens.md)
}

// Utility function to check if viewport is tablet
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= parseInt(breakpointTokens.md) && width < parseInt(breakpointTokens.lg)
}

// Utility function to check if viewport is desktop
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= parseInt(breakpointTokens.lg)
}

// Utility function to get touch target size for context
export function getTouchTargetSize(context: 'icon' | 'button' | 'input' | 'navItem', size: 'small' | 'default' | 'large' = 'default'): string {
  if (context === 'icon') {
    return touchTargets.icon[size]
  }
  if (context === 'navItem') {
    return touchTargets.navItem.height
  }
  // For button and input, you'd access the height property
  return touchTargets.minimum
}
