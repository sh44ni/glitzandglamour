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
  async redirects() {
    return [
      {
            "source": "/services/acrylic-nails",
            "destination": "/services/acrylic-set",
            "permanent": true
      },
      {
            "source": "/services/full-set-acrylic",
            "destination": "/services/acrylic-set",
            "permanent": true
      },
      {
            "source": "/services/gel-x",
            "destination": "/services/gelx",
            "permanent": true
      },
      {
            "source": "/services/gelx-nails",
            "destination": "/services/gelx",
            "permanent": true
      },
      {
            "source": "/services/apres-gelx",
            "destination": "/services/gelx",
            "permanent": true
      },
      {
            "source": "/services/acrylic-fill",
            "destination": "/services/fill",
            "permanent": true
      },
      {
            "source": "/services/nail-fill",
            "destination": "/services/fill",
            "permanent": true
      },
      {
            "source": "/services/acrylic-refill",
            "destination": "/services/fill",
            "permanent": true
      },
      {
            "source": "/services/acrylic-rebalance",
            "destination": "/services/rebalance",
            "permanent": true
      },
      {
            "source": "/services/nail-rebalance",
            "destination": "/services/rebalance",
            "permanent": true
      },
      {
            "source": "/services/classic-manicure",
            "destination": "/services/manicure",
            "permanent": true
      },
      {
            "source": "/services/gel-manicure",
            "destination": "/services/manicure",
            "permanent": true
      },
      {
            "source": "/services/natural-nail-care",
            "destination": "/services/manicure",
            "permanent": true
      },
      {
            "source": "/services/soak-off",
            "destination": "/services/soak-off-my-work",
            "permanent": true
      },
      {
            "source": "/services/soak-off--my-work-",
            "destination": "/services/soak-off-my-work",
            "permanent": true
      },
      {
            "source": "/services/soak-off-glitz-work",
            "destination": "/services/soak-off-my-work",
            "permanent": true
      },
      {
            "source": "/services/foreign-removal",
            "destination": "/services/foreign-soak-off",
            "permanent": true
      },
      {
            "source": "/services/other-salon-soak-off",
            "destination": "/services/foreign-soak-off",
            "permanent": true
      },
      {
            "source": "/services/classic-foot-soak",
            "destination": "/services/classic-foot-soak-detox",
            "permanent": true
      },
      {
            "source": "/services/foot-soak-detox",
            "destination": "/services/classic-foot-soak-detox",
            "permanent": true
      },
      {
            "source": "/services/classic-pedicure",
            "destination": "/services/classic-foot-soak-detox",
            "permanent": true
      },
      {
            "source": "/services/jelly-hydrating-detox",
            "destination": "/services/jelly-hydrating-foot-detox",
            "permanent": true
      },
      {
            "source": "/services/jelly-pedicure",
            "destination": "/services/jelly-hydrating-foot-detox",
            "permanent": true
      },
      {
            "source": "/services/jelly-foot-detox",
            "destination": "/services/jelly-hydrating-foot-detox",
            "permanent": true
      },
      {
            "source": "/services/acrylic-toenails",
            "destination": "/services/acrylic-toes",
            "permanent": true
      },
      {
            "source": "/services/toenail-extensions",
            "destination": "/services/acrylic-toes",
            "permanent": true
      },
      {
            "source": "/services/acrylic-pedicure",
            "destination": "/services/acrylic-toes",
            "permanent": true
      },
      {
            "source": "/services/solid-color",
            "destination": "/services/solid-one-tone",
            "permanent": true
      },
      {
            "source": "/services/single-process-color",
            "destination": "/services/solid-one-tone",
            "permanent": true
      },
      {
            "source": "/services/all-over-color",
            "destination": "/services/solid-one-tone",
            "permanent": true
      },
      {
            "source": "/services/hair-highlights",
            "destination": "/services/highlights",
            "permanent": true
      },
      {
            "source": "/services/foil-highlights",
            "destination": "/services/highlights",
            "permanent": true
      },
      {
            "source": "/services/partial-highlights",
            "destination": "/services/highlights",
            "permanent": true
      },
      {
            "source": "/services/balayage-hair",
            "destination": "/services/balayage",
            "permanent": true
      },
      {
            "source": "/services/lived-in-color",
            "destination": "/services/balayage",
            "permanent": true
      },
      {
            "source": "/services/hair-gloss",
            "destination": "/services/gloss",
            "permanent": true
      },
      {
            "source": "/services/hair-toner",
            "destination": "/services/gloss",
            "permanent": true
      },
      {
            "source": "/services/glaze",
            "destination": "/services/gloss",
            "permanent": true
      },
      {
            "source": "/services/vivid-hair-color",
            "destination": "/services/vivids",
            "permanent": true
      },
      {
            "source": "/services/fantasy-hair-color",
            "destination": "/services/vivids",
            "permanent": true
      },
      {
            "source": "/services/creative-hair-color",
            "destination": "/services/creative-color",
            "permanent": true
      },
      {
            "source": "/services/color-melt",
            "destination": "/services/creative-color",
            "permanent": true
      },
      {
            "source": "/services/women-s-haircut",
            "destination": "/services/womens-haircut",
            "permanent": true
      },
      {
            "source": "/services/women-haircut",
            "destination": "/services/womens-haircut",
            "permanent": true
      },
      {
            "source": "/services/men-s-haircut",
            "destination": "/services/mens-haircut",
            "permanent": true
      },
      {
            "source": "/services/men-haircut",
            "destination": "/services/mens-haircut",
            "permanent": true
      },
      {
            "source": "/services/kids-haircut--girls-",
            "destination": "/services/kids-haircut-girls",
            "permanent": true
      },
      {
            "source": "/services/kids-girls-haircut",
            "destination": "/services/kids-haircut-girls",
            "permanent": true
      },
      {
            "source": "/services/girls-haircut",
            "destination": "/services/kids-haircut-girls",
            "permanent": true
      },
      {
            "source": "/services/kids-haircut--boys-",
            "destination": "/services/kids-haircut-boys",
            "permanent": true
      },
      {
            "source": "/services/kids-boys-haircut",
            "destination": "/services/kids-haircut-boys",
            "permanent": true
      },
      {
            "source": "/services/boys-haircut",
            "destination": "/services/kids-haircut-boys",
            "permanent": true
      },
      {
            "source": "/services/upper-lip-wax",
            "destination": "/services/upper-lip",
            "permanent": true
      },
      {
            "source": "/services/lip-wax",
            "destination": "/services/upper-lip",
            "permanent": true
      },
      {
            "source": "/services/brow-wax",
            "destination": "/services/eyebrow-wax",
            "permanent": true
      },
      {
            "source": "/services/eyebrow-shaping",
            "destination": "/services/eyebrow-wax",
            "permanent": true
      },
      {
            "source": "/services/brow-waxing",
            "destination": "/services/eyebrow-wax",
            "permanent": true
      },
      {
            "source": "/services/underarm-wax",
            "destination": "/services/underarm",
            "permanent": true
      },
      {
            "source": "/services/armpit-wax",
            "destination": "/services/underarm",
            "permanent": true
      },
      {
            "source": "/services/sideburns-wax",
            "destination": "/services/sideburns",
            "permanent": true
      },
      {
            "source": "/services/sideburn-wax",
            "destination": "/services/sideburns",
            "permanent": true
      },
      {
            "source": "/services/brazilian-wax",
            "destination": "/services/brazilian",
            "permanent": true
      },
      {
            "source": "/services/bikini-wax",
            "destination": "/services/brazilian",
            "permanent": true
      },
      {
            "source": "/services/mini-facials",
            "destination": "/services/mini-facial",
            "permanent": true
      },
      {
            "source": "/services/express-facial",
            "destination": "/services/mini-facial",
            "permanent": true
      },
      {
            "source": "/services/custom-facial",
            "destination": "/services/basic-facial",
            "permanent": true
      },
      {
            "source": "/services/signature-facial",
            "destination": "/services/basic-facial",
            "permanent": true
      },
      {
            "source": "/services/deep-cleansing---extraction-facial",
            "destination": "/services/deep-cleansing-extraction-facial",
            "permanent": true
      },
      {
            "source": "/services/deep-cleansing-facial",
            "destination": "/services/deep-cleansing-extraction-facial",
            "permanent": true
      },
      {
            "source": "/services/acne-facial",
            "destination": "/services/deep-cleansing-extraction-facial",
            "permanent": true
      },
      {
            "source": "/services/anti-aging---enzyme-facial",
            "destination": "/services/anti-aging-and-enzyme-facial",
            "permanent": true
      },
      {
            "source": "/services/anti-aging-facial",
            "destination": "/services/anti-aging-and-enzyme-facial",
            "permanent": true
      },
      {
            "source": "/services/enzyme-facial",
            "destination": "/services/anti-aging-and-enzyme-facial",
            "permanent": true
      },
      {
            "source": "/services/deluxe-pedicure",
            "destination": "/services/jelly-hydrating-foot-detox",
            "permanent": true
      },
      {
            "source": "/services/pedicure",
            "destination": "/services/classic-foot-soak-detox",
            "permanent": true
      },
      {
            "source": "/services/waxing",
            "destination": "/services#waxing",
            "permanent": true
      },
      {
            "source": "/services/hair",
            "destination": "/services#haircolor",
            "permanent": true
      },
      {
            "source": "/services/nails",
            "destination": "/services#nails",
            "permanent": true
      }
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
      { protocol: 'https', hostname: 'www.glitzandglamours.com' },
      { protocol: 'https', hostname: '**.glitzandglamours.com' },
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

