import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reviews | Glitz & Glamour Studio',
  description:
    'Read 5-star reviews for Glitz & Glamour Studio in Vista, CA. Clients praise our precision nail art, lived-in balayage, gentle waxing, and custom facials.',
  keywords:
    'hair salon reviews vista ca, nail salon reviews vista ca, beauty salon vista reviews, glitz and glamour reviews',
  alternates: { canonical: 'https://www.glitzandglamours.com/reviews' },
  openGraph: {
    title: 'Reviews | Glitz & Glamour Studio',
    description:
      '5-star rated nail, hair & beauty salon in Vista, CA. Read real client reviews and ratings.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/reviews',
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

