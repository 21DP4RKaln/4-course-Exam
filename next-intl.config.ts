import { getRequestConfig } from 'next-intl/server';
import { locales } from './app/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as typeof locales[number])) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const messages = (await import(`./lib/messages/${locale}.json`)).default;

  return {
    messages,
    timeZone: 'UTC',
    now: new Date(), 
    formats: {
      dateTime: {
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        },
        long: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'EUR'
        }
      }
    }
  };
});