import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './app/i18n/config';
import { verifyJWT } from './lib/auth/jwt';

const PUBLIC_PATHS = [
  /^\/_next\//,
  /\/api\/promo\/validate/,
  /\/favicon\.ico$/,
  /\.(jpg|jpeg|png|gif|svg|css|js)$/,
  /^\/(en|lv|ru)\/auth/,
  /^\/(en|lv|ru)\/unauthorized/,
];

const ADMIN_PATHS = /^\/(en|lv|ru)\/admin/;
const SPECIALIST_PATHS = /^\/(en|lv|ru)\/specialist/;
const HOME_PATH = /^\/(en|lv|ru)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(pattern => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Handle locale routing
  const pathnameHasLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(
        `/${defaultLocale}${pathname === '/' ? '' : pathname}`,
        request.url
      )
    );
  }

  // Get locale from path
  const locale = pathname.split('/')[1];

  // Handle authentication for protected routes
  if (ADMIN_PATHS.test(pathname) || SPECIALIST_PATHS.test(pathname)) {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      console.log('No token found, redirecting to auth');
      const redirectUrl = new URL(`/${locale}/auth/login`, request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      const payload = await verifyJWT(token);
      if (!payload) {
        throw new Error('Invalid token');
      }

      // Handle admin routes
      if (ADMIN_PATHS.test(pathname)) {
        if (payload.role !== 'ADMIN') {
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url)
          );
        }
      }

      // Handle specialist routes
      if (SPECIALIST_PATHS.test(pathname)) {
        if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url)
          );
        }
      }

      // Add user info to request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Authentication error:', error);
      const response = NextResponse.redirect(
        new URL(`/${locale}/auth/login`, request.url)
      );
      response.cookies.set({
        name: 'authToken',
        value: '',
        httpOnly: true,
        path: '/',
        expires: new Date(0),
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip public files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Match all paths except static files and api routes
    '/((?!api/promo/validate|_next/static|_next/image|favicon.ico).*)',
  ],
};
