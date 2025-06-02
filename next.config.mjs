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
    // For Vercel deployment
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    productionBrowserSourceMaps: false, // Disable source maps in production
    poweredByHeader: false, // Remove X-Powered-By header for security
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
    },webpack: (config, { dev, isServer }) => {
      // Disable the default cache
      config.cache = false;
      
      // Check if we're using minimal build
      const isMinimal = process.env.NEXT_MINIMAL_BUILD === 'true';
      // Check if we're in simple dev mode
      const isSimpleDev = process.env.NEXT_DEV_SIMPLE === 'true';
      
      // Apply memory optimizations
      if (!dev || isMinimal || isSimpleDev) {
        // Disable source maps in production, minimal build, or simple dev mode
        config.devtool = false;
        
        // Simplify optimization to use less memory
        config.optimization = {
          minimize: !dev || isMinimal, // Only minimize in production or minimal build
          minimizer: [],
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
            },
          },
          // Disable any memory-intensive optimizations
          ...(isMinimal || isSimpleDev ? {
            removeAvailableModules: false,
            removeEmptyChunks: false,
            mergeDuplicateChunks: false,
          } : {}),
        };
        
        // In development with simple mode, further reduce memory usage
        if (dev && isSimpleDev) {
          // Disable HMR for simple dev mode to save memory
          config.experiments = {
            ...config.experiments,
            lazyCompilation: true,
          };
        }
      }
      return config;
    },
    headers() {
      return []
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