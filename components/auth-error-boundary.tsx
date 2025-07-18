'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AuthErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class AuthErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  AuthErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center p-8">
          <Card className="card-dana max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-[var(--accent-color)] rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-[var(--text-dark)]">Authentication Error</CardTitle>
              <CardDescription className="text-[var(--text-light)]">
                We encountered an issue with your session. This usually happens when your login has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-[var(--text-light)] bg-gray-50 p-3 rounded-lg">
                <strong>What happened?</strong>
                <br />
                Your authentication session may have expired or become invalid. This can happen after extended periods of inactivity.
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    // Clear any stored auth data and reload
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.reload()
                  }}
                  className="w-full btn-dana-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload and Sign In Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                  }}
                  className="w-full btn-dana-secondary"
                >
                  Try Again
                </Button>
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
