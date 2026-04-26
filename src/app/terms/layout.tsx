import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Glitz & Glamour Studio',
  description:
    'Terms and conditions for services at Glitz & Glamour Studio in Vista, CA. Review before booking your appointment.',
  alternates: { canonical: 'https://glitzandglamours.com/terms' },
  openGraph: {
    title: 'Terms & Conditions | Glitz & Glamour Studio',
    description: 'Service terms and conditions for Glitz & Glamour Studio.',
    type: 'website',
    url: 'https://glitzandglamours.com/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
