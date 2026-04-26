import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Events — Weddings, Quinceañeras, Proms | Glitz & Glamour Studio',
  description:
    'On-location hair, makeup, and beauty services for weddings, quinceañeras, proms, and special events in Vista & North County, CA. Submit your inquiry today.',
  keywords:
    'special events Vista CA, wedding hair Vista, quinceañera makeup, prom glam, bridal hair North County, on-location beauty services',
  alternates: { canonical: 'https://glitzandglamours.com/special-events' },
  openGraph: {
    title: 'Special Events | Glitz & Glamour Studio',
    description: 'Weddings, quinceañeras, proms & more — on-location glam in Vista, CA.',
    type: 'website',
    url: 'https://glitzandglamours.com/special-events',
  },
};

export default function SpecialEventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
