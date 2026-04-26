import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Appointment | Glitz & Glamour Studio — Vista, CA',
  description:
    'Book your nail, hair, waxing, or facial appointment at Glitz & Glamour Studio in Vista, CA. Same-week availability. Serving North County San Diego.',
  keywords: 'book appointment Vista CA, nail salon booking, hair appointment Vista, beauty salon Vista CA',
  alternates: { canonical: 'https://glitzandglamours.com/book' },
  openGraph: {
    title: 'Book Your Appointment | Glitz & Glamour Studio',
    description: 'Book nails, hair, waxing, or facials in Vista, CA — serving North County.',
    type: 'website',
    url: 'https://glitzandglamours.com/book',
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
