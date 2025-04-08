import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'lv', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'lv';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return {
    messages,
    timeZone: 'Europe/Riga'
  };
});