import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liability Waiver & Client Consent | Glitz & Glamour Studio — San Marcos, CA',
  description:
    'Review our service liability waiver, client health disclosure requirements, and aftercare responsibilities for beauty services at Glitz & Glamour Studio in San Marcos, CA (935 W San Marcos Blvd, Suite 101).',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/waiver' },
  openGraph: {
    title: 'Liability Waiver & Client Consent | Glitz & Glamour Studio',
    description: 'Service liability waiver and client consent guidelines for beauty services at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/waiver',
  },
};

export default function WaiverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
