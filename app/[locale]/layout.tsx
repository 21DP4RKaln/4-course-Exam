import '../globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '../components/ClientLayout';

import en from '../../messages/en.json';
import lv from '../../messages/lv.json';
import ru from '../../messages/ru.json';

const messages = { en, lv, ru };
const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  await Promise.resolve(); 

  const locale = params.locale;
  const isValidLocale = locale in messages;
  
  return (
    <html lang={locale}>
      <body>
        <ClientLayout
          messages={isValidLocale ? messages[locale as keyof typeof messages] : messages.lv} 
          locale={locale}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}