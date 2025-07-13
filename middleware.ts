import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/manage',
  '/admin',
  '/donate',
  '/my-donations',
  '/api/monasteries',
  '/api/donation-slots',
  '/api/bookings',
]

// Routes that require specific roles
const roleProtectedRoutes = {
  '/admin': ['super_admin'],
  '/manage': ['monastery_admin', 'super_admin'],
  '/api/donation-slots': ['monastery_admin', 'super_admin'], // for POST requests
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check authentication
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Redirect to home page for unauthenticated users
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      const redirectUrl = new URL('/', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check role-based access
    for (const [route, requiredRoles] of Object.entries(roleProtectedRoutes)) {
      if (req.nextUrl.pathname.startsWith(route)) {
        // Get user profile to check roles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_types')
          .eq('user_id', user.id)
          .single()

        const userRoles = profile?.user_types || []
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

        if (!hasRequiredRole) {
          if (req.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            )
          }
          
          // Redirect to home page for insufficient permissions
          return NextResponse.redirect(new URL('/', req.url))
        }
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
