'use client'

import { useAuth } from '@/lib/auth-context'
import { hasRole } from '@/types/auth'
import { LoadingSpinner } from '@/components/loading'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Home } from 'lucide-react'
import Link from 'next/link'
import { ROUTES, USER_ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/types'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ComponentType
  requireAuth?: boolean
}

export function RouteGuard({ 
  children, 
  requiredRoles = [], 
  fallback: Fallback,
  requireAuth = true 
}: RouteGuardProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner />
          <span className="text-muted-foreground">Checking permissions...</span>
        </div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    if (Fallback) {
      return <Fallback />
    }
    return <UnauthorizedFallback />
  }

  // Check role requirements
  if (requiredRoles.length > 0 && profile) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(profile, role))
    
    if (!hasRequiredRole) {
      if (Fallback) {
        return <Fallback />
      }
      return <InsufficientPermissionsFallback requiredRoles={requiredRoles} />
    }
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}

// Fallback components
function UnauthorizedFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You need to sign in to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={ROUTES.HOME}>
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function InsufficientPermissionsFallback({ requiredRoles }: { requiredRoles: UserRole[] }) {
  const roleNames = {
    [USER_ROLES.DONOR]: 'Donor',
    [USER_ROLES.MONASTERY_ADMIN]: 'Monastery Admin',
    [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  }

  const requiredRoleNames = requiredRoles.map(role => roleNames[role]).join(', ')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need {requiredRoleNames} permissions to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" variant="outline">
            <Link href={ROUTES.HOME}>
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Higher-order component for easy use
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <RouteGuard {...options}>
      <Component {...props} />
    </RouteGuard>
  )

  WrappedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`
  
  return WrappedComponent
}
