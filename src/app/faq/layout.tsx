import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Glitz & Glamour Studio San Marcos CA',
  description:
    'Find answers about our new San Marcos location (935 W San Marcos Blvd), booking, hours, parking, payments, nail services, balayage, waxing, facials, and lash extensions in North County San Diego.',
  keywords: 'nail salon San Marcos CA, beauty salon San Marcos, hair salon San Marcos CA, where is Glitz and Glamour located, nail salon Vista CA, acrylic nails San Marcos, balayage San Marcos, waxing San Marcos CA, Glitz and Glamour Studio FAQ',
  alternates: { canonical: 'https://glitzandglamours.com/faq' },
  openGraph: {
    title: 'FAQ | Glitz & Glamour Studio — San Marcos, CA',
    description: 'Common questions about our location, booking, pricing, and beauty services at 935 W San Marcos Blvd, Suite 101, San Marcos, CA.',
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
      name: 'Where is Glitz & Glamour Studio located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Glitz & Glamour Studio is located at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 in North County San Diego. (Please note: We have moved from our previous Vista location and now exclusively serve clients at our San Marcos studio).',
      },
    },
    {
      '@type': 'Question',
      name: 'What areas in North County San Diego do you serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We welcome clients from San Marcos, Vista, Carlsbad, Oceanside, Escondido, Encinitas, San Elijo Hills, and all across North County San Diego.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are your business hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are open Monday through Friday from 9:00 AM to 6:00 PM, and Saturday from 9:00 AM to 4:00 PM (closed Sundays). Services are by appointment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is parking available at the studio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Convenient and free on-site parking is available directly in front of the building at 935 W San Marcos Blvd, Suite 101.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you accept walk-ins or is an appointment required?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We operate primarily by appointment to ensure personalized one-on-one attention for every client. You can easily book online 24/7 on our website or contact us to check same-day availability.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept Cash, Venmo, Zelle, Cash App, Apple Pay, and all major Credit/Debit Cards via Stripe.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the Hello Kitty Loyalty Card work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Collect a digital stamp on every visit! After 10 stamps, you unlock a free spin at our prize wheel (redeemable in person) for discounts and complimentary beauty treats. You can also add your card directly to Apple Wallet or Google Wallet.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your cancellation and late arrival policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We kindly request at least 24 hours advance notice for any cancellations or reschedules. If you are running late, please text or call us as soon as possible so we can best accommodate your service.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Gel & Acrylic nails?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gel polish is cured under a UV/LED lamp and can last 2–3 weeks with a glossy finish. Acrylics are an extension applied over your natural nail for added length and strength, and are great if you want a dramatic look or struggle with nail growth.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you do custom character nail art and 3D designs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We specialize in custom character nail art (including Hello Kitty and anime designs), French tips, chrome finishes, encapsulation, rhinestones, and trendy 3D charms. You can even upload your inspiration photos directly when booking online!',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer balayage, highlights, and custom hair color?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we offer full custom hair coloring services including balayage, lived-in blonding, highlights, lowlights, root touch-ups, gloss/toner refreshers, and creative fashion colors tailored to your skin tone and lifestyle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I book hair and makeup for weddings, quinceañeras, or special events?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! We provide specialized bridal, quinceañera, prom, and special event glam packages (both in-studio and on-location throughout San Diego County). Digital contracts and trials are available.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I prepare for a waxing appointment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hair should be at least ¼ inch long (about the size of a grain of rice). Avoid sun exposure, retinoids, and exfoliating 24–48 hours before your appointment. You must be off Accutane for at least 6 months.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I prepare for my lash extension appointment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Please arrive completely makeup-free around the eye area. Do not wear mascara, eyeliner, or use heavy oil-based eye creams prior to your appointment.',
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
