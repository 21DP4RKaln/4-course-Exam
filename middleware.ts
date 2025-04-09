import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './app/i18n/config';

const PUBLIC_FILE = /\.(?!js$|tsx?$)([^.]+)$/;
const API_PATTERN = /^\/api\//;
const FAVICON_PATTERN = /^\/favicon\.ico$/;

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_FILE.test(pathname) || API_PATTERN.test(pathname) || FAVICON_PATTERN.test(pathname)) {
    return;
  }
 
  const locale = pathname.split('/')[1];

  if (!locales.includes(locale as typeof locales[number])) {
    const preferredLocale = 
      request.cookies.get('NEXT_LOCALE')?.value || 
      defaultLocale;
    
    return NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url)
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\.).*)']
};