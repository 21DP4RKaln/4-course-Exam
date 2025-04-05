// middleware.ts - Optimized route protection and internationalization
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/i18n';
import { verifyJwtToken } from './lib/jwt';

// Define route protection types
type RouteConfig = {
  public: string[];      // Routes accessible without authentication
  specialist: string[];  // Routes requiring specialist or admin role
  admin: string[];       // Routes requiring admin role only
  excluded: string[];    // Paths to exclude from middleware processing
};

// Configure protected routes
const routes: RouteConfig = {
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
  
  excluded: [
    '/api/',
    '/_next/',
    '/static/',
    '/images/',
    '/flags/',
    '/favicon.ico'
  ]
};

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/**
 * Helper to check if path should be excluded from middleware
 */
function isExcludedPath(pathname: string): boolean {
  return routes.excluded.some(path => pathname.startsWith(path)) || pathname.includes('.');
}

/**
 * Helper to extract path without locale
 */
function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  return segments.length > 1 && locales.includes(segments[1] as any)
    ? '/' + segments.slice(2).join('/')
    : pathname;
}

/**
 * Helper to get locale from path
 */
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  return segments.length > 1 && locales.includes(segments[1] as any)
    ? segments[1]
    : defaultLocale;
}

/**
 * Helper to check if path is public
 */
function isPublicPath(pathWithoutLocale: string): boolean {
  return routes.public.some(route => 
    pathWithoutLocale === route || pathWithoutLocale === '/'
  );
}

/**
 * Helper to check if path requires specialist role
 */
function isSpecialistPath(pathWithoutLocale: string): boolean {
  return routes.specialist.some(path => pathWithoutLocale.startsWith(path));
}

/**
 * Helper to check if path requires admin role
 */
function isAdminPath(pathWithoutLocale: string): boolean {
  return routes.admin.some(path => pathWithoutLocale.startsWith(path));
}

/**
 * Main middleware function with improved route protection
 */
export default async function middleware(request: NextRequest) {
  // Skip middleware for excluded paths
  const { pathname } = request.nextUrl;
  
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }
  
  // Setup internationalization
  const locale = getLocaleFromPath(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);
  requestHeaders.set('x-next-intl-timezone', 'Europe/Riga');
  
  // Get path without locale
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  
  // Apply intl middleware
  const response = intlMiddleware(request);
  
  // Allow access to public routes
  if (isPublicPath(pathWithoutLocale)) {
    return response;
  }
  
  // Get token and verify
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`Access denied to ${pathname} - No token`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  const payload = await verifyJwtToken(token);
  if (!payload) {
    console.log(`Access denied to ${pathname} - Invalid token`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check specialist routes
  if (isSpecialistPath(pathWithoutLocale) && 
      !['SPECIALIST', 'ADMIN'].includes(payload.role)) {
    console.log(`Access denied to ${pathname} - Insufficient permissions`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  // Check admin routes
  if (isAdminPath(pathWithoutLocale) && 
      payload.role !== 'ADMIN') {
    console.log(`Access denied to ${pathname} - Insufficient permissions`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  // Access granted
  console.log(`Access granted to ${pathname} - Valid token, role: ${payload.role}`);
  return response;
}

// Configure path matcher
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};