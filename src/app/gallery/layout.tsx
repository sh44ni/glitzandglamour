import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Glitz & Glamour Studio — Nails, Hair & Beauty Work',
  description:
    'Browse our latest nail art, balayage, facials, and beauty work at Glitz & Glamour Studio in Vista, CA. Real results from real clients.',
  keywords: 'nail art gallery Vista CA, balayage before after, beauty salon portfolio, Glitz and Glamour gallery',
  alternates: { canonical: 'https://glitzandglamours.com/gallery' },
  openGraph: {
    title: 'Gallery | Glitz & Glamour Studio',
    description: 'See our latest nail art, hair color, and beauty work in Vista, CA.',
    type: 'website',
    url: 'https://glitzandglamours.com/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
