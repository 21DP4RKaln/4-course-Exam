import { I18nProvider } from '@/app/i18n/providers';
import { defaultLocale } from '@/app/i18n/config';
import { ReactNode } from 'react';
import '../globals.css';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

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
  );
}