import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, AUTH_COOKIE_NAME, isAdministrativeRole, getRoleDefaultRedirect } from '@/lib/session';

// Whitelisted public routes accessible without authentication
const PUBLIC_PREFIXES = [
  '/login',
  '/admin/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/safety',
  '/security',
  '/contact',
  '/support',
  '/api/auth',
  '/api/payments/webhook',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static assets and internal next paths bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = sessionCookie || authHeader;

  // Verify session if token exists
  const sessionUser = token ? await verifySessionToken(token) : null;
  const isAuthenticated = Boolean(sessionUser);

  // Check if current route is in the public whitelist
  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // 3. Admin routes security enforcement
  if (pathname.startsWith('/admin')) {
    // Admin login page behavior
    if (pathname === '/admin/login') {
      if (isAuthenticated && isAdministrativeRole(sessionUser!.role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Protected /admin/* routes
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify role is administrative
    if (!isAdministrativeRole(sessionUser!.role)) {
      // Forbidden: authenticated user is a customer or companion, not staff
      const accessDeniedUrl = new URL('/login', request.url);
      accessDeniedUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(accessDeniedUrl);
    }

    return NextResponse.next();
  }

  // 3.5 Companion routes security enforcement
  if (pathname.startsWith('/companion') || pathname === '/dashboard/companion') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict role check: Customers cannot access companion dashboard
    if (sessionUser!.role !== 'companion' && !isAdministrativeRole(sessionUser!.role)) {
      return NextResponse.redirect(new URL('/explore', request.url));
    }

    if (pathname === '/dashboard/companion') {
      return NextResponse.redirect(new URL('/companion/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // 3.6 Customer routes security enforcement
  if (pathname.startsWith('/customer') || pathname === '/dashboard/customer') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Companions cannot access customer dashboard
    if (sessionUser!.role === 'companion') {
      return NextResponse.redirect(new URL('/companion/dashboard', request.url));
    }

    if (pathname === '/dashboard/customer') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // 4. Root homepage access (Strict Login-First rule)
  if (pathname === '/') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Authenticated user landing redirect
    const target = getRoleDefaultRedirect(sessionUser!.role);
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 5. Public route handling for authenticated visitors
  if (isPublicRoute) {
    // If logged in and visiting /login or /register, redirect to dashboard/explore
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      const target = getRoleDefaultRedirect(sessionUser!.role);
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // 6. All other protected routes require valid authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
