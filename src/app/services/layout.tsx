import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salon Menu & Prices in San Marcos, CA | Gel-X $60+, Hair',
  description:
    '5.0★ rated salon menu at 935 W San Marcos Blvd: Gel-X $60+, acrylics $65+, detox pedicures $65+, balayage, haircuts, waxing & facials.',
  keywords:
    'nail salon san marcos ca, hair salon san marcos ca, pedicure san marcos ca, gel x san marcos, acrylic nails san marcos, balayage san marcos, waxing san marcos, facials san marcos ca',
  alternates: { canonical: 'https://www.glitzandglamours.com/services' },
  openGraph: {
    title: 'Salon Menu & Prices in San Marcos, CA | Gel-X $60+, Hair',
    description:
      '5.0★ rated salon menu at 935 W San Marcos Blvd: Gel-X $60+, acrylics $65+, detox pedicures $65+, balayage, haircuts, waxing & facials.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/services',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio Service Menu & Prices — San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salon Menu & Prices in San Marcos, CA | Gel-X $60+, Hair',
    description:
      '5.0★ rated salon menu at 935 W San Marcos Blvd: Gel-X $60+, acrylics $65+, detox pedicures $65+, balayage, haircuts, waxing & facials.',
    images: ['/herobg.jpeg'],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

