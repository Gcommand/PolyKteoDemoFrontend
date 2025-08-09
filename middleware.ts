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
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const url = request.nextUrl.pathname + request.nextUrl.search;
  
  // Extract client information (Edge Runtime compatible)
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referrer = request.headers.get('referer') || '-';
  
  // Security: Validate URL path
  if (!validateUrlPath(url)) {
    console.warn(`[${requestId}] [MIDDLEWARE] [SECURITY] Blocked request with invalid characters: ${url} from ${clientIP}`);
    
    // Log access attempt for blocked request
    const endTime = Date.now();
    const duration = endTime - startTime;
    const accessLog = `${clientIP} - - [${new Date().toISOString()}] "${request.method} ${url} HTTP/1.1" 400 25 "${referrer}" "${userAgent}" ${duration}ms [${requestId}]`;
    console.log(`[ACCESS] ${accessLog}`);
    
    return new NextResponse('Bad Request: Invalid URL path', { 
      status: 400,
      headers: {
        'X-Security-Error': 'Invalid URL path'
      }
    });
  }
  
  // Enhanced request logging
  if (!request.nextUrl.pathname.startsWith('/_next/static')) {
    console.log(`[${requestId}] [MIDDLEWARE] ${request.method} ${url} from ${clientIP}`);
  }
  
  // Enhanced logging for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[${requestId}] [MIDDLEWARE] [API] ${request.method} ${url} from ${clientIP}`);
  }
  
  // Create response and add access logging
  const response = NextResponse.next();
  
  // Add request ID to response headers for debugging
  response.headers.set('X-Request-ID', requestId);
  
  // Log access - simplified for Edge Runtime
  const endTime = Date.now();
  const duration = endTime - startTime;
  const accessLog = `${clientIP} - - [${new Date().toISOString()}] "${request.method} ${url} HTTP/1.1" 200 0 "${referrer}" "${userAgent}" ${duration}ms [${requestId}]`;
  console.log(`[ACCESS] ${accessLog}`);
  
  return response;
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