import { supabase } from '@/lib/supabase'

export async function clearAuthState() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()

    // Clear all local storage
    localStorage.clear()
    sessionStorage.clear()

    // Clear any cookies (if needed)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.slice(0, eqPos) : c
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
  } catch (error) {
    console.error('Error clearing auth state:', error)
  }
}

export async function refreshAuthSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Session refresh failed:', error)
      
      // Handle specific refresh token errors
      if (isRefreshTokenError(error)) {
        await clearAuthState()
        return {
          success: false,
          error,
          shouldRedirect: true,
          message: 'Your session has expired. Please sign in again.'
        }
      }

      // If refresh fails for other reasons, clear everything and redirect to login
      await clearAuthState()
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Unexpected error during session refresh:', error)

    // Check if it's a refresh token error
    if (isRefreshTokenError(error)) {
      await clearAuthState()
      return {
        success: false,
        error,
        shouldRedirect: true,
        message: 'Your session has expired. Please sign in again.'
      }
    }
    
    await clearAuthState()
    return { success: false, error }
  }
}

// Function to handle any auth-related API call with automatic refresh token error handling
export async function withAuthErrorHandling<T>(
  apiCall: () => Promise<T>,
  onRefreshTokenError?: () => void
): Promise<T | null> {
  try {
    return await apiCall()
  } catch (error: any) {
    if (isRefreshTokenError(error)) {
      await clearAuthState()
      if (onRefreshTokenError) {
        onRefreshTokenError()
      }
      return null
    }
    throw error // Re-throw non-refresh-token errors
  }
}

export function isTokenError(error: any): boolean {
  if (!error?.message) return false
  
  const tokenErrorPatterns = [
    'refresh',
    'token',
    'expired',
    'invalid',
    'unauthorized',
    'authentication',
    'session',
    'refresh token not found',
    'invalid refresh token'
  ]
  
  const message = error.message.toLowerCase()
  return tokenErrorPatterns.some(pattern => message.includes(pattern))
}

export function isRefreshTokenError(error: any): boolean {
  if (!error?.message) return false
  
  const refreshTokenPatterns = [
    'invalid refresh token',
    'refresh token not found',
    'refresh token expired',
    'authapierror'
  ]
  
  const message = error.message.toLowerCase()
  return refreshTokenPatterns.some(pattern => message.includes(pattern))
}

export async function handleAuthError(error: any) {
  console.error('Handling auth error:', error)

  // Handle specific refresh token errors
  if (isRefreshTokenError(error)) {
    await clearAuthState()

    return {
      shouldRedirect: true,
      message: 'Your session has expired. Please sign in again.',
      errorType: 'refresh_token'
    }
  }

  // Handle general token-related errors
  if (isTokenError(error)) {
    await clearAuthState()

    return {
      shouldRedirect: true,
      message: 'Your session has expired. Please sign in again.',
      errorType: 'token'
    }
  }

  return {
    shouldRedirect: false,
    message: 'An authentication error occurred. Please try again.',
    errorType: 'general'
  }
}
