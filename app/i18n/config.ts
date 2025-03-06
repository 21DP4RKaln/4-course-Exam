export const i18nConfig = {
  locales: ['en', 'lv', 'ru'],
  defaultLocale: 'en',
  timeZone: 'Europe/Riga' 
};
  
  export type Locale = (typeof i18nConfig.locales)[number];
  
  export const locales = ['en', 'lv', 'ru'] as const;