import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Explicitly allow geolocation API
  response.headers.set('Permissions-Policy', 'geolocation=(self)');
  response.headers.set('Feature-Policy', 'geolocation "self"');
  
  // Debug header to verify middleware is running
  response.headers.set('X-Middleware-Applied', 'true');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};
