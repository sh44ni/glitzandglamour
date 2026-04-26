import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Glitz & Glamour Studio',
  description:
    'Answers to common questions about booking, pricing, cancellations, walk-ins, and services at Glitz & Glamour Studio in Vista, CA.',
  keywords: 'nail salon FAQ Vista CA, beauty salon questions, booking questions, Glitz and Glamour FAQ',
  alternates: { canonical: 'https://glitzandglamours.com/faq' },
  openGraph: {
    title: 'FAQ | Glitz & Glamour Studio',
    description: 'Common questions about booking, pricing, and services at our Vista, CA studio.',
    type: 'website',
    url: 'https://glitzandglamours.com/faq',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
