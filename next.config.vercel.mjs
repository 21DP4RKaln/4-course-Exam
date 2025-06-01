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
    productionBrowserSourceMaps: false, // Disable source maps in production
    poweredByHeader: false, // Remove X-Powered-By header for security
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
    },
    experimental: {
      // Reduce memory usage during build
      optimizeCss: false,
      legacyBrowsers: false,
      browsersListForSwc: true,
    },
    // Optimize for Vercel deployment
    swcMinify: true,
    webpack: (config, { dev, isServer }) => {
      // Optimize for production builds on Vercel
      if (!dev) {
        config.cache = false;
        
        // Reduce memory usage
        config.optimization = {
          ...config.optimization,
          minimize: true,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: -10,
                chunks: 'all',
              },
            },
          },
        };
      }
      
      return config;
    },
    // Environment variable configuration
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
};

export default nextConfig;
