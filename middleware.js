import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { i18nConfig } from './app/i18n/config';
import { verifyJwtToken } from './lib/edgeJWT';

async function verifyToken(token) {
  try {
    const payload = await verifyJwtToken(token);
    return payload !== null;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return false;
  }
}

const intlMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  timeZone: 'Europe/Riga'
});

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  const publicPaths = [
    '/login', 
    '/register', 
    '/',
    '/about',
    '/models',
    '/peripherals',
    '/help'
  ];
  
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const segments = pathname.split('/');
  const locale = segments.length > 1 && i18nConfig.locales.includes(segments[1]) 
    ? segments[1] 
    : i18nConfig.defaultLocale;
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);
  requestHeaders.set('x-next-intl-timezone', 'Europe/Riga');
  
  const pathWithoutLocale = segments.length > 1 && i18nConfig.locales.includes(segments[1])
    ? '/' + segments.slice(2).join('/')
    : pathname;
  
  const response = intlMiddleware(request);
  
  if (publicPaths.includes(pathWithoutLocale) || pathWithoutLocale === '/') {
    return response;
  }
  
  const token = request.cookies.get('token')?.value;
  
  if (!token || !(await verifyToken(token))) {
    console.log(`Access denied to ${pathname} - No valid token`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log(`Access granted to ${pathname} - Valid token`);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*).*)']
};