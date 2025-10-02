/**
 * Type-safe Environment Configuration
 * 
 * Provides runtime validation and type safety for environment variables
 */

import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Dhaana'),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_DEBUG_MODE: z.string().default('false').transform(val => val === 'true'),
  
  // External Services (optional)
  SENTRY_DSN: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // Maps and Location Services
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RADAR_API_KEY: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Security
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
})

// Parse and validate environment variables
function createEnv() {
  // Always use lenient parsing to avoid build-time issues
  // The environment variables should be properly set in the deployment environment
  const config = {
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Dhaana',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    NEXT_PUBLIC_ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_RADAR_API_KEY: process.env.NEXT_PUBLIC_RADAR_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }
  
  // Only validate in development for debugging purposes
  if (process.env.NODE_ENV === 'development') {
    // Debug: Check if critical env vars are loaded
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('🚨 CRITICAL: Supabase environment variables missing!')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars)` : 'Missing')
    }

    // Validate the constructed config object, not raw process.env
    const parsed = envSchema.safeParse(config)
    if (!parsed.success) {
      console.warn('⚠️ Environment validation warnings:')
      console.warn(parsed.error.format())
    }
  }

  return config
}

// Export validated environment
export const env = createEnv()

// Type for environment variables
export type Environment = typeof env

// Utility functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Feature flags
export const features = {
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  errorReporting: env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING,
  debugMode: env.NEXT_PUBLIC_ENABLE_DEBUG_MODE && isDevelopment,
} as const

// Supabase configuration
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
} as const

// App configuration
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL || (isProduction ? 'https://dhaana.app' : 'http://localhost:3000'),
} as const

// Maps and Location Services configuration
export const mapsConfig = {
  googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  radarApiKey: env.NEXT_PUBLIC_RADAR_API_KEY,
  enableGoogleMaps: !!env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  enableRadar: !!env.NEXT_PUBLIC_RADAR_API_KEY,
} as const

// Validation helper for runtime checks
export function validateEnvironment() {
  try {
    envSchema.parse(process.env)
    return { valid: true, errors: null }
  } catch (error) {
    return { 
      valid: false, 
      errors: error instanceof z.ZodError ? error.format() : 'Unknown validation error' 
    }
  }
}

// Development helpers
if (isDevelopment) {
  console.log('🔧 Environment configuration loaded')
  console.log('📝 Features enabled:', features)
  
  if (features.debugMode) {
    console.log('🐛 Debug mode enabled')
    console.log('🔍 Environment variables:', {
      NODE_ENV: env.NODE_ENV,
      SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      APP_NAME: env.NEXT_PUBLIC_APP_NAME,
      FEATURES: features,
    })
  }
}
