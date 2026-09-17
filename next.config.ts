import type { NextConfig } from "next";

// Paths that must not trigger a dev recompile: the SQLite file and user uploads live inside the
// project; without this every DB write causes a Fast Refresh that resets client component state.
const IGNORE_EXTRA = /(^|[\\/])(prisma[\\/][^\\/]*\.db[^\\/]*|public[\\/]uploads|\.next-[^\\/]+)([\\/]|$)/;

const nextConfig: NextConfig = {
  // Lets several dev servers run against one checkout (NEXT_DIST_DIR=.next-app npx next dev -p 3001)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: { unoptimized: true },
  // Dev only: lets a second browser session use http://127.0.0.1:3000 (separate cookie jar) for testing.
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@prisma/client", "web-push", "sharp"],
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  webpack: (config) => {
    const existing = config.watchOptions?.ignored;
    let ignored: RegExp | string[];
    if (existing instanceof RegExp) ignored = new RegExp(`${existing.source}|${IGNORE_EXTRA.source}`);
    else if (Array.isArray(existing)) ignored = [...existing, "**/prisma/*.db*", "**/public/uploads/**", "**/.next-*/**"];
    else ignored = IGNORE_EXTRA;
    config.watchOptions = { ...config.watchOptions, ignored };
    return config;
  },
};

export default nextConfig;
