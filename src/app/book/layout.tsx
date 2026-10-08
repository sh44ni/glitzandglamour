import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Appointment | Glitz & Glamour Studio, San Marcos CA',
  description:
    'Book your nail, hair, waxing, or facial appointment at Glitz & Glamour Studio at 935 W San Marcos Blvd, Suite 101, San Marcos, CA. Serving San Marcos, Vista & North County.',
  keywords: 'book appointment San Marcos CA, nail salon booking San Marcos, hair appointment San Marcos, beauty salon San Marcos CA, Vista CA',
  alternates: { canonical: 'https://www.glitzandglamours.com/book' },
  openGraph: {
    title: 'Book Appointment | Glitz & Glamour Studio, San Marcos CA',
    description: 'Book nails, hair, waxing, or facials in San Marcos, CA — same-week availability.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/book',
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
