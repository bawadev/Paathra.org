# Dhaana Template Standards

This document outlines the standardized templates and patterns used throughout the Dhaana codebase to ensure consistency and maintainability.

## Design System

### Color Palette
- **Primary**: `#D4AF37` (Gold) - Used for primary actions and highlights
- **Secondary**: `#8B4513` (Brown) - Used for secondary elements and text
- **Accent**: `#FF6B6B` (Coral) - Used for call-to-action elements
- **Text Dark**: `#2C3E50` - Primary text color
- **Text Light**: `#7F8C8D` - Secondary text color
- **Background Light**: `#F8F9FA` - Light background
- **Background White**: `#FFFFFF` - Pure white background

### CSS Custom Properties
Use the predefined CSS custom properties in `app/globals.css`:
- `var(--primary-color)`, `var(--secondary-color)`, `var(--accent-color)`
- `var(--text-dark)`, `var(--text-light)`
- `var(--bg-light)`, `var(--bg-white)`
- `var(--shadow)`, `var(--transition)`

### Utility Classes
- `.gradient-text` - For gradient text effects
- `.glass-effect` - For glassmorphism backgrounds
- `.fade-in-1`, `.fade-in-2`, `.fade-in-3`, `.fade-in-4` - Staggered animations
- `.container-dana` - Standardized container with proper padding and max-width

## Page Template Structure

### Standard Page Layout
```tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PageName() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-[var(--text-light)]">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="pt-32 pb-20 px-5">
        <div className="container-dana">
          {/* Page content */}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
```

### Protected Page Template
```tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthForm } from '@/components/auth-form'
import { Navigation } from '@/components/navigation'
import { hasRole } from '@/types/auth'

export default function ProtectedPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  // Optional: Role-based access control
  if (!hasRole(profile, 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-red-600">Access denied</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="pt-32 pb-20 px-5">
        <div className="container-dana">
          {/* Protected content */}
        </div>
      </main>
    </div>
  )
}
```

## Component Patterns

### Form Components
- Use React Hook Form with Zod validation
- Utilize `@/components/forms/FormFields` for consistent field styling
- Include proper error handling and loading states

### Cards and Layouts
- Use ShadCN Card components with consistent styling
- Apply hover effects and transitions for interactive elements
- Use the design system colors and spacing

### Navigation
- All pages should include `<Navigation />` component
- Use proper spacing (`pt-32`) to account for fixed navigation

## File Organization

### Directory Structure
```
/components/
  /ui/           # ShadCN components
  /forms/        # Form-related components
  navigation.tsx # Global navigation
  auth-form.tsx  # Authentication form
  loading.tsx    # Loading components

/app/
  layout.tsx     # Root layout
  page.tsx       # Home page
  /admin/        # Admin pages
  /manage/       # Management pages
  /monasteries/  # Monastery pages

/lib/
  auth-context.tsx # Authentication context
  supabase.ts     # Supabase client
  schemas.ts      # Zod schemas
  utils.ts        # Utility functions

/types/
  auth.ts         # Authentication types
```

### Naming Conventions
- Use kebab-case for file names: `auth-form.tsx`, `user-profile.tsx`
- Use PascalCase for component names: `AuthForm`, `UserProfile`
- Use camelCase for functions and variables: `getUserProfile`, `isLoading`

## Import Patterns

### Standard Imports Order
1. React and Next.js imports
2. Third-party libraries
3. Local components and utilities
4. Type imports (last)

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@/types/auth'
```

## Animation and Interactions

### Standard Animations
- Use CSS transitions for hover effects: `var(--transition)`
- Apply staggered fade-in animations for content: `.fade-in-1`, `.fade-in-2`, etc.
- Use consistent easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### Interactive Elements
- Buttons should have hover and focus states
- Cards should have subtle hover effects
- Use loading states for async operations

## Error Handling

### Error Boundaries
- Use `@/components/auth-error-boundary` for authentication errors
- Implement proper error states in components
- Display user-friendly error messages

### Loading States
- Always show loading indicators for async operations
- Use consistent loading UI across the application
- Implement skeleton loaders where appropriate

## Testing Considerations

### Component Testing
- Test components in isolation
- Mock authentication context when needed
- Test both loading and error states

### Page Testing
- Test navigation and routing
- Verify authentication flows
- Test responsive design
