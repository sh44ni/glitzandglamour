import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Glitz & Glamour Studio',
  description:
    'Read our privacy policy detailing how Glitz & Glamour Studio collects, uses, and protects your personal information.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/privacy' },
  openGraph: {
    title: 'Privacy Policy | Glitz & Glamour Studio',
    description: 'How we collect, use, and protect your personal information.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/privacy',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio' }],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
