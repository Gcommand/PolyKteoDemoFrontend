import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security: Function to validate URL paths and reject control characters
function validateUrlPath(url: string): boolean {
  // Check for control characters (0x00-0x1F and 0x7F)
  // These characters should not appear in valid URL paths
  const controlCharPattern = /[\x00-\x1F\x7F]/;
  
  if (controlCharPattern.test(url)) {
    return false;
  }
  
  // Additional security checks for common attack patterns
  // Check for null bytes, excessive path traversal attempts
  if (url.includes('\0') || url.includes('%00')) {
    return false;
  }
  
  return true;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname + request.nextUrl.search;
  
  // Security: Validate URL path
  if (!validateUrlPath(url)) {
    console.warn(`[MIDDLEWARE] [SECURITY] Blocked request with invalid characters: ${url}`);
    return new NextResponse('Bad Request: Invalid URL path', { 
      status: 400,
      headers: {
        'X-Security-Error': 'Invalid URL path'
      }
    });
  }
  
  // Log security-relevant requests for monitoring
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[MIDDLEWARE] [SECURITY] API request validated: ${request.method} ${url}`);
  }
  
  return NextResponse.next()
}

export const config = {
  // Apply to routes but exclude Next.js static assets
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 