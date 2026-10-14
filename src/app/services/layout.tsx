import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salon Services & Prices in San Marcos & Vista CA | Glitz',
  description:
    'Explore all 29 nail, hair color, haircut, waxing & facial services in San Marcos & Vista, CA (935 W San Marcos Blvd). View starting prices and book online!',
  keywords:
    'nail salon san marcos ca, nail salon vista ca, hair salon san marcos ca, hair salon vista ca, pedicure san marcos ca, gel x san marcos, acrylic nails san marcos, balayage san marcos, waxing san marcos, facials san marcos ca',
  alternates: { canonical: 'https://www.glitzandglamours.com/services' },
  openGraph: {
    title: 'Salon Services & Prices in San Marcos & Vista CA | Glitz',
    description:
      'Explore all 29 nail, hair color, haircut, waxing & facial services in San Marcos & Vista, CA (935 W San Marcos Blvd). View starting prices and book online!',
    type: 'website',
    url: 'https://www.glitzandglamours.com/services',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salon Services & Prices in San Marcos & Vista CA | Glitz',
    description:
      'Explore all 29 nail, hair color, haircut, waxing & facial services in San Marcos & Vista, CA (935 W San Marcos Blvd). View starting prices and book online!',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

