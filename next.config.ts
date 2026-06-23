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
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
      {
        source: '/api/mobile/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,PATCH,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
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

