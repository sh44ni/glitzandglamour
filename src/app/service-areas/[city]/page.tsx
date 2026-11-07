import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';
import { getDynamicRealReviews, getFilteredRealReviews } from '@/lib/realReviews';
import ServiceAreaDetailClient from './ServiceAreaDetailClient';

interface PageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_SERVICE_AREA_SLUGS.map((slug) => ({
    city: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const area = SERVICE_AREAS[city];

  if (!area) {
    return {
      title: 'Service Area Not Found | Glitz & Glamour Studio',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://www.glitzandglamours.com/service-areas/${city}`;

  return {
    title: area.metaTitle,
    description: area.metaDescription,
    keywords: area.keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `https://www.glitzandglamours.com${area.heroImage}`,
          width: 1200,
          height: 630,
          alt: `${area.heroTitle} - Glitz & Glamour Studio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: area.metaTitle,
      description: area.metaDescription,
      images: [`https://www.glitzandglamours.com${area.heroImage}`],
    },
  };
}

export default async function ServiceAreaPage({ params }: PageProps) {
  const { city } = await params;
  const area = SERVICE_AREAS[city];

  if (!area) {
    notFound();
  }

  // Fetch dynamic, auto-updating real reviews from the DB (with verified fallback cache)
  const allReviews = getDynamicRealReviews();
  const realReviews = getFilteredRealReviews({
    allReviews,
    slug: city,
    keywords: area.keywords,
    city: area.city,
    limit: 2,
  });

  // Schema.org Structured Data
  const jsonLdLocalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://www.glitzandglamours.com/service-areas/${area.slug}#service`,
    name: `Nail, Hair, Facial & Event Beauty Services in ${area.city}, CA`,
    url: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
    image: `https://www.glitzandglamours.com${area.heroImage}`,
    provider: { '@type': 'BeautySalon', '@id': 'https://www.glitzandglamours.com', name: 'Glitz & Glamour Studio' },
    areaServed: {
      '@type': 'City',
      name: `${area.city}, CA`,
      geo: { '@type': 'GeoCoordinates', latitude: area.geo.latitude, longitude: area.geo.longitude },
    },
  };

  const jsonLdFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.glitzandglamours.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Service Areas',
        item: 'https://www.glitzandglamours.com/service-areas',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${area.city}, CA`,
        item: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <ServiceAreaDetailClient slug={city} realReviews={realReviews} />
    </>
  );
}
