import { I18nProvider } from '@/app/i18n/providers'
import { defaultLocale } from '@/app/i18n/config'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;
  let messages;
  
  try {
    messages = (await import(`@/lib/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    try {
      messages = (await import(`@/lib/messages/${defaultLocale}.json`)).default;
    } catch (fallbackError) {
      console.error(`Failed to load default messages too:`, fallbackError);
      messages = {};
    }
  }

  return (
    <I18nProvider locale={locale} messages={messages}>
      {children}
    </I18nProvider>
  )
}