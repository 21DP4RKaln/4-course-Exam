import { getRequestConfig } from 'next-intl/server';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// Import all language files
import en from '../../messages/en.json';
import lv from '../../messages/lv.json';
import ru from '../../messages/ru.json';

// Available locales and messages
export const locales = ['en', 'lv', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'en';
export const messages = { en, lv, ru };

// i18n configuration
export const i18nConfig = {
  locales,
  defaultLocale,
  timeZone: 'Europe/Riga'
};

// Navigation utilities with internationalization
export const { usePathname, useRouter } = createSharedPathnamesNavigation({ locales });

// Request configuration for server components
export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: messages[locale as keyof typeof messages],
    locale: locale,
    timeZone: 'Europe/Riga'
  };
});

// Client provider component for i18n
export function I18nProvider({ 
  children, 
  locale, 
  messages 
}: { 
  children: ReactNode; 
  locale: string; 
  messages: any; 
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Riga"
      now={new Date()}
    >
      {children}
    </NextIntlClientProvider>
  );
}

// Helper to get translated path
export function getTranslatedPath(path: string, locale: string): string {
  const segments = path.split('/');
  
  // Check if the first segment is a locale
  if (locales.includes(segments[1] as Locale)) {
    segments[1] = locale;
  } else {
    segments.splice(1, 0, locale);
  }
  
  return segments.join('/');
}

// Helper to extract locale from path
export function getLocaleFromPath(path: string): string {
  const segments = path.split('/');
  if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
    return segments[1];
  }
  return defaultLocale;
}

// Helper to extract path without locale
export function getPathWithoutLocale(path: string): string {
  const segments = path.split('/');
  if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
    return '/' + segments.slice(2).join('/');
  }
  return path;
}