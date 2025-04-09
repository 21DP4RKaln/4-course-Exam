import { getRequestConfig } from 'next-intl/server';
import { locales } from './app/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as typeof locales[number])) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const messages = (await import(`./lib/messages/${locale}.json`)).default;

  return {
    messages,
    timeZone: 'UTC'
  };
});