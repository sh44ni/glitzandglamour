import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Glitz & Glamour Studio — Nails, Hair, Waxing & Facials in Vista, CA',
  description:
    'Browse nail, pedicure, hair color, haircut, waxing, and facial services at Glitz & Glamour Studio in Vista, CA — serving North County. See starting prices and book your appointment.',
  keywords:
    'nail salon Vista CA, gel x, acrylic set, pedicure Vista, hair color Vista, balayage Vista, women haircut Vista, waxing Vista, facial Vista, North County salon',
  openGraph: {
    title: 'Services | Glitz & Glamour Studio',
    description:
      'Nails, hair, waxing & facials in Vista, CA — serving North County. Browse services and starting prices.',
    type: 'website',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

