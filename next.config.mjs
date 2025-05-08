/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    images: {
      domains: ['localhost'],
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3001',
          pathname: '/uploads/**',
        }
      ]
    }
  }
  
  export default nextConfig;