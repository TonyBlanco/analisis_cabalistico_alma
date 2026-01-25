import type { NextConfig } from "next";

// Next.js 15.5+ configuration
// turbopack is now a top-level config, not in experimental
const nextConfig: NextConfig = {
  // Silence workspace root warning by explicitly setting the root
  outputFileTracingRoot: require('path').join(__dirname, '../'),
  
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@holistica/symbolic"],
  
  // TypeScript validation (we validate before commit)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
