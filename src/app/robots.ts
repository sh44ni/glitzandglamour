import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',
          '/favicon-glitz.png',
          '/logo.svg',
          '/manifest.json',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/sign/',
          '/sign-in/',
          '/profile/',
          '/tasks/',
          '/card/',
          '/leave-review/',
          '/noremail/',
          '/app/',
          '/_next/data/',
        ],
      },
    ],
    sitemap: 'https://glitzandglamours.com/sitemap.xml',
  };
}
