/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["assets.co.dev"],
  },
  webpack: (config, context) => {
    config.optimization.minimize = process.env.NEXT_PUBLIC_CO_DEV_ENV !== "preview";
    return config;
  },
  
  // Proxy configuration for development to handle CORS
  async rewrites() {
    // Only apply proxy in development mode when using real API
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_FORCE_REAL_API === 'true' &&
        process.env.NEXT_PUBLIC_BASE_URL) {
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      
      return [
        {
          source: '/api/proxy/:path*',
          destination: `${baseUrl}/api/:path*`,
        },
      ];
    }
    
    return [];
  },

  // Headers configuration to handle CORS in development
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization, X-Requested-With',
            },
            {
              key: 'Access-Control-Allow-Credentials',
              value: 'true',
            },
          ],
        },
      ];
    }
    
    return [];
  },
};

export default nextConfig;
