import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Deploying to stevemilton.github.io/spreed
  basePath: '/spreed',
  images: {
    unoptimized: true,
  },
  // Disable trailing slashes for cleaner URLs
  trailingSlash: false,
};

export default nextConfig;
