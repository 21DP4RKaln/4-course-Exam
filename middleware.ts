import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isValidLocale, locales, defaultLocale } from './app/i18n/config'

const PUBLIC_FILE = /\.(.*)$/
const API_PATTERN = /^\/api\/.*/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
 
  if (
    PUBLIC_FILE.test(pathname) || 
    API_PATTERN.test(pathname)
  ) {
    return
  }

  let locale = pathname.split('/')[1]

  if (!isValidLocale(locale)) {
    const preferredLocale = 
      request.cookies.get('NEXT_LOCALE')?.value || 
      defaultLocale
 
    return NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}