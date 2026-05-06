import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Appointment | Glitz & Glamour — Vista, CA',
  description:
    'Book your nail, hair, waxing, or facial appointment at Glitz & Glamour Studio in Vista, CA. Same-week availability — easy online booking. Serving North County San Diego.',
  keywords: 'book appointment Vista CA, nail salon booking, hair appointment Vista, beauty salon Vista CA',
  alternates: { canonical: 'https://glitzandglamours.com/book' },
  openGraph: {
    title: 'Book Your Appointment | Glitz & Glamour — Vista, CA',
    description: 'Book nails, hair, waxing, or facials in Vista, CA — same-week availability.',
    type: 'website',
    url: 'https://glitzandglamours.com/book',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Book', item: 'https://glitzandglamours.com/book' },
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
