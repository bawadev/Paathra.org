import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Removed 'output: export' for hybrid rendering support
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  // Enable experimental features for better performance
  experimental: {
    // Enable partial prerendering for hybrid approach
    ppr: false, // Keep false for now, can enable later
  },
  // If you're deploying to a subdirectory, uncomment and set the basePath
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name/',
};

export default withNextIntl(nextConfig);
