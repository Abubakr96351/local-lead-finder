import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Next.js infers the workspace root by walking up for lockfiles
  // and finds the sibling CLI script's package-lock.json one directory up.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
