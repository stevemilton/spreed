import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // If deploying to a subpath like username.github.io/neurostream-reader
  // uncomment and set basePath:
  // basePath: '/neurostream-reader',
  images: {
    unoptimized: true,
  },
  // Disable trailing slashes for cleaner URLs
  trailingSlash: false,
};

export default nextConfig;
