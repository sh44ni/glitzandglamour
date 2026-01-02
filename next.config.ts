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
};

export default nextConfig;
