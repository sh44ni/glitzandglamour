import { prisma } from './prisma';

export interface RealReviewItem {
  id: string;
  author: string;
  quote: string;
  rating: number;
  serviceTag: string;
  source: 'Google Verified Review' | 'Setmore Verified' | 'Verified Client';
  createdAt?: Date | string;
}

/**
 * Built-in high-fidelity verified fallback pool (from our 120+ Setmore and Google reviews).
 * Guarantees that even during cold builds or offline DB maintenance, every page receives
 * 100% authentic, real client quotes.
 */
export const VERIFIED_FALLBACK_REVIEWS: RealReviewItem[] = [
  {
    id: 'rev-rosita',
    author: 'Rosita M.',
    quote: 'My girl was AMAZING! I booked Jojany for both makeup and hair... I was blown away by her professionalism and warm personality. I requested a soft glam look, and she nailed it! My makeup was flawless, and my hair was absolutely on point. I received so many compliments at the wedding I attended. Highly recommend her services!',
    rating: 5,
    serviceTag: 'Wedding Hair & Soft Glam Makeup',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-cheyanne',
    author: 'Cheyanne Jauregui',
    quote: 'She did an AMAZING job. I asked for an updo and glam and she delivered. Not only is her skill set incredible, she is so sociable and enjoyable. She answered all my questions. Def rec female Marines to book her for your makeup and updos for the ball, or any complex updo!',
    rating: 5,
    serviceTag: 'Updo & Event Glam Makeup',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-auie',
    author: 'Auie Gunn',
    quote: 'I had the absolute pleasure of working with Jojany and I couldn\'t be happier with the results! She made me feel so confident and radiant for my special event. The makeup was flawless and complemented my dress perfectly. It lasted all night without smudging or fading, even with all the dancing and photos!',
    rating: 5,
    serviceTag: 'Special Event & Gala Glam',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-hope',
    author: 'Hope Holt',
    quote: 'Jojany did an absolutely amazing job on my hair and makeup for the Marine Ball! She made me feel so beautiful and confident, and her work held up perfectly all night. On top of that, she was kind enough to fit me in last minute, which I appreciated more than I can say. Couldn\'t have asked for a better experience!',
    rating: 5,
    serviceTag: 'Hair & Makeup Styling',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-janeya',
    author: 'Janeya Avelar',
    quote: 'Absolutely loved my hair and makeup for my husband\'s ball. She is amazing and so sweet love her aura and the vibes she brings. Highly recommend her and will be booking with her for any occasion.',
    rating: 5,
    serviceTag: 'Hair & Makeup Glam',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-danna',
    author: 'Danna Waddington',
    quote: 'I am so happy with the services done by Jojany, she did a beautiful job at doing my makeup and has such a light hand with makeup and hair. I was surprised when she handed me the mirror because it was already so stunning. I love her energy and she was easy to talk to.',
    rating: 5,
    serviceTag: 'Special Event Makeup & Hair',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-dee',
    author: 'Dee',
    quote: 'I had such a great experience with Jojo! She accommodated me last minute the same day, which I really appreciated. You can truly tell how passionate she is about her work. She listened to exactly what I wanted and delivered perfectly. I left feeling beautiful, confident, and refreshed!',
    rating: 5,
    serviceTag: 'Hair Styling & Cut',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-maria-b',
    author: 'Maria Bonilla',
    quote: 'Jojo did a phenomenal job doing my new hair transformation! I got a beautiful balayage hair color and I\'m so obsessed and happy with it! Best stylist with great ethic and skills.',
    rating: 5,
    serviceTag: 'Balayage & Hair Transformation',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-jennifer-p',
    author: 'Jennifer Pope',
    quote: 'Jojo was absolutely fabulous and gave the best service. She took time to adequately prep and took my inspo and gave me something even better! Great vibes and even better service!',
    rating: 5,
    serviceTag: 'Gel-X Extensions & Art',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-ruth-q',
    author: 'Ruth Quinones',
    quote: 'Very clean and explained well the whole process since it was my first time. Very detailed on her work. Overall aura was very nice. Thank you so much for this wonderful experience. Definitely going back!',
    rating: 5,
    serviceTag: 'Precision Beauty & Nails',
    source: 'Google Verified Review',
  },
  {
    id: 'rev-lilith-j',
    author: 'Lilith Jane',
    quote: 'Jo is the BEST. Incredibly talented, retention is incredible. She always makes sure you\'re in LOVE with your look before leaving the studio. Strong, beautiful work and great prices! Book with Jo!',
    rating: 5,
    serviceTag: 'Custom Nails & Beauty Care',
    source: 'Google Verified Review',
  },
  {
    id: 'rev-fatima-m',
    author: 'Fatima Magana',
    quote: 'A gem! Super sweet and accommodating from the start. When we talked about my hair goals she was super knowledgeable and honest. It can be hard to find a skilled stylist who truly loves her job AND has such accessible pricing. Book that appointment!',
    rating: 5,
    serviceTag: 'Haircut & Luxury Blowout',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-hailey-l',
    author: 'Hailey Love',
    quote: 'I loved working with Jojany! She made me feel so comfortable and did an amazing job on my 3-in-1 appointment for acrylic manicure, gel pedicure, and wax. I definitely recommend!',
    rating: 5,
    serviceTag: 'Full Spa & Beauty Package',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-diana-e',
    author: 'Diana Escatel',
    quote: 'Me encantó el servicio. Desde que llegué me atendieron súper bien y fue muy cuidadosa y detallista, se tomó su tiempo para que todo quedara perfecto. Definitivamente volveré y la recomiendo mucho.',
    rating: 5,
    serviceTag: 'Detailed Nail Art & Beauty',
    source: 'Setmore Verified',
  },
  {
    id: 'rev-kaitlyn-l',
    author: 'Kaitlyn Leiva',
    quote: 'Good vibes, good conversation, and amazing services. Her cutting my hair has given me so much confidence. I actually style my hair now and do so much with it! She is always so amazing with changing designs on the fly. Definitely worth it.',
    rating: 5,
    serviceTag: 'Hair Styling & Extensions',
    source: 'Setmore Verified',
  }
];

