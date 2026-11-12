import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Referral | Glitz & Glamour Studio',
  robots: { index: false, follow: false },
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
