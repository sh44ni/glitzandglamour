import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Online | Nail, Hair & Facial Salon in San Marcos, CA',
  description:
    'Book online at Glitz & Glamour Studio in San Marcos, CA (935 W San Marcos Blvd). Gel-X $60+, acrylics, detox pedicures, balayage, waxing & facials.',
  keywords: 'book appointment San Marcos CA, nail salon booking San Marcos, hair appointment San Marcos, beauty salon San Marcos CA',
  alternates: { canonical: 'https://www.glitzandglamours.com/book' },
  openGraph: {
    title: 'Book Online | Nail, Hair & Facial Salon in San Marcos, CA',
    description:
      'Book online at Glitz & Glamour Studio in San Marcos, CA (935 W San Marcos Blvd). Gel-X $60+, acrylics, detox pedicures, balayage, waxing & facials.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/book',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Book Online — Glitz & Glamour Studio San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Online | Nail, Hair & Facial Salon in San Marcos, CA',
    description:
      'Book online at Glitz & Glamour Studio in San Marcos, CA (935 W San Marcos Blvd). Gel-X $60+, acrylics, detox pedicures, balayage, waxing & facials.',
    images: ['/herobg.jpeg'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Book', item: 'https://www.glitzandglamours.com/book' },
  ],
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
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
