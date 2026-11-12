import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail Art, Gel-X, Balayage & Bridal Gallery | San Marcos, CA',
  description:
    'Real client photos of Gel-X, acrylic nail art, balayage, haircuts, facials & bridal glam at Glitz & Glamour Studio in San Marcos, CA.',
  keywords:
    'nail salon san marcos ca, hair salon san marcos, nail art gallery san marcos, balayage photos san marcos, beauty salon portfolio, bridal hair makeup gallery',
  alternates: { canonical: 'https://www.glitzandglamours.com/gallery' },
  openGraph: {
    title: 'Nail Art, Gel-X, Balayage & Bridal Gallery | San Marcos, CA',
    description:
      'Real client photos of Gel-X, acrylic nail art, balayage, haircuts, facials & bridal glam at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/gallery',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio Portfolio Gallery in San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Art, Gel-X, Balayage & Bridal Gallery | San Marcos, CA',
    description:
      'Real client photos of Gel-X, acrylic nail art, balayage, haircuts, facials & bridal glam at Glitz & Glamour Studio in San Marcos, CA.',
    images: ['/herobg.jpeg'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://www.glitzandglamours.com/gallery' },
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

