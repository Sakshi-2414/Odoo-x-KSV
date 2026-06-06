import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth cookie
  const authToken = request.cookies.get('vend_auth')?.value;
  
  // Public routes
  const isPublicRoute = request.nextUrl.pathname === '/login' || 
                        request.nextUrl.pathname.startsWith('/api/auth') ||
                        request.nextUrl.pathname.startsWith('/_next') ||
                        request.nextUrl.pathname.startsWith('/images') ||
                        request.nextUrl.pathname === '/favicon.ico';

  if (!authToken && !isPublicRoute) {
    // Redirect to login if unauthenticated and trying to access a protected route
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (authToken && request.nextUrl.pathname === '/login') {
    // Redirect to dashboard if already authenticated
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
