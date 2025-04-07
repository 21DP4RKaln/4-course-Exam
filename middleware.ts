import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/i18n';
import { verifyJwtToken } from './lib/jwt';
interface RouteConfig {
  public: string[];   
  protected: string[];  
  specialist: string[]; 
  admin: string[];      
  excluded: string[];   
}

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
  
  excluded: [
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
 * Palīgfunkcija, lai pārbaudītu vai ceļu vajadzētu izslēgt no middleware
 */
function isExcludedPath(pathname: string): boolean {
  return routes.excluded.some(path => pathname.startsWith(path)) || 
         pathname.includes('.');
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
 * Pārbauda vai ceļš ir publisks
 */
function isPublicPath(pathWithoutLocale: string): boolean {
  return routes.public.some(route => 
    pathWithoutLocale === route || 
    pathWithoutLocale === '/' || 
    (route !== '/' && pathWithoutLocale.startsWith(route))
  );
}

/**
 * Pārbauda vai ceļš ir aizsargāts (prasa jebkādu autentifikāciju)
 */
function isProtectedPath(pathWithoutLocale: string): boolean {
  return routes.protected.some(path => 
    pathWithoutLocale.startsWith(path)
  );
}

/**
 * Pārbauda vai ceļam ir nepieciešama speciālista loma
 */
function isSpecialistPath(pathWithoutLocale: string): boolean {
  return routes.specialist.some(path => 
    pathWithoutLocale.startsWith(path)
  );
}

/**
 * Pārbauda vai ceļam ir nepieciešama administratora loma
 */
function isAdminPath(pathWithoutLocale: string): boolean {
  return routes.admin.some(path => 
    pathWithoutLocale.startsWith(path)
  );
}

/**
 * Galvenā middleware funkcija ar uzlabotu maršrutu aizsardzību
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  const locale = getLocaleFromPath(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);
  requestHeaders.set('x-next-intl-timezone', 'Europe/Riga');

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const response = intlMiddleware(request);

  if (isPublicPath(pathWithoutLocale)) {
    return response;
  }
  
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`Piekļuve liegta: ${pathname} - Nav tokena`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  const payload = await verifyJwtToken(token);
  if (!payload) {
    console.log(`Piekļuve liegta: ${pathname} - Nederīgs tokens`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isSpecialistPath(pathWithoutLocale) && 
      !['SPECIALIST', 'ADMIN'].includes(payload.role)) {
    console.log(`Piekļuve liegta: ${pathname} - Nepietiekamas tiesības`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  if (isAdminPath(pathWithoutLocale) && 
      payload.role !== 'ADMIN') {
    console.log(`Piekļuve liegta: ${pathname} - Nepietiekamas tiesības`);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  console.log(`Piekļuve atļauta: ${pathname} - Derīgs tokens, loma: ${payload.role}`);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};