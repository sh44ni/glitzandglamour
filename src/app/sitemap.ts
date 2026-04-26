import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://glitzandglamours.com';

  // ── Services ──
  let services: { slug: string | null; createdAt: Date }[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, createdAt: true },
    });
  } catch {
    services = [];
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

  // ── Special event categories ──
  let eventCats: { slug: string | null; updatedAt: Date }[] = [];
  try {
    eventCats = await prisma.specialEventCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    eventCats = [];
  }

  const serviceUrls = services
    .filter((s) => !!s.slug)
    .map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const eventUrls = eventCats
    .filter((e) => !!e.slug)
    .map((e) => ({
      url: `${baseUrl}/special-events/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [
    // ── Core pages ──
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/special-events`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date('2026-04-26'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ── Legal / policy pages ──
    {
      url: `${baseUrl}/policy`,
      lastModified: new Date('2026-03-01'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-03-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-03-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/waiver`,
      lastModified: new Date('2026-03-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    // ── Dynamic pages ──
    ...serviceUrls,
    ...eventUrls,
    ...blogUrls,
  ];
}
