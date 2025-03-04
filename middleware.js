import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { i18nConfig } from './app/i18n/config';

const verifyToken = (token) => {
  try {
    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
    );
    return true;
  } catch (error) {
    return false;
  }
};

const intlMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale
});

export default function middleware(request) {
  const response = intlMiddleware(request);
  
  const publicPaths = [
    '/login', 
    '/register', 
    '/', '/about', 
    `/${i18nConfig.defaultLocale}`
  ];
  
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = i18nConfig.locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  if (pathnameIsMissingLocale) {
    return response;
  }
  
  const locale = pathname.split('/')[1];
  
  const isPublicPath = publicPaths.some(path => {
    return pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`);
  });
  
  if (pathname === `/${locale}` || pathname === '/') {
    return response;
  }
  
  const isApiOrStatic = pathname.includes('/api/') || 
                         pathname.includes('/_next/') ||
                         pathname.includes('/static/');
  
  if (isPublicPath || isApiOrStatic) {
    return response;
  }
  
  const cookieStore = request.cookies;
  const token = cookieStore.get('token')?.value;
  
  if (!token || !verifyToken(token)) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    
    if (!pathname.includes('/login')) {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};