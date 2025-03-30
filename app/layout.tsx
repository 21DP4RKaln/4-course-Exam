import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { i18nConfig } from './i18n/config';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | IvaPro',
    default: 'IvaPro - Custom PC Configuration',
  },
  description: 'Create your perfect custom PC with IvaPro - Latvia\'s premier PC building service.',
  metadataBase: new URL('https://ivapro.lv/'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  keywords: ['gaming pc', 'custom pc', 'pc builder', 'computer configuration', 'Latvia'],
  authors: [{ name: 'IvaPro Team' }],
  publisher: 'IvaPro',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ivapro.lv',
    title: 'IvaPro - Custom PC Configuration',
    description: 'Create your perfect custom PC with IvaPro',
    siteName: 'IvaPro',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={i18nConfig.defaultLocale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}