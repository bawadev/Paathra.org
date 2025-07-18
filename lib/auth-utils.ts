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
    
    console.log('Auth state cleared successfully')
  } catch (error) {
    console.error('Error clearing auth state:', error)
  }
}

export async function refreshAuthSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Session refresh failed:', error)
      // If refresh fails, clear everything and redirect to login
      await clearAuthState()
      return { success: false, error }
    }
    
    console.log('Session refreshed successfully')
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error during session refresh:', error)
    await clearAuthState()
    return { success: false, error }
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
    'session'
  ]
  
  const message = error.message.toLowerCase()
  return tokenErrorPatterns.some(pattern => message.includes(pattern))
}

export async function handleAuthError(error: any) {
  console.error('Handling auth error:', error)
  
  if (isTokenError(error)) {
    console.log('Token-related error detected, clearing auth state')
    await clearAuthState()
    
    // Optionally show a user-friendly message
    return {
      shouldRedirect: true,
      message: 'Your session has expired. Please sign in again.'
    }
  }
  
  return {
    shouldRedirect: false,
    message: 'An authentication error occurred. Please try again.'
  }
}
