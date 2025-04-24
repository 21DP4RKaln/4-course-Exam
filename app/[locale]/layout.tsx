import { I18nProvider } from '@/app/i18n/providers';
import { getMessages } from '@/app/i18n/messages';
import { ReactNode } from 'react';
import '@/app/globals.css';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';
import { ThemeProvider } from '@/app/contexts/ThemeContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'] });

type Props = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

export default async function LocaleLayout({ children, params }: Props) {
  const locale = params.locale;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}