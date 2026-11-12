import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bridal & Event Hair & Makeup in San Marcos & San Diego, CA',
  description:
    'Wedding, quinceañera & event hair and makeup in San Marcos, CA + mobile glam across San Diego County. Request your custom beauty quote!',
  keywords:
    'hair and makeup san diego, makeup artist san diego, wedding hair makeup artist, bridal hair and makeup san diego, special events hair and makeup san marcos ca, quinceanera hair and makeup san diego, on-location hair and makeup san diego',
  alternates: { canonical: 'https://www.glitzandglamours.com/special-events' },
  openGraph: {
    title: 'Bridal & Event Hair & Makeup in San Marcos & San Diego, CA',
    description:
      'Wedding, quinceañera & event hair and makeup in San Marcos, CA + mobile glam across San Diego County. Request your custom beauty quote!',
    type: 'website',
    url: 'https://www.glitzandglamours.com/special-events',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Bridal & Special Event Hair & Makeup — Glitz & Glamour Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridal & Event Hair & Makeup in San Marcos & San Diego, CA',
    description:
      'Wedding, quinceañera & event hair and makeup in San Marcos, CA + mobile glam across San Diego County. Request your custom beauty quote!',
    images: ['/herobg.jpeg'],
  },
};

export default function SpecialEventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
