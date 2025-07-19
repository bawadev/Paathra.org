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
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => parseInt(val)).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Security
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
})

// Parse and validate environment variables
function createEnv() {
  const parsed = envSchema.safeParse(process.env)
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.format())
    throw new Error('Invalid environment variables')
  }
  
  return parsed.data
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
