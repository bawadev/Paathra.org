'use client'

import React, { Component, ReactNode } from 'react'
import { isRefreshTokenError, clearAuthState } from '@/lib/auth-utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class RefreshTokenErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RefreshTokenErrorBoundary caught an error:', error, errorInfo)
    
    // Check if it's a refresh token error
    if (isRefreshTokenError(error)) {
      console.log('Refresh token error detected in error boundary')
      await clearAuthState()
      
      // Redirect to login or home page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.error && isRefreshTokenError(this.state.error)) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Session Expired
              </h2>
              <p className="text-yellow-700 mb-4">
                Your session has expired. Please sign in again.
              </p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/'
                  }
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        )
      }
      
      // Fallback for other errors
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-700 mb-4">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component version
export function withRefreshTokenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithRefreshTokenErrorBoundaryComponent(props: P) {
    return (
      <RefreshTokenErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </RefreshTokenErrorBoundary>
    )
  }
}
