import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: 'dist',
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
