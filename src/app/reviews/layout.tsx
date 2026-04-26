import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Reviews | Glitz & Glamour Studio — 5-Star Rated in Vista, CA',
  description:
    '5-star rated beauty salon in Vista, CA. Read real reviews from clients about nails, hair, facials, and waxing at Glitz & Glamour Studio.',
  keywords: 'Glitz and Glamour reviews, nail salon reviews Vista CA, hair salon reviews Vista, beauty salon ratings',
  alternates: { canonical: 'https://glitzandglamours.com/reviews' },
  openGraph: {
    title: 'Client Reviews | Glitz & Glamour Studio',
    description: '5-star rated nail, hair & beauty salon in Vista, CA. Read real client reviews.',
    type: 'website',
    url: 'https://glitzandglamours.com/reviews',
  },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
