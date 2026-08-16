import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weddings, Quinceañeras & Proms | Glitz & Glamour Studio San Marcos CA',
  description:
    'In-studio at our San Marcos salon and on-location hair, makeup, and beauty services for weddings, quinceañeras, proms, and special events across North County San Diego. Submit your inquiry today.',
  keywords:
    'special events San Marcos CA, wedding hair San Marcos, quinceañera makeup, prom glam, bridal hair North County, on-location beauty services Vista Carlsbad',
  alternates: { canonical: 'https://glitzandglamours.com/special-events' },
  openGraph: {
    title: 'Weddings, Quinceañeras & Proms | Glitz & Glamour Studio — San Marcos, CA',
    description: 'Weddings, quinceañeras, proms & more — in-studio at 935 W San Marcos Blvd and on-location glam across San Diego County.',
    type: 'website',
    url: 'https://glitzandglamours.com/special-events',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Special Events', item: 'https://glitzandglamours.com/special-events' },
  ],
};

export default function SpecialEventsLayout({ children }: { children: React.ReactNode }) {
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
