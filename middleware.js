import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { i18nConfig } from './app/i18n/config';

function verifyToken(token) {
  try {
    jwt.verify(
      token, 
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );
    return true;
  } catch (error) {
    return false;
  }
}

const intlMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  timeZone: 'Europe/Riga'
});

export default function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  const publicPaths = [
    '/login', 
    '/register', 
    '/',
    '/about'
  ];
  
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const response = intlMiddleware(request);
  
  const segments = pathname.split('/');
  const locale = segments.length > 1 && i18nConfig.locales.includes(segments[1]) 
    ? segments[1] 
    : i18nConfig.defaultLocale;
  
  const pathWithoutLocale = segments.length > 1 && i18nConfig.locales.includes(segments[1])
    ? '/' + segments.slice(2).join('/')
    : pathname;
  
  if (publicPaths.includes(pathWithoutLocale) || pathWithoutLocale === '/') {
    return response;
  }
  
  const token = request.cookies.get('token')?.value;
  
  if (!token || !verifyToken(token)) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*).*)']
};