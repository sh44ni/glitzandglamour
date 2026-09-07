import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Glitz & Glamour Studio',
  description:
    'Browse real photos of our nail art, acrylic sets, Gel-X, balayage, haircuts, and facials at Glitz & Glamour Studio in Vista, CA. Unfiltered client results.',
  keywords:
    'closest beauty salon to me, local beauty salons, nail art gallery Vista CA, balayage photos vista, beauty salon portfolio',
  alternates: { canonical: 'https://www.glitzandglamours.com/gallery' },
  openGraph: {
    title: 'Gallery | Glitz & Glamour Studio',
    description:
      'Browse real, unfiltered photos of our nail art, hair color, and skincare work in Vista, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/gallery',
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

