import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leave a Review | Glitz & Glamour Studio',
  robots: { index: false, follow: false },
};

export default function LeaveReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
