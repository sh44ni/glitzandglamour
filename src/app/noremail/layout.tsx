import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Composer | Glitz & Glamour Studio',
  robots: { index: false, follow: false },
};

export default function NoremailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
