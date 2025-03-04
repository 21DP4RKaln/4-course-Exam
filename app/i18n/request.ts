import { getRequestConfig } from 'next-intl/server';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { locales } from './config';

import en from '../../messages/en.json';
import lv from '../../messages/lv.json';
import ru from '../../messages/ru.json';

const messages = { en, lv, ru };

type LocaleType = 'en' | 'lv' | 'ru';

export const { usePathname, useRouter } = createSharedPathnamesNavigation({ locales });

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';

  if (!locales.includes(locale as LocaleType)) {
    notFound();
  }

  return {
    messages: messages[locale as keyof typeof messages],
    locale: locale,
    timeZone: 'Europe/Riga'
  };
});