/**
 * Fetches all reviews dynamically from the database (which receives auto-syncs from Setmore & Google),
 * seamlessly falling back to VERIFIED_FALLBACK_REVIEWS if DB query fails or returns empty.
 */
export async function getDynamicRealReviews(): Promise<RealReviewItem[]> {
  try {
    const dbReviews = await prisma.review.findMany({
      where: { rating: { gte: 4 } }, // All our reviews are 5-star
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        authorName: true,
        text: true,
        rating: true,
        source: true,
        createdAt: true,
        user: { select: { name: true } },
        booking: { select: { service: { select: { name: true } } } },
      },
    });

    if (dbReviews && dbReviews.length > 0) {
      return dbReviews.map((r) => {
        const author = r.authorName || r.user?.name || 'Verified Client';
        const serviceTag = r.booking?.service?.name || determineServiceTag(r.text);
        let sourceTag: RealReviewItem['source'] = 'Verified Client';
        if (r.source === 'google') sourceTag = 'Google Verified Review';
        else if (r.source === 'setmore') sourceTag = 'Setmore Verified';

        return {
          id: r.id,
          author,
          quote: r.text,
          rating: r.rating || 5,
          serviceTag,
          source: sourceTag,
          createdAt: r.createdAt,
        };
      });
    }
  } catch (error) {
    console.warn('[getDynamicRealReviews] Using verified fallback reviews cache:', error);
  }

  return VERIFIED_FALLBACK_REVIEWS;
}

/**
 * Infers an appropriate service tag from review text if not linked to a specific booking.
 */
function determineServiceTag(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('wedding') || lower.includes('bride') || lower.includes('bridal')) {
    return 'Bridal Hair & Makeup';
  }
  if (lower.includes('ball') || lower.includes('updo') || lower.includes('glam')) {
    return 'Event Updo & Glam Makeup';
  }
  if (lower.includes('balayage') || lower.includes('hair') || lower.includes('color') || lower.includes('blowout')) {
    return 'Hair Styling & Color';
  }
  if (lower.includes('nail') || lower.includes('gel') || lower.includes('acrylic')) {
    return 'Gel-X & Custom Nails';
  }
  if (lower.includes('facial') || lower.includes('skin')) {
    return 'Facial & Skincare';
  }
  return 'Beauty & Styling Client';
}

/**
 * Deterministic pseudo-random number generator using string seed.
 * Ensures consistent output between Next.js SSR and client hydration.
 */
function seededHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Filters and selects relevant reviews for a specific page:
 * 1. Checks review text & service tags against page keywords and city name.
 * 2. If keywords match, orders by relevance score.
 * 3. FALLBACK GUARANTEE: If keywords don't match or fewer than `limit` reviews match,
 *    it gracefully pulls from the remaining 5-star real reviews pool.
 * 4. Rotates deterministically using the page slug so every page displays 2 unique, fresh reviews.
 */
export function getFilteredRealReviews({
  allReviews,
  slug,
  keywords = [],
  city,
  limit = 2,
}: {
  allReviews: RealReviewItem[];
  slug: string;
  keywords?: string[];
  city?: string;
  limit?: number;
}): RealReviewItem[] {
  const pool = allReviews.length > 0 ? allReviews : VERIFIED_FALLBACK_REVIEWS;

  // Normalize search terms
  const searchTerms = [
    ...(city ? [city.toLowerCase()] : []),
    ...keywords.map((k) => k.toLowerCase()),
    // Default bridal / beauty context
    'wedding',
    'bride',
    'bridal',
    'makeup',
    'hair',
    'glam',
    'updo',
  ];

  // Score each review
  const scored = pool.map((rev) => {
    const textLower = rev.quote.toLowerCase();
    const tagLower = rev.serviceTag.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      if (term.length > 2) {
        if (textLower.includes(term)) score += 3;
        if (tagLower.includes(term)) score += 2;
      }
    }

    return { rev, score };
  });

  // Separate matches and non-matches
  const matched = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  const remaining = scored.filter((item) => item.score === 0);

  // Deterministic shuffle seed based on page slug
  const seed = seededHash(slug || 'default');

  const result: RealReviewItem[] = [];
  const pickedIds = new Set<string>();

  // 1. Pick from matched reviews first with seeded offset
  if (matched.length > 0) {
    const startIdx = seed % matched.length;
    for (let i = 0; i < matched.length && result.length < limit; i++) {
      const candidate = matched[(startIdx + i) % matched.length].rev;
      if (!pickedIds.has(candidate.id)) {
        pickedIds.add(candidate.id);
        result.push(candidate);
      }
    }
  }

  // 2. FALLBACK GUARANTEE: If keywords didn't exist or didn't yield enough matches,
  // pull from remaining 5-star reviews
  if (result.length < limit) {
    const fallbackList = remaining.length > 0 ? remaining : scored;
    const fallbackStart = (seed * 3) % fallbackList.length;
    for (let i = 0; i < fallbackList.length && result.length < limit; i++) {
      const candidate = fallbackList[(fallbackStart + i) % fallbackList.length].rev;
      if (!pickedIds.has(candidate.id)) {
        pickedIds.add(candidate.id);
        result.push(candidate);
      }
    }
  }

  return result.slice(0, limit);
}
