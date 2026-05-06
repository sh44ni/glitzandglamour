import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Glitz & Glamour Studio',
  description:
    'Answers to common questions about booking, pricing, cancellations, walk-ins, and services at Glitz & Glamour Studio in Vista, CA.',
  keywords: 'nail salon FAQ Vista CA, beauty salon questions, booking questions, Glitz and Glamour FAQ',
  alternates: { canonical: 'https://glitzandglamours.com/faq' },
  openGraph: {
    title: 'FAQ | Glitz & Glamour Studio',
    description: 'Common questions about booking, pricing, and services at our Vista, CA studio.',
    type: 'website',
    url: 'https://glitzandglamours.com/faq',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What types of nail services do you offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer gel-X, acrylic sets, dip powder, gel polish, classic manicures, and custom nail art designs.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long do gel-X or acrylic nails last?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gel-X nails typically last 3–4 weeks, while acrylic sets can last 2–3 weeks before needing a fill.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bring my own nail design or reference photo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! We love bringing your ideas to life. Feel free to bring reference photos to your appointment.',
      },
    },
    {
      '@type': 'Question',
      name: 'What hair services are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer haircuts, balayage, highlights, full color, blowouts, deep conditioning treatments, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you do hair color consultations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We recommend a consultation for major color changes so we can discuss your goals, timeline, and pricing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What waxing services do you provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer full-body waxing including eyebrows, lip, chin, underarms, arms, legs, bikini, and Brazilian wax.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I prepare for a waxing appointment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hair should be at least ¼ inch long. Avoid sun exposure, retinoids, and exfoliating 24 hours before your appointment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is waxing suitable for sensitive skin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we use gentle, high-quality wax suitable for sensitive skin. Let us know about any allergies or skin conditions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of lash services do you offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer classic lash extensions, volume lashes, hybrid sets, lash lifts, and lash tinting.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long do lash extensions last?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lash extensions typically last 2–3 weeks before needing a fill, depending on your natural lash cycle.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I care for my lash extensions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avoid oil-based products around the eyes, don\'t rub your eyes, and brush them gently with a spoolie daily.',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://glitzandglamours.com/faq' },
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
