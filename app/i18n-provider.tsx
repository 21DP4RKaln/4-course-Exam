'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

export function I18nProvider({ 
  children, 
  locale, 
  messages 
}: { 
  children: ReactNode; 
  locale: string; 
  messages: any; 
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Riga"
      now={new Date()}
    >
      {children}
    </NextIntlClientProvider>
  );
}