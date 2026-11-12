import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Event Contract | Glitz & Glamour Studio',
  robots: { index: false, follow: false },
};

export default function ContractLayout({ children }: { children: React.ReactNode }) {
  return children;
}
