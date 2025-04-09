import { getRequestConfig } from 'next-intl/server';
import { locales } from './app/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as string)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  return {
    messages: (await import(`./lib/messages/${locale}.json`)).default
  };
});