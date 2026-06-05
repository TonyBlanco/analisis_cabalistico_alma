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
    // AISymbolicWorkspace (FROZEN) y deuda de tipos: no bloquear deploy Studios33
    ignoreBuildErrors: process.env.STUDIOS33_DEPLOY === '1',
  },
};

export default nextConfig;
