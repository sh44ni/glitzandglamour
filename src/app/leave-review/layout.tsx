import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Share Your Studio Experience | Leave a Review | Glitz & Glamour Studio',
  description:
    'Share your verified client feedback for Glitz & Glamour Studio in San Marcos, CA. Rate your nail art, hair styling, facial, or beauty appointment and claim your first-visit studio reward.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Share Your Studio Experience | Glitz & Glamour Studio',
    description:
      'Leave a verified review for your recent appointment at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
  },
};

export default function LeaveReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
