import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Usage & Release Policy | Glitz & Glamour Studio',
  description:
    'Optional photo, video, and portfolio release guidelines for clients at Glitz & Glamour Studio in San Marcos, CA.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/image-policy' },
  openGraph: {
    title: 'Image Usage & Release Policy | Glitz & Glamour Studio',
    description: 'Optional photo and video release policy for clients at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/image-policy',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio' }],
  },
};

export default function ImagePolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
