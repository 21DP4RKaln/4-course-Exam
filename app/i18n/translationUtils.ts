import { useTranslations } from 'next-intl';

export function useTranslationWithFallback() {
  const t = useTranslations();

  const safeTranslate = (
    key: string,
    fallback: string,
    params?: Record<string, any>
  ) => {
    try {
      return t(key, params);
    } catch (error) {
      console.warn(`Translation key "${key}" not found, using fallback text`);
      return fallback;
    }
  };

  return safeTranslate;
}
