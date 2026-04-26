import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Glitz & Glamour Studio',
  description:
    'Read our privacy policy detailing how Glitz & Glamour Studio collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://glitzandglamours.com/privacy' },
  openGraph: {
    title: 'Privacy Policy | Glitz & Glamour Studio',
    description: 'How we collect, use, and protect your personal information.',
    type: 'website',
    url: 'https://glitzandglamours.com/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
