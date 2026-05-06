import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail & Beauty Gallery | Glitz & Glamour Vista CA',
  description:
    'Browse our latest nail art, balayage, facials, and beauty work at Glitz & Glamour Studio in Vista, CA. Real results from real clients.',
  keywords: 'nail art gallery Vista CA, balayage before after, beauty salon portfolio, Glitz and Glamour gallery',
  alternates: { canonical: 'https://glitzandglamours.com/gallery' },
  openGraph: {
    title: 'Nail & Beauty Gallery | Glitz & Glamour Vista CA',
    description: 'See our latest nail art, hair color, and beauty work in Vista, CA.',
    type: 'website',
    url: 'https://glitzandglamours.com/gallery',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://glitzandglamours.com/gallery' },
  ],
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
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
