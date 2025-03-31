'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// Create a context to cache messages
const MessagesContext = createContext<Record<string, any>>({});

// A hook to access the cached messages
export function useMessages() {
  return useContext(MessagesContext);
}

// A component to cache messages for all locales
export function MessagesCacheProvider({ 
  children, 
  messages 
}: { 
  children: ReactNode; 
  messages: Record<string, any>; 
}) {
  return (
    <MessagesContext.Provider value={messages}>
      {children}
    </MessagesContext.Provider>
  );
}

// Optimized I18n provider that uses cached messages
export function OptimizedI18nProvider({ 
  children, 
  locale
}: { 
  children: ReactNode; 
  locale: string; 
}) {
  const allMessages = useMessages();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
    </div>;
  }

  // Only provide the messages for the current locale
  const messagesForLocale = allMessages[locale] || {};

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messagesForLocale}
      timeZone="Europe/Riga"
      now={new Date()}
    >
      {children}
    </NextIntlClientProvider>
  );
}

// Usage in app/[locale]/layout.tsx:
/*
import { MessagesCacheProvider } from '@/app/i18n-provider-optimized';
import en from '../../messages/en.json';
import lv from '../../messages/lv.json';
import ru from '../../messages/ru.json';

const messages = { en, lv, ru };

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body>
        <MessagesCacheProvider messages={messages}>
          <ClientLayout locale={params.locale}>
            {children}
          </ClientLayout>
        </MessagesCacheProvider>
      </body>
    </html>
  );
}
*/

// Then in your ClientLayout.tsx:
/*
import { OptimizedI18nProvider } from '@/app/i18n-provider-optimized';

export default function ClientLayout({ 
  children, 
  locale 
}: { 
  children: React.ReactNode; 
  locale: string;
}) {
  return (
    <OptimizedI18nProvider locale={locale}>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 min-h-screen">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </OptimizedI18nProvider>
  );
}
*/