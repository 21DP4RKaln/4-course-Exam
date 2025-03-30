import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { i18nConfig } from './app/i18n/config';
import { verifyJwtToken } from './lib/jwt';

// Define route protection types
type RouteAccess = {
  public: string[];
  specialist: string[];
  admin: string[];
};

// Configure protected routes
const routes: RouteAccess = {
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
  ]
};

// Paths to exclude from middleware processing
const excludedPaths = [
  '/api/',
  '/_next/',
  '/static/',
  '/images/',
  '/flags/',
  '/favicon.ico'
];

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
});

/**
 * Main middleware function with improved route protection
 */
export default async function middleware(request: NextRequest) {
  // Skip middleware for excluded paths
  const { pathname } = request.nextUrl;
  
  if (excludedPaths.some(path => pathname.startsWith(path)) || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Setup internationalization
  const segments = pathname.split('/');
  const locale = segments.length > 1 && i18nConfig.locales.includes(segments[1]) 
    ? segments[1] 
    : i18nConfig.defaultLocale;
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);
  requestHeaders.set('x-next-intl-timezone', 'Europe/Riga');
  
  // Get path without locale
  const pathWithoutLocale = segments.length > 1 && i18nConfig.locales.includes(segments[1])
    ? '/' + segments.slice(2).join('/')
    : pathname;
  
  // Apply intl middleware
  const response = intlMiddleware(request);
  
  // Allow access to public routes
  if (routes.public.some(route => pathWithoutLocale === route || pathWithoutLocale === '/')) {
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
  if (routes.specialist.some(path => pathWithoutLocale.startsWith(path)) && 
      !['SPECIALIST', 'ADMIN'].includes(payload.role)) {
    console.log(`Access denied to ${pathname} - Insufficient permissions`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  // Check admin routes
  if (routes.admin.some(path => pathWithoutLocale.startsWith(path)) && 
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