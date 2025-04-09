'use client'

import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

type Props = {
  locale: string;
  messages: Record<string, Record<string, string>>; 
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: Props) {
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  )
}