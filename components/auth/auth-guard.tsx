/**
 * Authentication Guard Component
 * 
 * Provides role-based access control and authentication checks
 * with consistent UI patterns across the application.
 */

'use client'

import { useAuthStore } from '@/lib/stores/useAuthStore'
import { AuthForm } from '@/components/auth-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/page-layout'
import { hasRole, UserType } from '@/types/auth'
import { AlertCircle, Shield } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserType
  fallback?: React.ReactNode
  loadingMessage?: string
  unauthorizedMessage?: string
  showRoleIcon?: boolean
}

export function AuthGuard({
  children,
  requiredRole,
  fallback,
  loadingMessage = 'Checking authentication...',
  unauthorizedMessage,
  showRoleIcon = true
}: AuthGuardProps) {
  const { user, profile, loading } = useAuthStore()

  // Loading state
  if (loading) {
    return (
      <PageLayout loading loadingText={loadingMessage} />
    )
  }

  // Not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <AuthForm />
  }

  // Role-based access control
  if (requiredRole && !hasRole(profile, requiredRole)) {
    const message = unauthorizedMessage || 
      `You don't have permission to access this page. Required role: ${requiredRole}`

    return (
      <PageLayout>
        <div className="pt-32 pb-20 px-5">
          <div className="dana-container">
            <div className="max-w-md mx-auto">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button asChild className="dana-button dana-button-outline">
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return <>{children}</>
}

/**
 * Simplified auth check hook for components
 */
export function useAuthCheck(requiredRole?: UserType) {
  const { user, profile, loading } = useAuthStore()
  
  return {
    isAuthenticated: !!user,
    hasRequiredRole: requiredRole ? hasRole(profile, requiredRole) : true,
    user,
    profile,
    loading
  }
}

/**
 * Role-based content wrapper
 */
export function RoleBasedContent({
  allowedRoles,
  children,
  fallback
}: {
  allowedRoles: UserType[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { profile } = useAuthStore()
  
  const hasAccess = allowedRoles.some(role => hasRole(profile, role))
  
  if (!hasAccess) {
    return fallback || null
  }
  
  return <>{children}</>
}