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
    '@type': 'BeautySalon',
    name: 'Glitz & Glamour Studio',
    image: `https://www.glitzandglamours.com${area.heroImage}`,
    '@id': `https://www.glitzandglamours.com/service-areas/${area.slug}#salon`,
    url: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
    telephone: '+1-760-290-5910',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '935 W San Marcos Blvd, Suite 101',
      addressLocality: 'San Marcos',
      addressRegion: 'CA',
      postalCode: '92078',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.1434,
      longitude: -117.1856,
    },
    areaServed: {
      '@type': 'City',
      name: `${area.city}, CA`,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '16:00',
      },
    ],
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
        name: 'Special Events',
        item: 'https://www.glitzandglamours.com/special-events',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Weddings & Bridal',
        item: 'https://www.glitzandglamours.com/special-events/weddings-bridal',
      },
      {
        '@type': 'ListItem',
        position: 4,
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
