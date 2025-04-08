import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '2mb'
    },
    optimizeImages: true,
    scrollRestoration: true,
  },
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: 'lv',
    NEXT_PUBLIC_DEFAULT_TIMEZONE: 'Europe/Riga',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
    NEXT_PUBLIC_APP_NAME: 'IvaPro PC Configurator',
  },
  images: {
    domains: ['localhost', 'ivapro.lv'],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/lv',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);