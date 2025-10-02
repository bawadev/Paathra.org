'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function AuthCodeErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')

  const getErrorMessage = () => {
    switch (error) {
      case 'exchange_failed':
        return `Code exchange failed: ${description}`
      case 'no_code':
        return description || 'No authentication code received from the provider'
      case 'access_denied':
        return 'Access was denied by the authentication provider'
      case 'redirect_uri_mismatch':
        return 'Redirect URL mismatch - check your OAuth configuration'
      case 'invalid_client':
        return 'Invalid client configuration - check your OAuth settings'
      case 'unauthorized_client':
        return 'Unauthorized client - OAuth provider not properly configured'
      default:
        return description || 'Unknown authentication error occurred'
    }
  }

  const getDebugSteps = () => {
    switch (error) {
      case 'no_code':
        return [
          'Google OAuth is not configured in Supabase',
          'Check Supabase Dashboard → Authentication → Providers → Google',
          'Verify Google Client ID and Secret are set correctly',
          'Ensure redirect URLs match between Google Console and Supabase'
        ]
      case 'redirect_uri_mismatch':
        return [
          'Redirect URL in Google Console doesn\'t match Supabase',
          'Add all required redirect URLs to Google Console',
          'Check both localhost and production URLs'
        ]
      default:
        return [
          'Check your internet connection',
          'Try clearing browser cache and cookies',
          'Use a different browser or incognito mode',
          'Contact support if the issue persists'
        ]
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-light)]">
      <Card className="dana-card p-8 max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[var(--text-dark)]">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-[var(--text-light)]">
            We couldn&apos;t complete your authentication. This might be due to:
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-600">
                <strong>Error:</strong> {getErrorMessage()}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--text-dark)]">Steps to fix:</h3>
            <ul className="text-sm text-[var(--text-light)] space-y-2">
              {getDebugSteps().map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/en/auth')}
              className="flex-1 dana-button dana-button-primary"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/en')}
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-light)]">
        <Card className="dana-card p-8 max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[var(--text-dark)]">
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  )
}