import { I18nProvider } from '@/app/i18n/providers';
import { getMessages } from '@/app/i18n/messages';
import { ReactNode } from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import ClientProviders from '@/app/ClientProviders';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'IvaPro PC Configurator',
    template: '%s | IvaPro PC Configurator',
  },
  description: 'Build your custom PC or choose from our ready-made configurations. Professional computer building with quality components.',
  keywords: ['PC configurator', 'custom PC', 'computer building', 'gaming PC', 'custom computer'],
  authors: [{ name: 'IvaPro' }],
  creator: 'IvaPro',
  publisher: 'IvaPro',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

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
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* head content */}
      </head>
      <body className={`${inter.className} antialiased`}>
        <I18nProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow pt-16">
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