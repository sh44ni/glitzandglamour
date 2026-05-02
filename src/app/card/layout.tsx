import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loyalty Card | Glitz & Glamour Studio',
  robots: { index: false, follow: false },
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
