import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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
  // If you're deploying to a subdirectory, uncomment and set the basePath
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name/',
};

export default nextConfig;
