import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // VPS domain (production)
      { protocol: 'https', hostname: 'glitzandglamours.com' },
      // Existing gallery CDN
      { protocol: 'https', hostname: 'storage.webdistt.com' },
      // Any other external image sources
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      // Local/dev MinIO
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'http',  hostname: '31.97.236.172' },
    ],
  },
};

export default nextConfig;

