import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server external packages (moved from experimental.serverComponentsExternalPackages)
  serverExternalPackages: ['@supabase/supabase-js'],
  
  experimental: {
    // Other experimental features can go here
  },
  
  // Environment variables configuration
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  
  // Build configuration
  typescript: {
    // Allow build to continue even with TypeScript errors during deployment
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Allow build to continue even with ESLint errors during deployment
    ignoreDuringBuilds: false,
  },
  
  // Output configuration for static export if needed
  output: 'standalone',
  
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle environment variables properly during build
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL),
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      })
    );
    
    return config;
  },
};

export default withNextIntl(nextConfig);