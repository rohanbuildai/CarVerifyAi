import { NextResponse } from 'next/server';

/**
 * Next.js middleware for auth protection and route guards.
 * Runs on every request matching the configured paths.
 */

const PUBLIC_ROUTES = new Set([
  '/',
  '/pricing',
  '/login',
  '/register',
  '/privacy',
  '/terms',
]);

const ADMIN_ROUTES = ['/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (set by backend auth)
  const sessionToken = request.cookies.get('cv_session')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route guard — role check happens server-side,
  // but we can do a basic client-side guard with a cookie hint
  const isAdmin = request.cookies.get('cv_role')?.value === 'admin';
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
