export const defaultLocale = 'en';
export const locales = ['en', 'lv', 'ru']

export type Locale = string;

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}