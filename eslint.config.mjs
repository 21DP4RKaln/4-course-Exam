import createNextIntlPlugin from 'next-intl/plugin';

// Configure next-intl plugin
const withNextIntl = createNextIntlPlugin('./app/i18n/index.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Only use ESLint during build process, not development
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  // Experimental features
  experimental: {
    // Server actions configuration
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '2mb'
    },
    // Enable optimized image handling
    optimizeImages: true,
    // Enable scroll restoration
    scrollRestoration: true,
  },
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: 'en',
    NEXT_PUBLIC_DEFAULT_TIMEZONE: 'Europe/Riga',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
    NEXT_PUBLIC_APP_NAME: 'IvaPro PC Configurator',
  },
  // Configure images
  images: {
    domains: ['localhost', 'ivapro.lv'],
    formats: ['image/avif', 'image/webp'],
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ];
  },
  // Configure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

// Export the configuration with next-intl plugin
export default withNextIntl(nextConfig);