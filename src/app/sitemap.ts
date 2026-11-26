import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { ALL_CANONICAL_SLUGS } from '@/data/servicesDetailed';
import { ALL_SERVICE_CATEGORY_SLUGS } from '@/data/serviceCategories';
import { ALL_SPECIAL_EVENT_SLUGS } from '@/data/specialEventsDetailed';
import { ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';
import { FALLBACK_BLOGS } from '@/data/fallbackBlogs';
import { getContentUpdatedAt } from '@/data/contentUpdates';

const ASSET_SLUG_RE = /\.(jpe?g|png|webp|gif|svg|ico|css|js|map|pdf|txt|xml)$/i;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.glitzandglamours.com';

  // ── Category Hub pages (5 primary salon silos) ──
  const categoryHubUrls: MetadataRoute.Sitemap = ALL_SERVICE_CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: getContentUpdatedAt(`/services/${slug}`),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // ── Services (strictly 28 canonical slugs) ──
  const serviceUrls: MetadataRoute.Sitemap = ALL_CANONICAL_SLUGS.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: getContentUpdatedAt(`/services/${slug}`),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ── Blog posts (DB + FALLBACK_BLOGS deduplicated, excluding accidental asset slugs) ──
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
    if (post.slug && !ASSET_SLUG_RE.test(post.slug) && !seenBlogSlugs.has(post.slug)) {
      seenBlogSlugs.add(post.slug);
      blogUrls.push({
        url: `${baseUrl}/blogs/${post.slug}`,
        // The blog route serves the curated fallback before the DB version.
        // Its sitemap date must describe that same content source.
        lastModified: FALLBACK_BLOGS[post.slug]?.updatedAt ?? post.updatedAt,
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
        lastModified: fallbackPost.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      });
    }
  }

  // ── Special event services (strictly canonical slugs) ──
  const eventUrls: MetadataRoute.Sitemap = ALL_SPECIAL_EVENT_SLUGS.map((slug) => ({
    url: `${baseUrl}/special-events/${slug}`,
    lastModified: getContentUpdatedAt(`/special-events/${slug}`),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const serviceAreaUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/service-areas`,
      lastModified: getContentUpdatedAt('/service-areas'),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    ...ALL_SERVICE_AREA_SLUGS.map((slug) => ({
      url: `${baseUrl}/service-areas/${slug}`,
      lastModified: getContentUpdatedAt(`/service-areas/${slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];

  return [
    // ── Core indexable pages ──
    {
      url: baseUrl,
      lastModified: getContentUpdatedAt('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: getContentUpdatedAt('/services'),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    ...categoryHubUrls,
    {
      url: `${baseUrl}/special-events`,
      lastModified: getContentUpdatedAt('/special-events'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: getContentUpdatedAt('/book'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: getContentUpdatedAt('/blogs'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: getContentUpdatedAt('/gallery'),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: getContentUpdatedAt('/reviews'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: getContentUpdatedAt('/faq'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/card`,
      lastModified: getContentUpdatedAt('/card'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: getContentUpdatedAt('/policy'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },

    // ── Dynamic pages ──
    ...serviceUrls,
    ...eventUrls,
    ...serviceAreaUrls,
    ...blogUrls,
  ];
}
