import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Pages only serve GET/HEAD. Reject other methods with 405 unless the
  // request carries a Next-Action header (legitimate Server Action POST).
  // Without this, bots that POST to / or /en cause Next.js to attempt
  // server-action dispatch and crash with TypeError digest 1654678059.
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD') {
    if (!request.headers.has('Next-Action')) {
      return new NextResponse('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }
  }
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
