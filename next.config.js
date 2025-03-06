const withNextIntl = require('next-intl/plugin')('./app/i18n/request.ts');
const timeZones = require('./time-zones');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '2mb'
    }
  },
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: 'en',
    NEXT_PUBLIC_DEFAULT_TIMEZONE: 'Europe/Riga'
  }
};

module.exports = withNextIntl(nextConfig);