import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
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

  // Check the signed session cookie (HMAC + expiry)
  const role = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!role) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเข้าสู่ระบบใหม่' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
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
