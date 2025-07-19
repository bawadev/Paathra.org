/**
 * Protected Page Template
 * 
 * Use this template for pages that require authentication and/or specific roles.
 * This template includes:
 * - Authentication checks
 * - Role-based access control
 * - Proper error handling
 * - Consistent layout
 */

'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthForm } from '@/components/auth-form'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { hasRole } from '@/types/auth'
import { Shield, AlertCircle } from 'lucide-react'

interface ProtectedPageProps {
  requiredRole?: 'donor' | 'monastery_admin' | 'super_admin' // Optional role requirement
}

export default function ProtectedTemplatePage({ requiredRole }: ProtectedPageProps = {}) {
  const { user, profile, loading } = useAuth()

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)]">Loading...</div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return <AuthForm />
  }

  // Role-based access control (if required)
  if (requiredRole && !hasRole(profile, requiredRole)) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Navigation />
        <div className="pt-32 pb-20 px-5">
          <div className="container-dana">
            <div className="max-w-md mx-auto">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  You don't have permission to access this page. Required role: {requiredRole}
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button asChild className="btn-dana-outline">
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      {/* Protected Content Header */}
      <section className="pt-32 pb-20 px-5">
        <div className="container-dana">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-[var(--primary-color)] mr-3" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                <span className="gradient-text fade-in-1">Protected Page</span>
              </h1>
            </div>
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto fade-in-2">
              This is a protected page that requires authentication
              {requiredRole && ` and ${requiredRole} role`}.
            </p>
          </div>

          {/* User Info Card */}
          <Card className="max-w-md mx-auto mb-12 card-dana fade-in-3">
            <CardHeader>
              <CardTitle>Welcome, {profile?.full_name || user.email}</CardTitle>
              <CardDescription>
                Role: {profile?.user_types?.join(', ') || 'User'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-light)]">
                You have successfully authenticated and have access to this protected content.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Protected Content */}
      <section className="pb-20 px-5">
        <div className="container-dana">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Protected Feature 1 */}
            <Card className="card-dana fade-in-4">
              <CardHeader>
                <CardTitle>Protected Feature</CardTitle>
                <CardDescription>
                  This content is only visible to authenticated users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-light)] mb-4">
                  Add your protected content here. This could include user-specific
                  data, administrative tools, or role-specific functionality.
                </p>
                <Button className="btn-dana-primary">
                  Take Action
                </Button>
              </CardContent>
            </Card>

            {/* Protected Feature 2 */}
            <Card className="card-dana fade-in-5">
              <CardHeader>
                <CardTitle>Role-Specific Content</CardTitle>
                <CardDescription>
                  Content that varies based on user role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-light)] mb-4">
                  This area can display different content based on the user's role
                  and permissions within the application.
                </p>
                <Button variant="outline" className="btn-dana-outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
