import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Policies | Glitz & Glamour Studio — Vista, CA',
  description:
    'Review our studio policies including cancellations, deposits, late arrivals, and appointment guidelines at Glitz & Glamour Studio in Vista, CA.',
  alternates: { canonical: 'https://glitzandglamours.com/policy' },
  openGraph: {
    title: 'Studio Policies | Glitz & Glamour Studio',
    description: 'Cancellations, deposits, and appointment guidelines.',
    type: 'website',
    url: 'https://glitzandglamours.com/policy',
  },
};

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
