import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Policies | Glitz & Glamour Studio San Marcos, CA',
  description:
    'Review studio policies on cancellations, deposits, late arrivals & appointments at Glitz & Glamour Studio in San Marcos, CA.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/policy' },
  openGraph: {
    title: 'Studio Policies | Glitz & Glamour Studio San Marcos, CA',
    description: 'Review studio policies on cancellations, deposits, late arrivals & appointments at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/policy',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio Policies — San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Policies | Glitz & Glamour Studio San Marcos, CA',
    description: 'Review studio policies on cancellations, deposits, late arrivals & appointments at Glitz & Glamour Studio in San Marcos, CA.',
    images: ['/herobg.jpeg'],
  },
};

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
