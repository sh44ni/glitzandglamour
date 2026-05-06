import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '5-Star Reviews | Glitz & Glamour — Vista, CA Salon',
  description:
    '5-star rated beauty salon in Vista, CA. Read real reviews from clients about nails, hair, facials, and waxing at Glitz & Glamour Studio.',
  keywords: 'Glitz and Glamour reviews, nail salon reviews Vista CA, hair salon reviews Vista, beauty salon ratings',
  alternates: { canonical: 'https://glitzandglamours.com/reviews' },
  openGraph: {
    title: '5-Star Reviews | Glitz & Glamour — Vista, CA Salon',
    description: '5-star rated nail, hair & beauty salon in Vista, CA. Read real client reviews.',
    type: 'website',
    url: 'https://glitzandglamours.com/reviews',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Reviews', item: 'https://glitzandglamours.com/reviews' },
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
