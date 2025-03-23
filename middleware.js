import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { i18nConfig } from './app/i18n/config';
import { verifyJwtToken } from './lib/edgeJWT';

async function verifyToken(token) {
  try {
    const payload = await verifyJwtToken(token);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
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
    '/help',
    '/ready-configs',   
    '/configurator'     
  ];
  
  const specialistPaths = [
    '/specialist-dashboard',
    '/approve-configs',
    '/service-orders'
  ];
  
  const adminPaths = [
    '/admin-dashboard',
    '/manage-users',
    '/manage-components'
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
  
  if (!token) {
    console.log(`Access denied to ${pathname} - No token`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    console.log(`Access denied to ${pathname} - Invalid token`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (specialistPaths.some(path => pathWithoutLocale.startsWith(path)) && 
      !['SPECIALIST', 'ADMIN'].includes(payload.role)) {
    console.log(`Access denied to ${pathname} - Insufficient permissions`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  if (adminPaths.some(path => pathWithoutLocale.startsWith(path)) && 
      payload.role !== 'ADMIN') {
    console.log(`Access denied to ${pathname} - Insufficient permissions`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  console.log(`Access granted to ${pathname} - Valid token, role: ${payload.role}`);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*).*)']
};