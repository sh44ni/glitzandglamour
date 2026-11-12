import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '5-Star Salon Reviews (167+) | Glitz Studio San Marcos, CA',
  description:
    'Read 167+ verified 5-star reviews for Glitz & Glamour Studio in San Marcos, CA. Clients love our Gel-X nails, balayage, waxing & facials.',
  keywords:
    'hair salon reviews san marcos ca, nail salon reviews san marcos ca, beauty salon san marcos reviews, glitz and glamour reviews',
  alternates: { canonical: 'https://www.glitzandglamours.com/reviews' },
  openGraph: {
    title: '5-Star Salon Reviews (167+) | Glitz Studio San Marcos, CA',
    description:
      'Read 167+ verified 5-star reviews for Glitz & Glamour Studio in San Marcos, CA. Clients love our Gel-X nails, balayage, waxing & facials.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/reviews',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: '5-Star Client Reviews — Glitz & Glamour Studio San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '5-Star Salon Reviews (167+) | Glitz Studio San Marcos, CA',
    description:
      'Read 167+ verified 5-star reviews for Glitz & Glamour Studio in San Marcos, CA. Clients love our Gel-X nails, balayage, waxing & facials.',
    images: ['/herobg.jpeg'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Reviews', item: 'https://www.glitzandglamours.com/reviews' },
  ],
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}

