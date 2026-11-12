import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Glitz & Glamour Studio',
  description:
    'Terms and conditions for services at Glitz & Glamour Studio in San Marcos, CA. Review before booking your appointment.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/terms' },
  openGraph: {
    title: 'Terms & Conditions | Glitz & Glamour Studio',
    description: 'Service terms and conditions for Glitz & Glamour Studio.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/terms',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio' }],
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
