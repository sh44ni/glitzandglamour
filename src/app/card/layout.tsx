import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hello Kitty VIP Loyalty & Glam Insider Gold Card | Glitz & Glamour Studio',
  description:
    'Collect digital stamps with every nail, hair, and beauty appointment at Glitz & Glamour Studio in San Marcos, CA. Earn a complimentary nail set after 10 visits, unlock birthday rewards, and share your Glam Insider referral pass.',
  alternates: { canonical: 'https://www.glitzandglamours.com/card' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Hello Kitty VIP Loyalty & Glam Insider Gold Card | Glitz & Glamour Studio',
    description:
      'Collect digital stamps with every visit to Glitz & Glamour Studio in San Marcos, CA and unlock complimentary nail sets, birthday spins, and VIP referral rewards.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/card',
  },
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
