import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const resolvedParams = await params
  const locale = resolvedParams.locale || 'en'
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? `/${locale}`

  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    locale,
    origin,
    fullUrl: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  })
  
  // Debug: Log the complete OAuth flow
  if (!code && !error) {
    console.error('❌ No code or error received from OAuth provider')
    console.error('This usually indicates Google OAuth is not properly configured in Supabase')
    console.error('Check: Supabase Dashboard → Authentication → Providers → Google')
  }

  // Check for OAuth errors first
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    const redirectResponse = NextResponse.redirect(`${origin}${next}`)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            redirectResponse.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            redirectResponse.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    console.log('Attempting to exchange code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=exchange_failed&description=${encodeURIComponent(exchangeError.message)}`)
    }
    
    if (data?.session) {
      console.log('Authentication successful, redirecting to:', next)
      return redirectResponse
    } else {
      console.error('No session returned after code exchange')
      return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=no_session&description=Authentication+completed+but+no+session+was+created`)
    }
  }

  console.log('No code provided, redirecting to error page')
  console.error('🐛 Debug: No code parameter found in callback')
  console.error('🐛 This indicates the OAuth provider did not redirect with authorization code')
  console.error('🐛 Check your Google OAuth configuration in Supabase Dashboard')
  
  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=no_code&description=Google+OAuth+is+not+properly+configured+in+Supabase+Dashboard`)
}