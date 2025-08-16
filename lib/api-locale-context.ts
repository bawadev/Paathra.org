import { headers } from 'next/headers'
import { routing } from '@/src/i18n/routing'

/**
 * Get the current locale from the request headers in API routes and server actions
 * This is set by the next-intl middleware
 */
export async function getLocaleFromHeaders(): Promise<string> {
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale')
  
  // Validate the locale and fallback to default if invalid
  if (locale && routing.locales.includes(locale as any)) {
    return locale
  }
  
  return routing.defaultLocale
}

/**
 * Get localized messages for server actions and API routes
 */
export async function getServerMessages(namespace?: string) {
  const locale = await getLocaleFromHeaders()
  
  try {
    const messages = (await import(`../messages/${locale}.json`)).default
    
    if (namespace) {
      return messages[namespace] || {}
    }
    
    return messages
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error)
    
    // Fallback to default locale
    const fallbackMessages = (await import(`../messages/${routing.defaultLocale}.json`)).default
    
    if (namespace) {
      return fallbackMessages[namespace] || {}
    }
    
    return fallbackMessages
  }
}

/**
 * Format error messages with locale context for API responses
 */
export async function formatApiError(
  errorKey: string,
  namespace: string = 'Common',
  fallback: string = 'An error occurred'
): Promise<string> {
  try {
    const messages = await getServerMessages(namespace)
    return messages[errorKey] || fallback
  } catch {
    return fallback
  }
}

/**
 * Utility for server actions that need locale context
 */
export function withLocaleContext<T extends any[], R>(
  action: (locale: string, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const locale = await getLocaleFromHeaders()
    return action(locale, ...args)
  }
}

/**
 * Example usage in a server action:
 * 
 * export const createMonastery = withLocaleContext(async (locale, formData) => {
 *   const messages = await getServerMessages('Monastery')
 *   
 *   try {
 *     // Your server action logic here
 *     return { success: true, message: messages.created }
 *   } catch (error) {
 *     return { 
 *       success: false, 
 *       message: await formatApiError('createError', 'Monastery', 'Failed to create monastery')
 *     }
 *   }
 * })
 */

/**
 * Middleware for API routes to add locale context
 */
export async function withApiLocale<T>(
  handler: (locale: string, ...args: any[]) => Promise<T>
) {
  const locale = await getLocaleFromHeaders()
  return (req: Request, ...args: any[]) => handler(locale, req, ...args)
}

/**
 * Get locale-specific database queries
 * Useful for content that might be stored in multiple languages
 */
export async function getLocalizedQuery(baseQuery: any) {
  const locale = await getLocaleFromHeaders()
  
  // Example: Add locale-specific ordering or filtering
  return {
    ...baseQuery,
    // Add locale context to queries if needed
    locale_context: locale
  }
}

/**
 * Format dates according to locale
 */
export async function formatDateForLocale(date: Date): Promise<string> {
  const locale = await getLocaleFromHeaders()
  
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'si': 'si-LK' // Sinhala (Sri Lanka)
  }
  
  const browserLocale = localeMap[locale] || 'en-US'
  
  return new Intl.DateTimeFormat(browserLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Format numbers according to locale
 */
export async function formatNumberForLocale(number: number): Promise<string> {
  const locale = await getLocaleFromHeaders()
  
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'si': 'si-LK'
  }
  
  const browserLocale = localeMap[locale] || 'en-US'
  
  return new Intl.NumberFormat(browserLocale).format(number)
}