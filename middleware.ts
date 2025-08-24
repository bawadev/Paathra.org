import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // For now, allow all authenticated users to access monastery-admin routes
  // The authentication and role checking will be handled at the component level
  const url = req.nextUrl.clone()
  const locale = url.pathname.split('/')[1] || 'en'

  // Only redirect super admin routes (not monastery-admin) to auth for now
  if (url.pathname.includes('/admin') && !url.pathname.includes('/monastery-admin')) {
    // Redirect super admin routes to auth page for now
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