import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nails, Hair, Waxing & Facials in Vista, CA — Starting at $15 | Glitz & Glamour Studio',
  description:
    'Acrylic sets, gel-X, balayage, haircuts, Brazilian wax, deep-cleansing facials & more at Glitz & Glamour Studio in Vista, CA. See prices, view service details, and book your appointment online.',
  keywords:
    'nail salon Vista CA, gel x, acrylic set, pedicure Vista, hair color Vista, balayage Vista, women haircut Vista, waxing Vista, facial Vista, North County salon, beauty salon Vista',
  alternates: { canonical: 'https://glitzandglamours.com/services' },
  openGraph: {
    title: 'Nails, Hair, Waxing & Facials — Glitz & Glamour Studio',
    description:
      'Acrylic sets, gel-X, balayage, haircuts, waxing & facials in Vista, CA. Browse prices and book online.',
    type: 'website',
    url: 'https://glitzandglamours.com/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
