export type ServiceCategory =
  | 'nails'
  | 'pedicures'
  | 'haircolor'
  | 'haircuts'
  | 'waxing'
  | 'facials'
  | string;

export type ServiceContent = {
  headline?: string;
  descriptionParagraphs: string[];
  includedBullets: string[];
  faqs: { q: string; a: string }[];
};

function commonFaqs(): { q: string; a: string }[] {
  return [
    {
      q: 'Do you take walk-ins?',
      a: 'We’re primarily by appointment to protect quality and timing. If you need something last-minute, you can still check availability in the booking page.',
    },
    {
      q: 'How do I know the exact price?',
      a: 'Prices shown are starting points. Final pricing is confirmed in person before your appointment begins based on length, design, and any add-ons.',
    },
    {
      q: 'Where are you located?',
      a: 'Glitz & Glamour Studio is based in Vista, CA and serves North County (northern San Diego County) and nearby areas.',
    },
  ];
}

export function getServiceContent(category: ServiceCategory): ServiceContent {
  switch (category) {
    case 'nails':
      return {
        headline: 'Premium nails, built to last.',
        descriptionParagraphs: [
          'If you want nails that look clean, luxe, and photo-ready, you’re in the right place. We focus on precision shaping, durable wear, and a flawless finish — whether you want something soft and natural or bold and glam.',
          'Every set starts with thoughtful prep and a design consult. We’ll match the vibe you want, recommend the right base for your lifestyle, and keep the final look balanced and flattering for your hands.',
        ],
        includedBullets: [
          'Consult + inspo matching',
          'Professional prep for better retention',
          'Shaping + structure for durability',
          'Glossy finish and cuticle detail work',
        ],
        faqs: [
          {
            q: 'How long will my nails last?',
            a: 'Most clients get strong wear for 2–4 weeks depending on lifestyle, length, and maintenance. Proper aftercare helps a lot.',
          },
          {
            q: 'Can you match a reference photo?',
            a: 'Yes — bring a few inspo pics. We’ll match the look as closely as possible and adjust for what works best for your nail shape/length.',
          },
          {
            q: 'Do you do repairs?',
            a: 'If something breaks or lifts, we can usually repair it. Timing and cost depend on the issue — just message us or book a quick fix.',
          },
          ...commonFaqs(),
        ],
      };

    case 'pedicures':
      return {
        headline: 'Soft feet, clean finish, real relaxation.',
        descriptionParagraphs: [
          'Our pedicures are designed to feel like a reset: exfoliation, smoothing, hydration, and a polished look that lasts. It’s equal parts self-care and a clean, elevated finish.',
          'We keep everything sanitary and comfortable, and we’ll tailor the experience to what your feet need — from dry skin to extra hydration.',
        ],
        includedBullets: [
          'Soak + nail care + shaping',
          'Cuticle cleanup',
          'Exfoliation + smoothing',
          'Hydration finish + polish',
        ],
        faqs: [
          {
            q: 'Can I get gel on my toes?',
            a: 'If gel is available for your service, we can do it. Select your preferred option when booking or add a note.',
          },
          {
            q: 'Do you help with dry heels?',
            a: 'Yes — we focus on smoothing and hydration. For severe cracking, we’ll recommend a follow-up routine for best results.',
          },
          ...commonFaqs(),
        ],
      };

    case 'haircolor':
      return {
        headline: 'Lived-in color that looks expensive.',
        descriptionParagraphs: [
          'From balayage to dimension and tone refreshes, we focus on color that grows out beautifully and complements your skin tone. The goal is shine, dimension, and a seamless blend.',
          'We’ll talk through your inspo, hair history, and maintenance comfort level so you get a result that’s both gorgeous and realistic for your routine.',
        ],
        includedBullets: [
          'Consult + inspo matching',
          'Sectioning + blend for dimension',
          'Toning for shine and balance',
          'Finish style so you can see the full result',
        ],
        faqs: [
          {
            q: 'How long does balayage take?',
            a: 'Timing varies by length/density and desired brightness. We’ll confirm timing when we review your goals.',
          },
          {
            q: 'Will my hair be damaged?',
            a: 'We prioritize hair integrity. Results depend on hair history, but we use techniques and timing that protect the hair as much as possible.',
          },
          ...commonFaqs(),
        ],
      };

    case 'haircuts':
      return {
        headline: 'A cut that frames you perfectly.',
        descriptionParagraphs: [
          'A great haircut should feel effortless: clean lines, flattering shape, and movement that matches your vibe. We’ll tailor the cut to your face shape, texture, and styling habits.',
          'If you want a refresh, a big change, or a consistent signature look, we’ll make sure you leave feeling confident.',
        ],
        includedBullets: [
          'Consult + hair goals',
          'Precision cut + shaping',
          'Optional blowout/finish',
          'Tips for easy at-home styling',
        ],
        faqs: [
          {
            q: 'Can you help me choose a style?',
            a: 'Yes. Bring inspo or describe what you want, and we’ll recommend a shape that works for your face and hair texture.',
          },
          ...commonFaqs(),
        ],
      };

    case 'waxing':
      return {
        headline: 'Smooth skin, clean technique.',
        descriptionParagraphs: [
          'We keep waxing quick, clean, and comfortable with professional technique and attention to detail. The goal is smooth results with minimal irritation.',
          'If you’re new to waxing, we’ll walk you through what to expect and aftercare so your skin stays calm.',
        ],
        includedBullets: [
          'Skin prep and clean removal',
          'Detailing for a crisp finish',
          'Aftercare guidance to reduce irritation',
        ],
        faqs: [
          {
            q: 'How long does waxing last?',
            a: 'Most clients stay smooth for 3–4 weeks. Consistency helps hair grow back finer over time.',
          },
          {
            q: 'Can I wax if I use retinol?',
            a: 'Retinoids can make skin more sensitive. Please mention it when booking — we may recommend pausing certain products before waxing.',
          },
          ...commonFaqs(),
        ],
      };

    case 'facials':
      return {
        headline: 'Glow, clarity, and skin that feels clean.',
        descriptionParagraphs: [
          'Our facials focus on deep cleansing, hydration, and a healthy glow. We tailor the steps to your skin goals — whether that’s congestion, dryness, texture, or overall maintenance.',
          'You’ll leave with calmer, brighter skin and a simple aftercare plan to help results last.',
        ],
        includedBullets: [
          'Cleanse + gentle exfoliation',
          'Optional extractions (as appropriate)',
          'Mask + hydration finish',
          'Aftercare recommendations',
        ],
        faqs: [
          {
            q: 'Will extractions hurt?',
            a: 'We keep it gentle and only do what makes sense for your skin. Comfort matters — we’ll communicate throughout.',
          },
          {
            q: 'How often should I get a facial?',
            a: 'Most clients benefit from every 4–6 weeks depending on goals and skin type.',
          },
          ...commonFaqs(),
        ],
      };

    default:
      return {
        headline: 'Premium beauty service in Vista, CA.',
        descriptionParagraphs: [
          'This service is designed for polished, confidence-boosting results with professional technique and attention to detail.',
          'Book your appointment and we’ll confirm the details and finalize pricing in person.',
        ],
        includedBullets: ['Consult + personalized recommendations', 'Professional technique + clean finish'],
        faqs: commonFaqs(),
      };
  }
}

