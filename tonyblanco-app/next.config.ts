import type { NextConfig } from "next";
import path from "path";

// Next.js infers the monorepo root incorrectly when lockfiles exist at D:\
// (e.g. D:\pnpm-lock.yaml, D:\node_modules). Pin Turbopack root explicitly.
const nextConfig: NextConfig = {
  // Temporarily disable Turbopack to avoid native SWC binary issues
  // (Turbopack requires compatible native binaries per Node version).
  experimental: {
    turbopack: false,
    externalDir: true,
  },
  transpilePackages: ["@holistica/symbolic"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
