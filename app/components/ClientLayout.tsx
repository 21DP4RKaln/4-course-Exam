'use client';

import { NextIntlClientProvider } from 'next-intl';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { CartProvider } from '../contexts/CartContext';

type Messages = Record<string, Record<string, string>>;

interface ClientLayoutProps {
  children: React.ReactNode;
  messages: any;
  locale: string;
}

export default function ClientLayout({ children, messages, locale }: ClientLayoutProps) {
  return (
    <NextIntlClientProvider 
      messages={messages} 
      locale={locale}
      timeZone="Europe/Riga"
    >
      <CartProvider>
        <Header />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </NextIntlClientProvider>
  );
}