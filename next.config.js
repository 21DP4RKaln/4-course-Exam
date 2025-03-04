/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./app/i18n/request.ts');

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
  }
};

module.exports = withNextIntl(nextConfig);