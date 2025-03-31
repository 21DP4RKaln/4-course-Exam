'use client';

import { useState, useEffect, useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from './ui/Toaster';
import { Analytics } from './Analytics';

type Messages = Record<string, Record<string, string>>;

interface ClientLayoutProps {
  children: React.ReactNode;
  messages: any;
  locale: string;
}

export default function ClientLayout({ children, messages, locale }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);

  const memoizedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextIntlClientProvider 
      messages={memoizedMessages} 
      locale={locale}
      timeZone="Europe/Riga"
      now={new Date()}
    >
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 min-h-screen">
              {mounted ? children : 
                <div className="flex justify-center items-center min-h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
                </div>
              }
            </main>
            <Footer />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}