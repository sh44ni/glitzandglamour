import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Event Hair & Makeup San Diego | Glitz & Glamour Studio',
  description:
    'San Diego hair and makeup specialists for weddings, bridal parties, quinceañeras & proms. Studio in San Marcos & mobile glam across San Diego. Get a custom quote.',
  keywords:
    'hair and makeup san diego, makeup artist san diego, wedding hair makeup artist, bridal hair and makeup san diego, hair and makeup prices, hair updos cost, on-location hair and makeup san diego, special events hair and makeup san marcos ca',
  alternates: { canonical: 'https://www.glitzandglamours.com/special-events' },
  openGraph: {
    title: 'Special Event Hair & Makeup San Diego | Glitz & Glamour Studio',
    description:
      'Weddings, bridal parties, quinceañeras, proms & galas — in-studio at 935 W San Marcos Blvd and luxury on-location mobile glam across San Diego County.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/special-events',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Special Events', item: 'https://www.glitzandglamours.com/special-events' },
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
