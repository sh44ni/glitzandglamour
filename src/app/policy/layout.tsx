import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Policies | Glitz & Glamour Studio — San Marcos, CA',
  description:
    'Review our studio policies including cancellations, deposits, late arrivals, and appointment guidelines at Glitz & Glamour Studio in San Marcos, CA.',
  alternates: { canonical: 'https://glitzandglamours.com/policy' },
  openGraph: {
    title: 'Studio Policies | Glitz & Glamour Studio — San Marcos, CA',
    description: 'Cancellations, deposits, and appointment guidelines at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://glitzandglamours.com/policy',
  },
};

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
