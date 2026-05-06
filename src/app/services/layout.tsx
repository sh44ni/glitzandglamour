import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail & Hair Salon Vista CA | Services — Glitz & Glamour',
  description:
    'Acrylic sets, gel-X, balayage, haircuts, Brazilian wax, deep-cleansing facials & more at Glitz & Glamour Studio in Vista, CA. See prices, view service details, and book your appointment online.',
  keywords:
    'nail salon Vista CA, gel x, acrylic set, pedicure Vista, hair color Vista, balayage Vista, women haircut Vista, waxing Vista, facial Vista, North County salon, beauty salon Vista',
  alternates: { canonical: 'https://glitzandglamours.com/services' },
  openGraph: {
    title: 'Nail & Hair Salon Vista CA | Services — Glitz & Glamour',
    description:
      'Acrylic sets, gel-X, balayage, haircuts, waxing & facials in Vista, CA. Browse prices and book online.',
    type: 'website',
    url: 'https://glitzandglamours.com/services',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://glitzandglamours.com/services' },
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
