import { I18nProvider } from '@/app/i18n/providers'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { CartProvider } from '@/app/contexts/CartContext'
import { Locale, defaultLocale } from '@/app/i18n/config'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Pārbaudīt, vai lokalizācija ir atbalstīta
  if (!Object.values(Locale).includes(locale as Locale)) {
    notFound()
  }

  // Ielādēt tulkojumus
  let messages
  try {
    messages = (await import(`@/messages/${locale}.json`)).default
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    notFound()
  }

  return (
    <I18nProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}