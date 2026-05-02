import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
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
        ],
      },
    ],
    sitemap: 'https://glitzandglamours.com/sitemap.xml',
  };
}
