import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Allow geolocation, camera, microphone, and other permissions
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(self), camera=(), microphone=(), payment=()'
  );

  // Additional security headers that allow geolocation
  response.headers.set(
    'Cross-Origin-Embedder-Policy',
    'require-corp'
  );

  return response;
}

// Apply middleware to all routes
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
};
