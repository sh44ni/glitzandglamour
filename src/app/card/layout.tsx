import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VIP Loyalty Stamp Card | Glitz & Glamour San Marcos, CA',
  description:
    'Collect digital stamps at Glitz & Glamour Studio in San Marcos, CA. Earn a complimentary nail set after 10 visits & unlock VIP rewards.',
  alternates: { canonical: 'https://www.glitzandglamours.com/card' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'VIP Loyalty Stamp Card | Glitz & Glamour San Marcos, CA',
    description:
      'Collect digital stamps at Glitz & Glamour Studio in San Marcos, CA. Earn a complimentary nail set after 10 visits & unlock VIP rewards.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/card',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour VIP Loyalty Stamp Card' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIP Loyalty Stamp Card | Glitz & Glamour San Marcos, CA',
    description:
      'Collect digital stamps at Glitz & Glamour Studio in San Marcos, CA. Earn a complimentary nail set after 10 visits & unlock VIP rewards.',
    images: ['/herobg.jpeg'],
  },
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
