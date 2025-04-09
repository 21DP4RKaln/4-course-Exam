import { I18nProvider } from '@/app/i18n/providers'
import { defaultLocale } from '@/app/i18n/config'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let messages;
  
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    try {
      messages = (await import(`@/messages/${defaultLocale}.json`)).default;
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