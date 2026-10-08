import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Usage & Release Policy | Glitz & Glamour Studio',
  description:
    'Review the image usage and photo/video release policy for Glitz & Glamour Studio in San Marcos, CA.',
  alternates: { canonical: 'https://www.glitzandglamours.com/image-policy' },
  openGraph: {
    title: 'Image Usage & Release Policy | Glitz & Glamour Studio',
    description: 'Image usage and photo/video release policy guidelines.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/image-policy',
  },
};

export default function ImagePolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
