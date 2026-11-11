import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page, auth api, and static files
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/logo.png' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authToken = request.cookies.get('bwr_auth_token')?.value;

  if (authToken !== 'auth_admin_authenticated' && authToken !== 'auth_teacher_authenticated') {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/' && !pathname.startsWith('/api/')) {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
