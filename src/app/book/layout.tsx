import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Online: Nail, Hair & Facial Salon in San Marcos & Vista | Glitz',
  description:
    'Instant online booking, 5.0★ rated (167 reviews). Book Gel-X from $60, acrylics, pedicures, balayage, haircuts, waxing & facials at 935 W San Marcos Blvd.',
  keywords: 'book appointment San Marcos CA, nail salon booking San Marcos, nail salon booking Vista CA, hair appointment San Marcos, beauty salon San Marcos CA, Vista CA',
  alternates: { canonical: 'https://www.glitzandglamours.com/book' },
  openGraph: {
    title: 'Book Online: Nail, Hair & Facial Salon in San Marcos & Vista | Glitz',
    description:
      'Instant online booking, 5.0★ rated (167 reviews). Book Gel-X from $60, acrylics, pedicures, balayage, haircuts, waxing & facials at 935 W San Marcos Blvd.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/book',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Online: Nail, Hair & Facial Salon in San Marcos & Vista | Glitz',
    description:
      'Instant online booking, 5.0★ rated (167 reviews). Book Gel-X from $60, acrylics, pedicures, balayage, haircuts, waxing & facials at 935 W San Marcos Blvd.',
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
