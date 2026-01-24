import type { NextConfig } from "next";

// Next.js 15.5+ configuration
// turbopack is now a top-level config, not in experimental
const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@holistica/symbolic"],
};

export default nextConfig;
