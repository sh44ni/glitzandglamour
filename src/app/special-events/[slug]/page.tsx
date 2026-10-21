import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  getSpecialEventBySlug,
  ALL_SPECIAL_EVENT_SLUGS,
} from '@/data/specialEventsDetailed';
import { getDynamicRealReviews, getFilteredRealReviews } from '@/lib/realReviews';
import SpecialEventDetailClient, { getPricingGuide } from './SpecialEventDetailClient';

export const revalidate = 86400; // 24 hours ISR

export async function generateStaticParams() {
  return ALL_SPECIAL_EVENT_SLUGS.map((slug) => ({ slug }));
}

function canonicalUrl(slug: string) {
  return `https://www.glitzandglamours.com/special-events/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detailed = getSpecialEventBySlug(slug);

  if (detailed) {
    const canonical = canonicalUrl(detailed.slug);
    const imageUrl = detailed.heroImage.startsWith('http')
      ? detailed.heroImage
      : `https://www.glitzandglamours.com${detailed.heroImage}`;

    return {
      title: detailed.seoTitle,
      description: detailed.seoDescription,
      keywords: detailed.targetKeywords.join(', '),
      alternates: { canonical },
      openGraph: {
        title: detailed.seoTitle,
        description: detailed.seoDescription,
        type: 'website',
        url: canonical,
        images: [{ url: imageUrl, alt: `${detailed.name} in San Marcos, CA | Glitz & Glamour Studio` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: detailed.seoTitle,
        description: detailed.seoDescription,
        images: [imageUrl],
      },
    };
  }

  let cat: any = null;
  try {
    cat = await prisma.specialEventCategory.findFirst({
      where: { slug, isActive: true },
      select: { name: true, slug: true, description: true, imageUrl: true, tag: true },
    });
  } catch {
    cat = null;
  }

  if (!cat) {
    return {
      title: 'Special Event Glam | Glitz & Glamour Studio San Marcos CA',
      robots: { index: false, follow: false },
    };
  }

  const title = `${cat.name} in San Marcos CA | Glitz & Glamour Studio`.slice(0, 60);
  const description = (
    cat.description ||
    `Special event hair and makeup for ${cat.name} in San Marcos, Vista, and North County San Diego.`
  ).slice(0, 158);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(cat.slug || slug) },
  };
}

export default async function SpecialEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detailed = getSpecialEventBySlug(slug);

  // If accessed by an alias, 301 redirect to canonical slug
  if (detailed && slug !== detailed.slug) {
    redirect(`/special-events/${detailed.slug}`);
  }

  // If not found in static dataset, check database fallback
  let dbCategory: any = null;
  if (!detailed) {
    try {
      dbCategory = await prisma.specialEventCategory.findFirst({
        where: { slug, isActive: true },
      });
    } catch {
      dbCategory = null;
    }
    if (!dbCategory) {
      notFound();
    }
  }

  const eventName = detailed ? detailed.name : dbCategory.name;
  const pricingGuide = getPricingGuide(slug, eventName);

  const allReviews = await getDynamicRealReviews();
  const realReviews = getFilteredRealReviews({
    allReviews,
    slug,
    keywords: detailed ? detailed.targetKeywords : ['bridal', 'wedding', 'hair', 'makeup', 'glam'],
    limit: 2,
  });

  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: eventName,
    name: eventName,
    description: detailed ? detailed.seoDescription : dbCategory.description,
    provider: {
      '@type': 'BeautySalon',
      name: 'Glitz & Glamour Studio',
      image: 'https://www.glitzandglamours.com/special-events/ev-weddings.png',
      telephone: '+1-760-290-5910',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '935 W San Marcos Blvd, Suite 101',
        addressLocality: 'San Marcos',
        addressRegion: 'CA',
        postalCode: '92078',
        addressCountry: 'US',
      },
      url: 'https://www.glitzandglamours.com',
      priceRange: '$$',
    },
    areaServed: [
      { '@type': 'City', name: 'San Marcos, CA' },
      { '@type': 'City', name: 'Vista, CA' },
      { '@type': 'City', name: 'Carlsbad, CA' },
      { '@type': 'City', name: 'Escondido, CA' },
      { '@type': 'City', name: 'Oceanside, CA' },
      { '@type': 'City', name: 'Encinitas, CA' },
      { '@type': 'City', name: 'La Jolla, CA' },
      { '@type': 'AdministrativeArea', name: 'San Diego County, CA' },
    ],
    url: canonicalUrl(detailed ? detailed.slug : dbCategory.slug || slug),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${eventName} Styling Packages`,
      itemListElement: pricingGuide.packages.map((pkg) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: pkg.title,
          description: pkg.desc,
        },
      })),
    },
  };

  const faqs = detailed?.faqs || [];
  const jsonLdFaq =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
      { '@type': 'ListItem', position: 2, name: 'Special Events', item: 'https://www.glitzandglamours.com/special-events' },
      { '@type': 'ListItem', position: 3, name: eventName, item: canonicalUrl(detailed ? detailed.slug : slug) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />
      <SpecialEventDetailClient slug={slug} dbCategory={dbCategory} realReviews={realReviews} />
    </>
  );
}
