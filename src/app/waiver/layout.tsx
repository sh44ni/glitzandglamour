import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liability Waiver | Glitz & Glamour Studio',
  description:
    'Review our liability waiver for beauty services at Glitz & Glamour Studio in Vista, CA.',
  alternates: { canonical: 'https://glitzandglamours.com/waiver' },
  openGraph: {
    title: 'Liability Waiver | Glitz & Glamour Studio',
    description: 'Liability waiver for beauty services.',
    type: 'website',
    url: 'https://glitzandglamours.com/waiver',
  },
};

export default function WaiverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
