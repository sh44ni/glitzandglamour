import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Sign In & VIP Member Registration | Glitz & Glamour Studio',
  description:
    'Sign in or create your complimentary VIP Member account at Glitz & Glamour Studio in San Marcos, CA to manage appointments, collect Hello Kitty loyalty stamps, and unlock exclusive studio perks.',
  alternates: { canonical: 'https://www.glitzandglamours.com/sign-in' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Client Sign In & VIP Member Registration | Glitz & Glamour Studio',
    description:
      'Access your Glitz & Glamour Studio VIP member portal, digital loyalty card, and appointment history in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/sign-in',
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
