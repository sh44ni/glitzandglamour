import type { Metadata } from 'next';
import en from '@/locales/en.json';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Glitz & Glamour Studio San Marcos CA',
  description:
    'Find answers about our new San Marcos location (935 W San Marcos Blvd), booking, hours, parking, payments, nail services, balayage, waxing, facials, and lash extensions in North County San Diego.',
  keywords: 'nail salon San Marcos CA, beauty salon San Marcos, hair salon San Marcos CA, where is Glitz and Glamour located, nail salon Vista CA, acrylic nails San Marcos, balayage San Marcos, waxing San Marcos CA, Glitz and Glamour Studio FAQ',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.glitzandglamours.com/faq' },
  openGraph: {
    title: 'FAQ | Glitz & Glamour Studio — San Marcos, CA',
    description: 'Common questions about our location, booking, pricing, and beauty services at 935 W San Marcos Blvd, Suite 101, San Marcos, CA.',
    type: 'website',
    url: 'https://www.glitzandglamours.com/faq',
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
