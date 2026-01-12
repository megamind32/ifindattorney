import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Explicitly allow geolocation API
  response.headers.set('Permissions-Policy', 'geolocation=(self)');
  // Also add as legacy header name for older browsers
  response.headers.set('Feature-Policy', 'geolocation "self"');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
