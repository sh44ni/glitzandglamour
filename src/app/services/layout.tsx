import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail & Hair Salon Vista CA | Services — Glitz & Glamour',
  description:
    'Acrylic sets, gel-X, balayage, haircuts, Brazilian wax, deep-cleansing facials & more at Glitz & Glamour Studio in Vista, CA. See prices, view service details, and book your appointment online.',
  keywords:
    'san diego hair salons, nail salon vista ca, hair salon vista ca, pedicure vista ca, gel x vista, acrylic nails vista, balayage vista, waxing vista, facials vista ca',
  alternates: { canonical: 'https://www.glitzandglamours.com/services' },
  openGraph: {
    title: 'Nail & Hair Salon Vista CA | Services — Glitz & Glamour',
    description:
      'Acrylic sets, gel-X, balayage, haircuts, waxing & facials in Vista, CA. Browse prices and book online.',
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

