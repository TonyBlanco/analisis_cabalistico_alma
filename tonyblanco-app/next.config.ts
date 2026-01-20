import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import path from "path";

export default function nextConfig(phase: string): NextConfig {
  const config: NextConfig = {
    experimental: {
      externalDir: true,
    },
    transpilePackages: ["@holistica/symbolic"],
  };

  // Next can infer the monorepo root incorrectly when multiple lockfiles exist
  // on disk (e.g. D:\\pnpm-lock.yaml). In dev, that can cause missing `.next/dev`
  // artifacts and 500s. Pin Turbopack root ONLY for the dev server to avoid
  // altering production build resolution.
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config.turbopack = {
      root: path.join(__dirname),
    };
  }

  return config;
}
