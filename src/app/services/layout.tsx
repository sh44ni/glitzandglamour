import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salon Menu & Prices: Gel-X $60, Acrylics $65 | San Marcos & Vista',
  description:
    '5.0★ rated (167 reviews). Full menu & prices at 935 W San Marcos Blvd: Gel-X from $60, acrylics from $65, plus hair color, haircuts, waxing & facials. Book online!',
  keywords:
    'nail salon san marcos ca, nail salon vista ca, hair salon san marcos ca, hair salon vista ca, pedicure san marcos ca, gel x san marcos, acrylic nails san marcos, balayage san marcos, waxing san marcos, facials san marcos ca',
  alternates: { canonical: 'https://www.glitzandglamours.com/services' },
  openGraph: {
    title: 'Salon Menu & Prices: Gel-X $60, Acrylics $65 | San Marcos & Vista',
    description:
      '5.0★ rated (167 reviews). Full menu & prices at 935 W San Marcos Blvd: Gel-X from $60, acrylics from $65, plus hair color, haircuts, waxing & facials. Book online!',
    type: 'website',
    url: 'https://www.glitzandglamours.com/services',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salon Menu & Prices: Gel-X $60, Acrylics $65 | San Marcos & Vista',
    description:
      '5.0★ rated (167 reviews). Full menu & prices at 935 W San Marcos Blvd: Gel-X from $60, acrylics from $65, plus hair color, haircuts, waxing & facials. Book online!',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

