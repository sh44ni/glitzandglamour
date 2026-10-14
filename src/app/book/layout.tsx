import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Nail & Hair Appointment San Marcos & Vista | Glitz CA',
  description:
    'Book your Gel-X, acrylic nails, pedicure, balayage, haircut, waxing, or facial in San Marcos & Vista, CA at 935 W San Marcos Blvd. Instant online booking!',
  keywords: 'book appointment San Marcos CA, nail salon booking San Marcos, nail salon booking Vista CA, hair appointment San Marcos, beauty salon San Marcos CA, Vista CA',
  alternates: { canonical: 'https://www.glitzandglamours.com/book' },
  openGraph: {
    title: 'Book Nail & Hair Appointment San Marcos & Vista | Glitz CA',
    description:
      'Book your Gel-X, acrylic nails, pedicure, balayage, haircut, waxing, or facial in San Marcos & Vista, CA at 935 W San Marcos Blvd. Instant online booking!',
    type: 'website',
    url: 'https://www.glitzandglamours.com/book',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Nail & Hair Appointment San Marcos & Vista | Glitz CA',
    description:
      'Book your Gel-X, acrylic nails, pedicure, balayage, haircut, waxing, or facial in San Marcos & Vista, CA at 935 W San Marcos Blvd. Instant online booking!',
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
