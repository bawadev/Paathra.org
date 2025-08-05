import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  console.log('Standard auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    origin,
    fullUrl: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  })

  // Check for OAuth errors first
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    // Get locale from localStorage or default to 'en'
    const locale = 'en' // Default locale for error cases
    return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    // Get stored locale from the referrer or default to 'en'
    const referrer = request.headers.get('referer') || ''
    const localeMatch = referrer.match(/\/([a-z]{2})\//)
    const locale = localeMatch ? localeMatch[1] : 'en'
    
    const redirectResponse = NextResponse.redirect(`${origin}/${locale}`)
    
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
      console.log('Authentication successful, redirecting to:', `/${locale}`)
      return redirectResponse
    } else {
      console.error('No session returned after code exchange')
      return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=no_session&description=Authentication+completed+but+no+session+was+created`)
    }
  }

  console.log('No code provided, redirecting to error page')
  console.error('🐛 Debug: No code parameter found in callback')
  console.error('🐛 This indicates the OAuth provider did not redirect with authorization code')
  
  const locale = 'en' // Default locale
  return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=no_code&description=Google+OAuth+is+not+properly+configured`)
}