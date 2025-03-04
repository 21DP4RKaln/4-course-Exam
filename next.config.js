/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = require('next-intl/plugin')('./app/i18n/request.ts');

module.exports = withNextIntl(nextConfig);