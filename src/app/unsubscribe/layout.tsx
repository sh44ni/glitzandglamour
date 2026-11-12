import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe | Glitz & Glamour Studio',
  description: 'Manage your email and SMS communication preferences for Glitz & Glamour Studio.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.glitzandglamours.com/unsubscribe' },
};

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
