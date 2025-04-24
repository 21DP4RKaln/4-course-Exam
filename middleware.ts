import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from './app/i18n/config'

const PUBLIC_PATHS = [
  /^\/_next\//,
  /\/api\//,
  /\/favicon\.ico$/,
  /\.(jpg|jpeg|png|gif|svg|css|js)$/,
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(pattern => pattern.test(pathname))) {
    return NextResponse.next()
  }

  const pathnameHasLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  return NextResponse.redirect(
    new URL(
      `/${defaultLocale}${pathname === '/' ? '' : pathname}`,
      request.url
    )
  )
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}