import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail & Hair Salon San Marcos CA | Services — Glitz & Glamour',
  description:
    'Acrylic sets, Gel-X, balayage, haircuts, Brazilian wax, facials & more at Glitz & Glamour Studio at 935 W San Marcos Blvd, San Marcos, CA. Serving San Marcos, Vista & North County. Book online.',
  keywords:
    'san diego hair salons, nail salon san marcos ca, hair salon san marcos ca, pedicure san marcos ca, gel x san marcos, acrylic nails san marcos, balayage san marcos, waxing san marcos, facials san marcos ca, vista ca',
  alternates: { canonical: 'https://www.glitzandglamours.com/services' },
  openGraph: {
    title: 'Nail & Hair Salon San Marcos CA | Services — Glitz & Glamour',
    description:
      'Acrylic sets, Gel-X, balayage, haircuts, waxing & facials in San Marcos, CA. Browse prices and book online.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/services',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.glitzandglamours.com/services' },
  ],
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
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

