import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/gallery/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/gallery/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
        pathname: '/gallery/images/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Add no-transform to prevent Hostinger CDN / Cloudflare from corrupting 
        // Tailwind v4 CSS files which use modern @property syntax.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, no-transform',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
