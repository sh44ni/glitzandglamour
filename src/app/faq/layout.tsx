import type { Metadata } from 'next';
import en from '@/locales/en.json';

export const metadata: Metadata = {
  title: 'Salon & Bridal FAQ | Glitz & Glamour Studio San Marcos, CA',
  description:
    'Answers on booking, hours, parking, pricing, Gel-X, acrylics, balayage, waxing & facials at Glitz & Glamour Studio in San Marcos, CA.',
  keywords: 'nail salon San Marcos CA, beauty salon San Marcos, hair salon San Marcos CA, where is Glitz and Glamour located, acrylic nails San Marcos, balayage San Marcos, waxing San Marcos CA, Glitz and Glamour Studio FAQ',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/faq' },
  openGraph: {
    title: 'Salon & Bridal FAQ | Glitz & Glamour Studio San Marcos, CA',
    description: 'Answers on booking, hours, parking, pricing, Gel-X, acrylics, balayage, waxing & facials at Glitz & Glamour Studio in San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/faq',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio FAQ — San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salon & Bridal FAQ | Glitz & Glamour Studio San Marcos, CA',
    description: 'Answers on booking, hours, parking, pricing, Gel-X, acrylics, balayage, waxing & facials at Glitz & Glamour Studio in San Marcos, CA.',
    images: ['/herobg.jpeg'],
  },
};

// Built from the same strings the /faq page renders, so schema and page can never drift apart.
const faqStrings = en.faq as unknown as Record<string, string>;
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: Object.keys(faqStrings)
    .filter((k) => /^q\d_\d+$/.test(k))
    .map((k) => ({
      '@type': 'Question',
      name: faqStrings[k],
      acceptedAnswer: { '@type': 'Answer', text: faqStrings['a' + k.slice(1)] },
    })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://www.glitzandglamours.com/faq' },
  ],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
