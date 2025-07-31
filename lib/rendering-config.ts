// Rendering configuration for different page types in the hybrid approach

export interface PageRenderingConfig {
  type: 'static' | 'ssr' | 'isr' | 'client'
  revalidate?: number // For ISR pages
  description: string
}

export const renderingConfig: Record<string, PageRenderingConfig> = {
  // Static pages - pre-rendered at build time
  '/': {
    type: 'static',
    description: 'Home page - static content with translations'
  },
  
  // ISR pages - static with periodic regeneration
  '/monasteries': {
    type: 'isr',
    revalidate: 3600, // Revalidate every hour
    description: 'Monasteries listing - semi-dynamic content'
  },
  
  '/admin/dashboard': {
    type: 'isr',
    revalidate: 300, // Revalidate every 5 minutes
    description: 'Admin dashboard - frequently updated stats'
  },
  
  // SSR pages - server-rendered on each request
  '/my-donations': {
    type: 'ssr',
    description: 'User-specific donation history'
  },
  
  '/manage': {
    type: 'ssr',
    description: 'Monastery management - user-specific content'
  },
  
  // Client-side rendered pages - highly interactive
  '/donate': {
    type: 'client',
    description: 'Donation booking form - interactive with real-time data'
  },
  
  '/location-demo': {
    type: 'client',
    description: 'Location picker - interactive maps and geolocation'
  },
  
  // Admin pages - mostly SSR for security and fresh data
  '/admin/users': {
    type: 'ssr',
    description: 'User management - sensitive data requiring fresh state'
  },
  
  '/admin/monasteries': {
    type: 'ssr',
    description: 'Monastery approval - requires fresh data'
  },
  
  '/admin/analytics': {
    type: 'isr',
    revalidate: 900, // Revalidate every 15 minutes
    description: 'Analytics dashboard - can be cached for performance'
  }
}

export function getRenderingConfig(pathname: string): PageRenderingConfig {
  return renderingConfig[pathname] || {
    type: 'client',
    description: 'Default client-side rendering'
  }
}

export function getStaticPaths(): string[] {
  return Object.entries(renderingConfig)
    .filter(([_, config]) => config.type === 'static')
    .map(([path]) => path)
}

export function getISRPaths(): Array<{ path: string; revalidate: number }> {
  return Object.entries(renderingConfig)
    .filter(([_, config]) => config.type === 'isr')
    .map(([path, config]) => ({
      path,
      revalidate: config.revalidate || 3600
    }))
}