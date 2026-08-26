import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake icon libraries — reduces unused JS chunks flagged by PageSpeed
    optimizePackageImports: ['lucide-react'],
  },
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
        source: '/:path*\\.(svg|jpg|jpeg|png|webp|avif|woff2|woff|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS ?? 'https://glitzandglamours.com' },
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
    // Serve AVIF (50% smaller) and WebP (30% smaller) automatically
    formats: ['image/avif', 'image/webp'],
    // Responsive breakpoints matching real device widths
    deviceSizes: [375, 430, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Aggressive caching — 1 year (images don't change often)
    minimumCacheTTL: 31536000,
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

