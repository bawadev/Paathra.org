'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'
import { isRefreshTokenError, clearAuthState } from '@/lib/auth-utils'

interface AuthErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isRefreshTokenError: boolean
}

class AuthErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  AuthErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null, isRefreshTokenError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    const isRefreshError = isRefreshTokenError(error)
    return { hasError: true, error, isRefreshTokenError: isRefreshError }
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo)
    
    // If it's a refresh token error, clear auth state
    if (isRefreshTokenError(error)) {
      console.log('Refresh token error detected in AuthErrorBoundary')
      await clearAuthState()
    }
  }

  render() {
    if (this.state.hasError) {
      const { isRefreshTokenError: isRefreshError } = this.state
      
      return (
        <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center p-8">
          <Card className="card-dana max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-[var(--accent-color)] rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-[var(--text-dark)]">
                {isRefreshError ? 'Session Expired' : 'Authentication Error'}
              </CardTitle>
              <CardDescription className="text-[var(--text-light)]">
                {isRefreshError 
                  ? 'Your session has expired and needs to be refreshed. Please sign in again.'
                  : 'We encountered an issue with your session. This usually happens when your login has expired.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-[var(--text-light)] bg-gray-50 p-3 rounded-lg">
                <strong>What happened?</strong>
                <br />
                {isRefreshError 
                  ? 'Your refresh token has expired or become invalid. This is a security measure that requires you to sign in again.'
                  : 'Your authentication session may have expired or become invalid. This can happen after extended periods of inactivity.'
                }
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    // Clear any stored auth data and reload
                    await clearAuthState()
                    window.location.href = '/'
                  }}
                  className="w-full btn-dana-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {isRefreshError ? 'Go to Sign In' : 'Reload and Sign In Again'}
                </Button>
                
                {!isRefreshError && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      this.setState({ hasError: false, error: null, isRefreshTokenError: false })
                    }}
                    className="w-full btn-dana-secondary"
                  >
                    Try Again
                  </Button>
                )}
              </div>
              
              {this.state.error && (
                <details className="text-xs text-gray-500 mt-4">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default AuthErrorBoundary
