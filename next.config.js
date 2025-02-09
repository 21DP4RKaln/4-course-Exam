/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./app/i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withNextIntl(nextConfig);