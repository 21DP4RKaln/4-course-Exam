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

  // Izlaist middleware API maršrutiem
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Izlaist middleware publiskajiem ceļiem
  if (PUBLIC_PATHS.some(pattern => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Apstrādāt lokalizācijas maršrutēšanu
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

  // Iegūt lokāli no ceļa
  const locale = pathname.split('/')[1];

  // Apstrādāt autentifikāciju aizsargātajiem maršrutiem
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

      // Apstrādāt admina maršrutus
      if (ADMIN_PATHS.test(pathname)) {
        if (payload.role !== 'ADMIN') {
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url)
          );
        }
      }

      // Apstrādāt speciālistu maršrutus
      if (SPECIALIST_PATHS.test(pathname)) {
        if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url)
          );
        }
      }

      // Pievienot lietotāja informāciju pieprasījuma galvenēm
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
    // Izlaist publiskos failus un API maršrutus
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Atbilst visiem ceļiem, izņemot statiskos failus un API maršrutus
    '/((?!api/promo/validate|_next/static|_next/image|favicon.ico).*)',
  ],
};
