import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    // Next 16 turbo-powered build/runtime optimizations
    optimizePackageImports: ["framer-motion", "gsap"],
  },
};

export default nextConfig;
