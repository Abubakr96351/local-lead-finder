import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Next.js infers the workspace root by walking up for lockfiles
  // and finds the sibling CLI script's package-lock.json one directory up.
  turbopack: {
    root: path.join(__dirname),
  },
  // @sparticuz/chromium's compressed browser binary lives outside what Next's
  // file tracing picks up automatically (it's read via fs at runtime, not
  // require()'d), so routes that launch it need it included explicitly.
  outputFileTracingIncludes: {
    "/api/search": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/radar/[id]/scan": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
