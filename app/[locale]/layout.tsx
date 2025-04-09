import { I18nProvider } from '@/app/i18n/providers'
import { Locale, defaultLocale } from '@/app/i18n/config'

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
    } catch {
      messages = {};
    }
  }

  return (
    <I18nProvider locale={locale} messages={messages}>
      {/* Your existing providers */}
      {children}
    </I18nProvider>
  )
}