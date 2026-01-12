import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Set headers explicitly on response
  response.headers.set('Permissions-Policy', 'geolocation=(self)');
  response.headers.set('Feature-Policy', 'geolocation "self"');
  response.headers.set('X-Middleware-Applied', 'true');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
