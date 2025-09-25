// Design System Theme Configuration
export const theme = {
  // Color Palette - Dana Design System
  colors: {
    primary: {
      50: '#fefbf2',
      100: '#fdf6e3',
      200: '#faeac0',
      300: '#f6d797',
      400: '#f1c165',
      500: '#d4af37', // Primary Gold
      600: '#b8952b',
      700: '#9a7b23',
      800: '#7c6220',
      900: '#65511b',
    },
    secondary: {
      50: '#f5f2f0',
      100: '#e8e0db',
      200: '#d4c5bb',
      300: '#bba395',
      400: '#a18570',
      500: '#8b4513', // Secondary Brown
      600: '#7a3c11',
      700: '#65320e',
      800: '#52290c',
      900: '#42220a',
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ff6b6b', // Accent Coral
      600: '#e55353',
      700: '#c53e3e',
      800: '#a53232',
      900: '#8b2929',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#2c3e50', // Text Dark
      900: '#171717',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
      ],
      sinhala: [
        'var(--font-sinhala)',
        'Noto Sans Sinhala',
        'Abhaya Libre',
        'Sinhala MN',
        'Iskoola Pota',
        'sans-serif',
      ],
      serif: [
        'var(--font-sinhala-serif)',
        'Abhaya Libre',
        'Sinhala MN',
        'Noto Serif Sinhala',
        'serif',
      ],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Spacing
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
    // Dana specific shadows
    gold: '0 4px 15px rgb(212 175 55 / 0.3)',
    goldHover: '0 8px 25px rgb(212 175 55 / 0.4)',
  },

  // Animations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const

// Utility functions
export const rgba = (color: string, alpha: number) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`

// Animation keyframes
export const keyframes = {
  fadeIn: {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  fadeInUp: {
    '0%': { opacity: 0, transform: 'translateY(30px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
  },
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  },
}

// Component variants
export const variants = {
  button: {
    primary: {
      backgroundColor: theme.colors.primary[500],
      color: '#ffffff',
      '&:hover': {
        backgroundColor: theme.colors.primary[600],
        transform: 'translateY(-1px)',
        boxShadow: theme.boxShadow.gold,
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[500],
      border: `2px solid ${theme.colors.primary[500]}`,
      '&:hover': {
        backgroundColor: theme.colors.primary[500],
        color: '#ffffff',
        transform: 'translateY(-1px)',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: theme.colors.neutral[100],
      },
    },
  },
  card: {
    default: {
      backgroundColor: '#ffffff',
      borderRadius: theme.borderRadius['2xl'],
      boxShadow: theme.boxShadow.md,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.boxShadow.lg,
      },
    },
    elevated: {
      backgroundColor: '#ffffff',
      borderRadius: theme.borderRadius['2xl'],
      boxShadow: theme.boxShadow.xl,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.boxShadow['2xl'],
      },
    },
  },
}