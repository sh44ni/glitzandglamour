import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { ALL_CANONICAL_SLUGS } from '@/data/servicesDetailed';
import { ALL_SPECIAL_EVENT_SLUGS } from '@/data/specialEventsDetailed';
import { ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.glitzandglamours.com';
  const now = new Date();

  // ── Services ──
  const seenServiceSlugs = new Set<string>();
  const serviceUrls: MetadataRoute.Sitemap = [];

  for (const slug of ALL_CANONICAL_SLUGS) {
    seenServiceSlugs.add(slug);
    serviceUrls.push({
      url: `${baseUrl}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    });
  }

  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, createdAt: true },
    });
    for (const s of dbServices) {
      if (s.slug && !seenServiceSlugs.has(s.slug)) {
        seenServiceSlugs.add(s.slug);
        serviceUrls.push({
          url: `${baseUrl}/services/${s.slug}`,
          lastModified: s.createdAt,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });
      }
    }
  } catch {
    // DB fallback covered by ALL_CANONICAL_SLUGS
  }

  // ── Blog posts ──
  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    posts = [];
  }

  // ── Special event services ──
  const seenEventSlugs = new Set<string>();
  const eventUrls: MetadataRoute.Sitemap = [];

  for (const slug of ALL_SPECIAL_EVENT_SLUGS) {
    seenEventSlugs.add(slug);
    eventUrls.push({
      url: `${baseUrl}/special-events/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    });
  }

  try {
    const eventCats = await prisma.specialEventCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    for (const e of eventCats) {
      if (e.slug && !seenEventSlugs.has(e.slug)) {
        seenEventSlugs.add(e.slug);
        eventUrls.push({
          url: `${baseUrl}/special-events/${e.slug}`,
          lastModified: e.updatedAt,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });
      }
    }
  } catch {
    // DB fallback covered by ALL_SPECIAL_EVENT_SLUGS
  }

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  if (!posts.some((p) => p.slug === 'wedding-hairstyles-guide-san-diego-bridal-inspiration')) {
    blogUrls.push({
      url: `${baseUrl}/blogs/wedding-hairstyles-guide-san-diego-bridal-inspiration`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    });
  }

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
