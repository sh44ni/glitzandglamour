import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VIP Member Profile & Appointments Dashboard | Glitz & Glamour Studio',
  description:
    'Manage your Glitz & Glamour Studio member profile, view upcoming and past nail, hair, and beauty appointments, access your Hello Kitty loyalty card, and update your confidential health intake record.',
  alternates: { canonical: 'https://www.glitzandglamours.com/profile' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'VIP Member Profile & Appointments Dashboard | Glitz & Glamour Studio',
    description:
      'View your appointments, digital loyalty stamps, and member rewards at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/profile',
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
