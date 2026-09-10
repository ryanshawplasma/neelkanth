import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets several dev servers run against one checkout (NEXT_DIST_DIR=.next-app npx next dev -p 3001)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: { unoptimized: true },
  serverExternalPackages: ["@prisma/client", "web-push", "sharp"],
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};

export default nextConfig;
