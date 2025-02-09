export const i18nConfig = {
    locales: ['en', 'lv', 'ru'],
    defaultLocale: 'en'
  } as const;
  
  export type Locale = (typeof i18nConfig.locales)[number];
  
  export const locales = ['en', 'lv', 'ru'] as const;