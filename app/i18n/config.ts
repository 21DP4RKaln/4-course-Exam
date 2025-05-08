export const defaultLocale = 'en';
export const locales = ['en', 'lv', 'ru'] as const;

export type Locale = typeof locales[number];
export interface LanguageInfo {
  name: string;
  nativeName: string;
  code: string;
  flag: string;
}

export const languageInfo: Record<Locale, LanguageInfo> = {
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'EN',
    flag: '🇬🇧',
  },
  lv: {
    name: 'Latvian',
    nativeName: 'Latviski',
    code: 'LV',
    flag: '🇱🇻',
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    code: 'RU',
    flag: '🇷🇺',
  },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}