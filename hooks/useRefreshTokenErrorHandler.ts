'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isRefreshTokenError, clearAuthState } from '@/lib/auth-utils'
import { toast } from 'sonner'

export function useRefreshTokenErrorHandler() {
  const router = useRouter()

  const handleError = useCallback(async (error: any) => {
    if (isRefreshTokenError(error)) {
      console.log('Refresh token error detected, clearing auth state')
      
      // Clear auth state
      await clearAuthState()
      
      // Show user-friendly message
      toast.error('Your session has expired. Please sign in again.')
      
      // Redirect to home/login page
      router.push('/')
      
      return true // Indicates the error was handled
    }
    
    return false // Indicates the error was not handled
  }, [router])

  const wrapApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      return await apiCall()
    } catch (error: any) {
      const wasHandled = await handleError(error)
      if (wasHandled) {
        return null
      }
      throw error // Re-throw if not a refresh token error
    }
  }, [handleError])

  return {
    handleError,
    wrapApiCall
  }
}

// Usage example in components:
// const { wrapApiCall } = useRefreshTokenErrorHandler()
// 
// const fetchData = async () => {
//   const result = await wrapApiCall(async () => {
//     const { data, error } = await supabase.from('table').select('*')
//     if (error) throw error
//     return data
//   })
//   
//   if (result) {
//     setData(result)
//   }
// }
