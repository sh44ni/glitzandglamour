import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',
          '/api/images/',
          '/favicon-glitz.png',
          '/logo.svg',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/data/',
        ],
      },
    ],
    sitemap: 'https://www.glitzandglamours.com/sitemap.xml',
  };
}
