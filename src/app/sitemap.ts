import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { ALL_CANONICAL_SLUGS } from '@/data/servicesDetailed';
import { ALL_SPECIAL_EVENT_SLUGS } from '@/data/specialEventsDetailed';
import { ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';
import { FALLBACK_BLOGS } from '@/data/fallbackBlogs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.glitzandglamours.com';
  const now = new Date();

  // ── Services (strictly canonical slugs) ──
  const serviceUrls: MetadataRoute.Sitemap = ALL_CANONICAL_SLUGS.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ── Blog posts (DB + FALLBACK_BLOGS deduplicated) ──
  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    posts = [];
  }

  const seenBlogSlugs = new Set<string>();
  const blogUrls: MetadataRoute.Sitemap = [];

  for (const post of posts) {
    if (post.slug && !seenBlogSlugs.has(post.slug)) {
      seenBlogSlugs.add(post.slug);
      blogUrls.push({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    }
  }

  for (const slug of Object.keys(FALLBACK_BLOGS)) {
    if (!seenBlogSlugs.has(slug)) {
      seenBlogSlugs.add(slug);
      const fallbackPost = FALLBACK_BLOGS[slug];
      blogUrls.push({
        url: `${baseUrl}/blogs/${slug}`,
        lastModified: fallbackPost?.updatedAt ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      });
    }
  }

  // ── Special event services (strictly canonical slugs) ──
  const eventUrls: MetadataRoute.Sitemap = ALL_SPECIAL_EVENT_SLUGS.map((slug) => ({
    url: `${baseUrl}/special-events/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const serviceAreaUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/service-areas`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    ...ALL_SERVICE_AREA_SLUGS.map((slug) => ({
      url: `${baseUrl}/service-areas/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];

  return [
    // ── Core pages ──
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/special-events`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ── Legal / policy pages ──
    {
      url: `${baseUrl}/policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/image-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/waiver`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    // ── Dynamic pages ──
    ...serviceUrls,
    ...eventUrls,
    ...serviceAreaUrls,
    ...blogUrls,
  ];
}
