import createMiddleware from 'next-intl/middleware';
import { i18nConfig } from './app/i18n/config';

export default createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};