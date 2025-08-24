import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Extract locale from the URL
  const url = req.nextUrl.clone()
  const locale = url.pathname.split('/')[1] || 'en'

  // For now, just redirect admin and monastery-admin routes to auth
  // This is a simple approach that avoids the complex Supabase middleware issues
  if (url.pathname.includes('/admin') || url.pathname.includes('/monastery-admin')) {
    // Redirect to auth page
    url.pathname = `/${locale}/auth`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}