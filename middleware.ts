import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/i18n';
import { verifyJwtToken } from './lib/jwt';

const routeConfig = {
  public: [
    '/login', 
    '/register', 
    '/',
    '/about',
    '/models',
    '/peripherals',
    '/help',
    '/ready-configs',
    '/configurator'
  ],
  protected: [
    '/dashboard',
    '/profile',
    '/cart',
    '/checkout',
    '/configurator'
  ],
  specialist: [
    '/specialist-dashboard',
    '/approve-configs',
    '/service-orders',
    '/specialist/ready-configs'
  ],
  admin: [
    '/admin-dashboard',
    '/manage-users',
    '/manage-components',
    '/manage-ready-configs',
    '/admin/pending-configs'
  ],
  excludedPatterns: [
    '/api/',
    '/_next/',
    '/static/',
    '/images/',
    '/flags/',
    '/favicon.ico'
  ]
};

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/**
 * Pārbauda vai ceļš atbilst kādam no norādītajiem paterniem
 */
function pathMatchesPatterns(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => 
    pathname.startsWith(pattern) || 
    pathname.includes('.')
  );
}

/**
 * Iegūst ceļu bez lokalizācijas prefiksa
 */
function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && locales.includes(segments[1] as any)) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

/**
 * Iegūst lokalizāciju no ceļa
 */
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && locales.includes(segments[1] as any)) {
    return segments[1];
  }
  return defaultLocale;
}

/**
 * Pārbauda vai ceļam ir nepieciešamas konkrētas tiesības
 */
function checkPathPermissions(pathWithoutLocale: string, userId: string, userRole: string): { allowed: boolean, redirectPath?: string } {
  if (routeConfig.public.some(path => 
    pathWithoutLocale === path || 
    pathWithoutLocale === '/' ||
    (path !== '/' && pathWithoutLocale.startsWith(path))
  )) {
    return { allowed: true };
  }

  if (!userId) {
    return { allowed: false };
  }

  if (routeConfig.protected.some(path => pathWithoutLocale.startsWith(path))) {
    return { allowed: true };
  }

  if (routeConfig.specialist.some(path => pathWithoutLocale.startsWith(path))) {
    if (['SPECIALIST', 'ADMIN'].includes(userRole)) {
      return { allowed: true };
    } else {
      return { allowed: false, redirectPath: '/dashboard' };
    }
  }

  if (routeConfig.admin.some(path => pathWithoutLocale.startsWith(path))) {
    if (userRole === 'ADMIN') {
      return { allowed: true };
    } else {
      return { allowed: false, redirectPath: '/dashboard' };
    }
  }

  return { allowed: !!userId };
}

/**
 * Galvenā middleware funkcija
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathMatchesPatterns(pathname, routeConfig.excludedPatterns)) {
    return NextResponse.next();
  }

  const locale = getLocaleFromPath(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);
  requestHeaders.set('x-next-intl-timezone', 'Europe/Riga');

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const response = intlMiddleware(request);

  const token = request.cookies.get('token')?.value;
  let userId = null;
  let userRole = null;
  
  if (token) {
    try {
      const payload = await verifyJwtToken(token);
      if (payload) {
        userId = payload.userId;
        userRole = payload.role;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  const { allowed, redirectPath } = checkPathPermissions(pathWithoutLocale, userId, userRole);
  
  if (!allowed) {
    if (!userId) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      return NextResponse.redirect(new URL(`/${locale}${redirectPath || '/dashboard'}`, request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};