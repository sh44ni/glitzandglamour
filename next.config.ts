import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/casestudy',
        destination: '/casestudy.html',
      },
    ];
  },
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
      { protocol: 'http',  hostname: '31.97.236.172', port: '9000' },
    ],
  },
};

export default nextConfig;

