/**
 * Centralized Error Management System
 * 
 * Provides consistent error handling, logging, and user feedback
 * across the entire application.
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'

// Error types for better categorization
export type ErrorType = 
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'CLIENT_ERROR'
  | 'UNKNOWN_ERROR'

export interface AppError {
  id: string
  type: ErrorType
  message: string
  code?: string
  details?: Record<string, any>
  timestamp: Date
  stack?: string
  userId?: string
  context?: Record<string, any>
}

interface ErrorContextType {
  errors: AppError[]
  reportError: (error: Error | AppError, context?: Record<string, any>) => void
  clearError: (errorId: string) => void
  clearAllErrors: () => void
  getErrorsByType: (type: ErrorType) => AppError[]
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

interface ErrorProviderProps {
  children: ReactNode
  enableLogging?: boolean
  maxErrors?: number
}

export function ErrorProvider({ 
  children, 
  enableLogging = true, 
  maxErrors = 50 
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([])

  const generateErrorId = () => `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const determineErrorType = (error: Error): ErrorType => {
    const message = error.message.toLowerCase()
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'AUTHENTICATION_ERROR'
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return 'AUTHORIZATION_ERROR'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR'
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR'
    }
    if (message.includes('server') || message.includes('internal')) {
      return 'SERVER_ERROR'
    }
    
    return 'UNKNOWN_ERROR'
  }

  const reportError = useCallback((
    error: Error | AppError, 
    context?: Record<string, any>
  ) => {
    let appError: AppError

    if ('type' in error) {
      // Already an AppError
      appError = error
    } else {
      // Convert Error to AppError
      appError = {
        id: generateErrorId(),
        type: determineErrorType(error),
        message: error.message,
        timestamp: new Date(),
        stack: error.stack,
        context
      }
    }

    // Add to errors state
    setErrors(prev => {
      const newErrors = [appError, ...prev]
      return newErrors.slice(0, maxErrors) // Limit number of stored errors
    })

    // Log error if enabled
    if (enableLogging) {
      console.error('[ErrorManager]', appError)
    }

    // Show user-friendly toast notification
    showUserNotification(appError)

    // TODO: Send to external logging service (e.g., Sentry, LogRocket)
    // sendToLoggingService(appError)

  }, [enableLogging, maxErrors])

  const showUserNotification = (error: AppError) => {
    const userMessage = getUserFriendlyMessage(error)
    
    switch (error.type) {
      case 'AUTHENTICATION_ERROR':
      case 'AUTHORIZATION_ERROR':
        toast.error(userMessage, {
          action: {
            label: 'Sign In',
            onClick: () => window.location.href = '/auth'
          }
        })
        break
      
      case 'NETWORK_ERROR':
        toast.error(userMessage, {
          action: {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        })
        break
      
      case 'VALIDATION_ERROR':
        toast.warning(userMessage)
        break
      
      default:
        toast.error(userMessage)
    }
  }

  const getUserFriendlyMessage = (error: AppError): string => {
    switch (error.type) {
      case 'AUTHENTICATION_ERROR':
        return 'Please sign in to continue'
      
      case 'AUTHORIZATION_ERROR':
        return 'You don\'t have permission to perform this action'
      
      case 'NETWORK_ERROR':
        return 'Connection problem. Please check your internet and try again'
      
      case 'VALIDATION_ERROR':
        return error.message || 'Please check your input and try again'
      
      case 'SERVER_ERROR':
        return 'Server error. We\'re working to fix this'
      
      default:
        return error.message || 'Something went wrong. Please try again'
    }
  }

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getErrorsByType = useCallback((type: ErrorType) => {
    return errors.filter(error => error.type === type)
  }, [errors])

  const value: ErrorContextType = {
    errors,
    reportError,
    clearError,
    clearAllErrors,
    getErrorsByType
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

/**
 * Higher-order component for error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>
) {
  return function WrappedComponent(props: P) {
    const { reportError } = useError()
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState<AppError | null>(null)

    const handleError = (error: Error) => {
      const appError: AppError = {
        id: `boundary_${Date.now()}`,
        type: 'CLIENT_ERROR',
        message: error.message,
        timestamp: new Date(),
        stack: error.stack
      }
      
      setError(appError)
      setHasError(true)
      reportError(appError)
    }

    const retry = () => {
      setHasError(false)
      setError(null)
    }

    if (hasError && error) {
      if (fallback) {
        const FallbackComponent = fallback
        return <FallbackComponent error={error} retry={retry} />
      }
      
      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button 
              onClick={retry}
              className="dana-button dana-button-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    try {
      return <Component {...props} />
    } catch (error) {
      if (error instanceof Error) {
        handleError(error)
      }
      return null
    }
  }
}

/**
 * Hook for handling async operations with error management
 */
export function useAsyncError() {
  const { reportError } = useError()
  
  return useCallback(async function<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error: any) {
      if (error instanceof Error) {
        reportError(error, context)
      }
      return null
    }
  }, [reportError])
}

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  isNetworkError: (error: Error): boolean => {
    return error.message.toLowerCase().includes('fetch') || 
           error.message.toLowerCase().includes('network')
  },

  isAuthError: (error: Error): boolean => {
    return error.message.toLowerCase().includes('auth') ||
           error.message.toLowerCase().includes('unauthorized')
  },

  createError: (type: ErrorType, message: string, code?: string): AppError => ({
    id: `manual_${Date.now()}`,
    type,
    message,
    code,
    timestamp: new Date()
  })
}
