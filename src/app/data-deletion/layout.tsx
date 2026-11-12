import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion Request | Glitz & Glamour Studio',
  description: 'Submit a verified user data and account deletion request at Glitz & Glamour Studio.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.glitzandglamours.com/data-deletion' },
};

export default function DataDeletionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
