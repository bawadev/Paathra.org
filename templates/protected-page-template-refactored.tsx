/**
 * Refactored Protected Page Template
 * 
 * Modernized version using the new AuthGuard and layout components.
 * This template demonstrates best practices for protected pages.
 */

'use client'

import { AuthGuard } from '@/components/auth/auth-guard'
import { PageLayout, MainContent, HeroSection } from '@/components/layout/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import { UserType } from '@/types/auth'

interface ProtectedPageProps {
  requiredRole?: UserType
  title?: string
  subtitle?: string
}

export default function ProtectedTemplatePage({ 
  requiredRole, 
  title = 'Protected Page',
  subtitle = 'This is a protected page that requires authentication'
}: ProtectedPageProps = {}) {
  return (
    <AuthGuard requiredRole={requiredRole}>
      <PageLayout>
        <HeroSection 
          title={title}
          subtitle={`${subtitle}${requiredRole ? ` and ${requiredRole} role` : ''}.`}
          icon={<Shield className="w-8 h-8 text-[var(--primary-color)]" />}
        />
        
        <MainContent>
          {/* User Info Card */}
          <UserWelcomeCard />
          
          {/* Protected Content Grid */}
          <ProtectedContentGrid />
        </MainContent>
      </PageLayout>
    </AuthGuard>
  )
}

/**
 * User welcome card component
 */
function UserWelcomeCard() {
  const { useAuth } = require('@/lib/auth-context')
  const { user, profile } = useAuth()
  
  return (
    <Card className="max-w-md mx-auto mb-12 card-dana fade-in-3">
      <CardHeader>
        <CardTitle>Welcome, {profile?.full_name || user?.email}</CardTitle>
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
  )
}

/**
 * Protected content grid component
 */
function ProtectedContentGrid() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
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
  )
}

/**
 * Usage examples:
 * 
 * // Basic protected page
 * export default function MyProtectedPage() {
 *   return <ProtectedTemplatePage />
 * }
 * 
 * // Role-specific page
 * export default function AdminPage() {
 *   return <ProtectedTemplatePage requiredRole="super_admin" title="Admin Dashboard" />
 * }
 */