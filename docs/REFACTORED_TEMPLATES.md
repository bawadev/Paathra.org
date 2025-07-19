# Refactored Template Standards

This document outlines the new refactored templates and patterns that improve upon the original templates by reducing code duplication, improving maintainability, and providing better TypeScript support.

## 🚀 What's New

### Key Improvements
- **Reduced Code Duplication**: Common layout patterns extracted into reusable components
- **Better Type Safety**: Full TypeScript support with proper interfaces
- **Simplified Authentication**: Single `AuthGuard` component for all auth needs
- **Consistent Loading States**: Standardized loading patterns across all pages
- **Modular Architecture**: Components broken into smaller, reusable pieces
- **Better Separation of Concerns**: Layout, auth, and business logic separated

## 📁 New Component Structure

### Layout Components (`/components/layout/`)
- `PageLayout` - Main page wrapper with navigation, footer, and loading states
- `MainContent` - Standardized content container with proper padding
- `HeroSection` - Reusable hero section with title and subtitle

### Authentication Components (`/components/auth/`)
- `AuthGuard` - Role-based access control with consistent UI
- `useAuthCheck` - Hook for simplified auth checks
- `RoleBasedContent` - Conditional rendering based on user roles

## 🏗️ Usage Patterns

### 1. Basic Page (No Auth Required)

```tsx
'use client'

import { PageLayout, MainContent, HeroSection } from '@/components/layout/page-layout'

export default function MyPage() {
  return (
    <PageLayout>
      <HeroSection 
        title="My Page Title"
        subtitle="Page description goes here"
      />
      
      <MainContent>
        {/* Your page content */}
      </MainContent>
    </PageLayout>
  )
}
```

### 2. Protected Page (Auth Required)

```tsx
'use client'

import { AuthGuard } from '@/components/auth/auth-guard'
import { PageLayout, MainContent } from '@/components/layout/page-layout'

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <PageLayout>
        <MainContent>
          {/* Protected content */}
        </MainContent>
      </PageLayout>
    </AuthGuard>
  )
}
```

### 3. Role-Specific Page

```tsx
'use client'

import { AuthGuard } from '@/components/auth/auth-guard'
import { PageLayout, MainContent } from '@/components/layout/page-layout'

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="super_admin">
      <PageLayout>
        <MainContent>
          {/* Admin-only content */}
        </MainContent>
      </PageLayout>
    </AuthGuard>
  )
}
```

### 4. Custom Loading State

```tsx
'use client'

import { PageLayout } from '@/components/layout/page-layout'

export default function LoadingExample() {
  const [loading, setLoading] = useState(true)
  
  return (
    <PageLayout loading={loading} loadingText="Loading your data...">
      <MainContent>
        {/* Content shown when loading is false */}
      </MainContent>
    </PageLayout>
  )
}
```

## 🎯 Advanced Patterns

### Using useAuthCheck Hook

```tsx
'use client'

import { useAuthCheck } from '@/components/auth/auth-guard'

function MyComponent() {
  const { isAuthenticated, hasRequiredRole, user, profile, loading } = useAuthCheck('monastery_admin')
  
  if (loading) return <div>Checking permissions...</div>
  if (!isAuthenticated) return <div>Please log in</div>
  if (!hasRequiredRole) return <div>Insufficient permissions</div>
  
  return <div>Welcome, {profile?.full_name}!</div>
}
```

### Conditional Content Based on Roles

```tsx
'use client'

import { RoleBasedContent } from '@/components/auth/auth-guard'

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <RoleBasedContent allowedRoles={['super_admin']}>
        <AdminPanel />
      </RoleBasedContent>
      
      <RoleBasedContent allowedRoles={['monastery_admin', 'super_admin']}>
        <MonasteryPanel />
      </RoleBasedContent>
      
      <RoleBasedContent allowedRoles={['donor']}>
        <DonorPanel />
      </RoleBasedContent>
    </div>
  )
}
```

## 📋 Migration Guide

### From Old Templates to New

#### Old Protected Page Pattern:
```tsx
// OLD WAY
export default function OldPage() {
  const { user, profile, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <AuthForm />
  if (!hasRole(profile, 'admin')) return <div>Access denied</div>
  
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-32">...</main>
      <Footer />
    </div>
  )
}
```

#### New Protected Page Pattern:
```tsx
// NEW WAY
export default function NewPage() {
  return (
    <AuthGuard requiredRole="admin">
      <PageLayout>
        <MainContent>
          {/* Your content */}
        </MainContent>
      </PageLayout>
    </AuthGuard>
  )
}
```

## 🎨 Styling Consistency

### CSS Custom Properties (Unchanged)
- `--primary-color`: `#D4AF37` (Gold)
- `--secondary-color`: `#8B4513` (Brown)
- `--accent-color`: `#FF6B6B` (Coral)
- `--text-dark`: `#2C3E50`
- `--text-light`: `#7F8C8D`
- `--bg-light`: `#F8F9FA`
- `--bg-white`: `#FFFFFF`

### Utility Classes (Unchanged)
- `.gradient-text` - Gradient text effects
- `.fade-in-1`, `.fade-in-2`, etc. - Staggered animations
- `.container-dana` - Standardized container
- `.card-dana` - Consistent card styling

## 🔧 Component Props Reference

### PageLayout Props
```typescript
interface PageLayoutProps {
  children?: React.ReactNode
  loading?: boolean
  className?: string
  showNavigation?: boolean  // default: true
  showFooter?: boolean      // default: true
  loadingText?: string      // default: "Loading..."
}
```

### AuthGuard Props
```typescript
interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserType  // 'donor' | 'monastery_admin' | 'super_admin'
  fallback?: React.ReactNode
  loadingMessage?: string
  unauthorizedMessage?: string
  showRoleIcon?: boolean   // default: true
}
```

### HeroSection Props
```typescript
interface HeroSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}
```

## 📦 File Structure

```
/components/
  /layout/
    page-layout.tsx      # Main layout wrapper
  /auth/
    auth-guard.tsx       # Authentication wrapper
/templates/
  page-template-refactored.tsx        # Standard page template
  protected-page-template-refactored.tsx  # Protected page template
```

## 🔄 Backward Compatibility

The refactored templates are **fully backward compatible** with existing code. You can:
- Gradually migrate pages one at a time
- Use both old and new patterns simultaneously
- Keep existing pages unchanged if they work well

## 🚀 Quick Start

1. **Start with new pages**: Use the refactored templates for new pages
2. **Migrate complex pages**: Move pages with lots of auth logic first
3. **Update simple pages**: Gradually update simpler pages
4. **Test thoroughly**: Ensure all auth flows work correctly

## 📝 Best Practices

1. **Always use AuthGuard** for protected pages instead of manual auth checks
2. **Use MainContent** for consistent padding and container sizing
3. **Leverage HeroSection** for consistent page headers
4. **Break complex pages** into smaller components (as shown in Settings example)
5. **Use TypeScript interfaces** for all props and state
6. **Maintain consistent error handling** with toast notifications

## 🐛 Common Issues

### Issue: "Property 'children' is missing"
**Solution**: Make sure PageLayout has `children?: React.ReactNode` (already fixed in the refactored version)

### Issue: AuthGuard not working
**Solution**: Ensure you're importing from the correct path and wrapping the entire page component

### Issue: Styling inconsistencies
**Solution**: Always use the CSS custom properties and utility classes from the design system