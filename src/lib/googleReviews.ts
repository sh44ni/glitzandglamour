import { prisma } from './prisma';

const PLACE_ID = 'ChIJ3RFOSkV33IARbgQMG_K-XHY';

// Initial verified reviews from Google Maps for Glitz & Glamour Studio
const INITIAL_GOOGLE_REVIEWS = [
    {
        authorName: 'Ruth Quinones',
        rating: 5,
        text: 'First time EVER getting gel-x nails and she did NOT disappoint. Very clean and explained well the whole process since it was my first time. Very detailed on her work. Overall Aura was very nice. Thank you so much for this wonderful experience. Definitely going back!',
        authorImage: 'https://lh3.googleusercontent.com/a/ACg8ocLeUtgaPUaqFO_nKusd5IMXs0E7i2lEuDt5a5sGq6T5XvISgQ=s128-c0x00000000-cc-rp-mo',
        createdAt: new Date('2026-06-16T21:18:40.557Z'),
    },
    {
        authorName: 'Anaid Sumano',
        rating: 5,
        text: 'This was my first time getting my nails done in years and Jojany did the EXACT design I requested. Truly, so shocked to see how incredible my nails came out and how sweet she was throughout the entire appointment. I look forward to dropping in for a fill soon!',
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjXie0t96zl_5CETQ8i1_AvToU8cIEtx3Igs4WtL1KloeNv4ewWW=s128-c0x00000000-cc-rp-mo',
        createdAt: new Date('2026-05-25T01:58:48.407Z'),
    },
    {
        authorName: 'Lilith Jane',
        rating: 5,
        text: 'Jo is the BEST nail tech. I’ve been going to her for quite some time now and I have to say, I genuinely look forward to going in for nail day. I’m never judged on the state of my nails, she’s always down to hear the latest tea ☕, and always makes sure you’re in LOVE with your new set before you leave the salon. She’s incredibly talented in her gelx work and the retention is incredible. I’ve been going on over a month and only lost a nail because my dog ripped it off. The nails last, they’re strong, they’re beautiful, and for a hell of a price too! Book with Jo!!!',
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjVNeROEXyM93HP1XYJGb3m_-UM07WO7b0asaQEx4fyRtXgkZ9UGJQ=s128-c0x00000000-cc-rp-mo',
        createdAt: new Date('2026-04-08T22:09:44.860Z'),
    },
    {
        authorName: 'Evelyn Nunez',
        rating: 5,
        text: 'My girl JoJo ateee downnn with all my sets she has done. She’s such a kinda sweet soul that does amazing in her job. Every time I have gone with her she has always made me feel welcomed and does my nails exactly how I want them!!!',
        authorImage: 'https://lh3.googleusercontent.com/a/ACg8ocLzpdhsTxh04xehaiDh8P5HpfFrZkIUrrhtfTf6w4V9Q1Unlg=s128-c0x00000000-cc-rp-mo',
        createdAt: new Date('2026-04-08T07:15:11.128Z'),
    },
    {
        authorName: 'Meredith Weissberg',
        rating: 5,
        text: "Jojo does an amazing job at all my nail sets! I love my new set she just did and can't stop looking at them. She is super affordable and takes her time with every step! I love getting my nails done by her!",
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjVHlwGbNSO9IFiv9SEMGrrpWjl0KgXJDATn2Lt0Ps5QApo8Qyk=s128-c0x00000000-cc-rp-mo',
        createdAt: new Date('2026-04-07T23:06:08.240Z'),
    },
];

export type FetchedGoogleReview = {
    authorName: string;
    rating: number;
    text: string;
    authorImage: string | null;
    createdAt: Date;
};

/**
 * Calls Google Places API (New) to fetch currently available reviews.
 */
export async function fetchLiveGoogleReviews(): Promise<FetchedGoogleReview[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA1dTHJlk5kx7_kRg8pPb-Tv54eKkXUU6o';
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews&key=${apiKey}`;

    try {
        const res = await fetch(url, {
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'reviews',
            },
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            const errText = await res.text();
            console.warn('[googleReviews] Google Places API warning/status:', res.status, errText);
            return [];
        }

        const data = await res.json();
        if (!data.reviews || !Array.isArray(data.reviews)) return [];

        return data.reviews.map((r: any) => ({
            authorName: r.authorAttribution?.displayName || 'Google User',
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            text: (r.text?.text || r.originalText?.text || '').trim(),
            authorImage: r.authorAttribution?.photoUri || null,
            createdAt: r.publishTime ? new Date(r.publishTime) : new Date(),
        })).filter((r: FetchedGoogleReview) => r.text.length > 0);
    } catch (e) {
        console.warn('[googleReviews] Could not fetch live Google reviews:', e);
        return [];
    }
}

/**
 * Synchronizes Google reviews into the database.
 * Combines live fetched reviews with verified Google reviews, deduplicates,
 * and appends new ones so reviews accumulate over time.
 */
export async function syncGoogleReviewsToDb() {
    let imported = 0;
    let skipped = 0;

    // 1. Fetch live reviews from Google API
    const liveReviews = await fetchLiveGoogleReviews();

    // 2. Combine live reviews with known base reviews
    const pool: FetchedGoogleReview[] = [...liveReviews];

    for (const init of INITIAL_GOOGLE_REVIEWS) {
        const alreadyInPool = pool.some(
            p => p.authorName.toLowerCase() === init.authorName.toLowerCase()
        );
        if (!alreadyInPool) {
            pool.push(init);
        }
    }

    // 3. Upsert into database
    for (const rev of pool) {
        if (!rev.text || !rev.authorName) continue;

        // Check if review from this author already exists under 'google' source
        const existing = await prisma.review.findFirst({
            where: {
                source: 'google',
                authorName: { equals: rev.authorName, mode: 'insensitive' },
            },
        });

        if (existing) {
            skipped++;
            continue;
        }

        await (prisma as any).review.create({
            data: {
                rating: rev.rating,
                text: rev.text,
                source: 'google',
                authorName: rev.authorName,
                authorImage: rev.authorImage,
                createdAt: rev.createdAt,
            },
        });
        imported++;
    }

    const totalInDb = await prisma.review.count({ where: { source: 'google' } });

    return {
        success: true,
        imported,
        skipped,
        total: totalInDb,
        message: `Synced Google reviews: ${imported} new added, ${skipped} already saved (${totalInDb} total Google reviews on website).`,
    };
}

/**
 * Legacy compatibility export used by GET /api/reviews
 */
export async function getGoogleReviews() {
    // Check if we have google reviews in DB; if none, auto-seed them immediately
    const count = await prisma.review.count({ where: { source: 'google' } });
    if (count === 0) {
        try {
            await syncGoogleReviewsToDb();
        } catch (e) {
            console.error('[googleReviews] Initial auto-seed failed:', e);
        }
    }

    const reviews = await (prisma as any).review.findMany({
        where: { source: 'google' },
        orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        source: 'google',
        authorName: r.authorName || 'Google User',
        createdAt: r.createdAt.toISOString ? r.createdAt.toISOString() : String(r.createdAt),
        user: {
            name: r.authorName || 'Google User',
            image: r.authorImage || null,
        },
    }));
}
