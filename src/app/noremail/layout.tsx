import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Communications & Email Composer | Glitz & Glamour Studio',
  description:
    'Official Glitz & Glamour Studio administrative communications and HTML dispatch console in San Marcos, CA.',
  alternates: { canonical: 'https://www.glitzandglamours.com/noremail' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Studio Communications & Email Composer | Glitz & Glamour Studio',
    description:
      'Official Glitz & Glamour Studio administrative communications and HTML dispatch console.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/noremail',
  },
};

export default function NoremailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
