import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bridal & Event Hair & Makeup San Marcos & Vista | Glitz CA',
  description:
    'Bridal, wedding, quinceañera & prom hair and makeup in San Marcos & Vista, CA (935 W San Marcos Blvd) + mobile glam across San Diego. Request a quote today!',
  keywords:
    'hair and makeup san diego, makeup artist san diego, wedding hair makeup artist, bridal hair and makeup san diego, special events hair and makeup san marcos ca, bridal makeup vista ca, on-location hair and makeup san diego',
  alternates: { canonical: 'https://www.glitzandglamours.com/special-events' },
  openGraph: {
    title: 'Bridal & Event Hair & Makeup San Marcos & Vista | Glitz CA',
    description:
      'Bridal, wedding, quinceañera & prom hair and makeup in San Marcos & Vista, CA (935 W San Marcos Blvd) + mobile glam across San Diego. Request a quote today!',
    type: 'website',
    url: 'https://www.glitzandglamours.com/special-events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridal & Event Hair & Makeup San Marcos & Vista | Glitz CA',
    description:
      'Bridal, wedding, quinceañera & prom hair and makeup in San Marcos & Vista, CA (935 W San Marcos Blvd) + mobile glam across San Diego. Request a quote today!',
  },
};

export default function SpecialEventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
