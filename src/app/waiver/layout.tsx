import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liability Waiver & Consent | Glitz & Glamour Studio',
  description:
    'Service liability waiver, health disclosure rules, and aftercare responsibilities at Glitz & Glamour Studio in San Marcos, CA.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/waiver' },
  openGraph: {
    title: 'Liability Waiver & Consent | Glitz & Glamour Studio',
    description: 'Service liability waiver and client consent guidelines at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/waiver',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio' }],
  },
};

export default function WaiverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
