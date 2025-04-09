import './globals.css';
import { Inter } from 'next/font/google';
import { redirect } from 'next/navigation';
import { defaultLocale } from './i18n/config';

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'] });

export const metadata = {
  title: 'IvaPro PC Configurator',
  description: 'Custom PC configuration and purchasing platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect(`/${defaultLocale}`);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}