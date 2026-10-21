import { prisma } from './prisma';

const PLACE_ID = 'ChIJ3RFOSkV33IARbgQMG_K-XHY';
const GOOGLE_MAPS_PLACE_URL =
    'https://www.google.com/maps/place/Glitz+%26+Glamour+Studio/data=!4m2!3m1!1s0x80dc77454a4e11dd:0x765cbef21b0c046e?hl=en&gl=us';

export const SETMORE_BASE_REVIEW_COUNT = 116;
export const FALLBACK_GOOGLE_REVIEW_COUNT = 51;

// Verified Google Maps reviews for Glitz & Glamour Studio
export const INITIAL_GOOGLE_REVIEWS = [
    {
        authorName: 'C. Hernandez',
        rating: 5,
        text: 'A true professional and master of her craft. I immediately felt comfortable and knew I was in good hands. I loved my haircut! It was better than I expected could be done with my thinning hair. And I left feeling much more confident after her guidance on styling my realistically manageable cut.',
        authorImage: 'https://lh3.googleusercontent.com/a/ACg8ocIdk2FGhr0ujmr0cJsQX3Hzl3lXAc9lDky26qwQOYsD4J-B0Q=s120-c-rp-mo-br100',
        createdAt: new Date('2026-10-19T05:30:56.204Z'),
    },
    {
        authorName: 'RO Escobar',
        rating: 5,
        text: 'I had my first appointment with Jojany on Monday, and I absolutely LOVE my hair! From the moment I arrived, she made me feel so comfortable, and her salon is super cute and stylish. It was my first time meeting her, but I felt completely at ease trusting her with such a big change—and she delivered! It’s only been two days, and I can’t stop admiring my hair or getting compliments! She truly knows what she’s doing. I also really appreciate how flexible she was with rescheduling and working around my schedule. If you’re looking for a change and want someone who makes you feel comfortable and confident, I highly recommend Jojany. She is absolutely worth the drive, and I’m so happy I found her!',
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjUobTp5YAIxYB3OSEKcds2DeBFpNNwCFqu7lbDzJvY4vMB0vlDg=s120-c-rp-mo-ba12-br100',
        createdAt: new Date('2026-10-14T04:31:57.186Z'),
    },
    {
        authorName: 'elizabeth ponce',
        rating: 5,
        text: 'i was able to get squeezed in last minute and im in love with my haircut!! very friendly service and good communication.',
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjXUEiv9NWjW0zkpsag0ZHZsy8kg8Ny4xmTS-B3-N_PRC0S1WhZg=s120-c-rp-mo-br100',
        createdAt: new Date('2026-10-12T20:02:06.204Z'),
    },
    {
        authorName: 'Delphine Egler',
        rating: 5,
        text: 'Thank you Jojo you did an amazing job! I love my new nails!',
        authorImage: 'https://lh3.googleusercontent.com/a/ACg8ocLwUwK13h0SiY6ruPTOWnM-QRT8VJJl6ZmzGmDD94G9pv2xiw=s120-c-rp-mo-br100',
        createdAt: new Date('2026-10-01T16:03:59.105Z'),
    },
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
        text: 'Jo is the BEST nail tech. I’ve been going to her for quite some time now and I have to say, I genuinely look forward to going in for nail day. I’m never judged on the state of my nails, she’s always down to hear the latest tea, and always makes sure you’re in LOVE with your new set before you leave the salon. She’s incredibly talented in her gelx work and the retention is incredible. I’ve been going on over a month and only lost a nail because my dog ripped it off. The nails last, they’re strong, they’re beautiful, and for a hell of a price too! Book with Jo!!!',
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
        authorName: 'Diana Ortiz',
        rating: 5,
        text: 'I love my nail sets that I get done by jojo! She always does so much better than the inspo!!! I am so indecisive all the time and she always makes my vision come true despite the indecisiveness! She did an amazing job on my hair as well, I went from brown highlights to honey blonde!',
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjW2C8c4f0KAk4AfJ207dfZ_QM2_gBWjDvW5A65PY2JeckA3T38=s120-c-rp-mo-br100',
        createdAt: new Date('2026-04-08T01:15:27.291Z'),
    },
    {
        authorName: 'Meredith Weissberg',
        rating: 5,
        text: "Jojo does an amazing job at all my nail sets! I love my new set she just did and can't stop looking at them. She is super affordable and takes her time with every step! I love getting my nails done by her!",
        authorImage: 'https://lh3.googleusercontent.com/a-/ALV-UjVHlwGbNSO9IFiv9SEMGrrpWjl0KgXJDATn2Lt0Ps5QApo8Qyk=s128-c0x00000000-cc-rp-mo',
        createdAt: new Date('2026-04-07T23:06:08.240Z'),
    },
];

// Verified Setmore reviews for Glitz & Glamour Studio (seeded so DB always has Setmore reviews even if Setmore rate-limits scraping)
export const INITIAL_SETMORE_REVIEWS = [
    {
        authorName: 'Rosita M.',
        rating: 5,
        text: 'My girl was AMAZING! I booked Jojany for both makeup and hair... I was blown away by her professionalism and warm personality. I requested a soft glam look, and she nailed it! My makeup was flawless, and my hair was absolutely on point. I received so many compliments at the wedding I attended. Highly recommend her services!',
        createdAt: new Date('2026-03-14T18:00:00.000Z'),
    },
    {
        authorName: 'Cheyanne Jauregui',
        rating: 5,
        text: 'She did an AMAZING job. I asked for an updo and glam and she delivered. Not only is her skill set incredible, she is so sociable and enjoyable. She answered all my questions. Def rec female Marines to book her for your makeup and updos for the ball, or any complex updo!',
        createdAt: new Date('2026-03-08T18:00:00.000Z'),
    },
    {
        authorName: 'Auie Gunn',
        rating: 5,
        text: "I had the absolute pleasure of working with Jojany and I couldn't be happier with the results! She made me feel so confident and radiant for my special event. The makeup was flawless and complemented my dress perfectly. It lasted all night without smudging or fading, even with all the dancing and photos!",
        createdAt: new Date('2026-03-03T18:00:00.000Z'),
    },
    {
        authorName: 'Hope Holt',
        rating: 5,
        text: "Jojany did an absolutely amazing job on my hair and makeup for the Marine Ball! She made me feel so beautiful and confident, and her work held up perfectly all night. On top of that, she was kind enough to fit me in last minute, which I appreciated more than I can say. Couldn't have asked for a better experience!",
        createdAt: new Date('2026-02-24T18:00:00.000Z'),
    },
    {
        authorName: 'Janeya Avelar',
        rating: 5,
        text: "Absolutely loved my hair and makeup for my husband's ball. She is amazing and so sweet love her aura and the vibes she brings. Highly recommend her and will be booking with her for any occasion.",
        createdAt: new Date('2026-02-19T18:00:00.000Z'),
    },
    {
        authorName: 'Danna Waddington',
        rating: 5,
        text: 'I am so happy with the services done by Jojany, she did a beautiful job at doing my makeup and has such a light hand with makeup and hair. I was surprised when she handed me the mirror because it was already so stunning. I love her energy and she was easy to talk to.',
        createdAt: new Date('2026-02-14T18:00:00.000Z'),
    },
    {
        authorName: 'Dee',
        rating: 5,
        text: 'I had such a great experience with Jojo! She accommodated me last minute the same day, which I really appreciated. You can truly tell how passionate she is about her work. She listened to exactly what I wanted and delivered perfectly. I left feeling beautiful, confident, and refreshed!',
        createdAt: new Date('2026-02-09T18:00:00.000Z'),
    },
    {
        authorName: 'Maria Bonilla',
        rating: 5,
        text: "Jojo did a phenomenal job doing my new hair transformation! I got a beautiful balayage hair color and I'm so obsessed and happy with it! Best stylist with great ethic and skills.",
        createdAt: new Date('2026-02-04T18:00:00.000Z'),
    },
    {
        authorName: 'Jennifer Pope',
        rating: 5,
        text: 'Jojo was absolutely fabulous and gave the best service. She took time to adequately prep and took my inspo and gave me something even better! Great vibes and even better service!',
        createdAt: new Date('2026-01-28T18:00:00.000Z'),
    },
    {
        authorName: 'Fatima Magana',
        rating: 5,
        text: 'A gem! Super sweet and accommodating from the start. When we talked about my hair goals she was super knowledgeable and honest. It can be hard to find a skilled stylist who truly loves her job AND has such accessible pricing. Book that appointment!',
        createdAt: new Date('2026-01-20T18:00:00.000Z'),
    },
    {
        authorName: 'Hailey Love',
        rating: 5,
        text: 'I loved working with Jojany! She made me feel so comfortable and did an amazing job on my 3-in-1 appointment for acrylic manicure, gel pedicure, and wax. I definitely recommend!',
        createdAt: new Date('2026-01-12T18:00:00.000Z'),
    },
    {
        authorName: 'Diana Escatel',
        rating: 5,
        text: 'Me encantó el servicio. Desde que llegué me atendieron súper bien y fue muy cuidadosa y detallista, se tomó su tiempo para que todo quedara perfecto. Definitivamente volveré y la recomiendo mucho.',
        createdAt: new Date('2026-01-05T18:00:00.000Z'),
    },
    {
        authorName: 'Kaitlyn Leiva',
        rating: 5,
        text: 'Good vibes, good conversation, and amazing services. Her cutting my hair has given me so much confidence. I actually style my hair now and do so much with it! She is always so amazing with changing designs on the fly. Definitely worth it.',
        createdAt: new Date('2025-12-26T18:00:00.000Z'),
    },
    {
        authorName: 'Guadalupe Lopez',
        rating: 5,
        text: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!',
        createdAt: new Date('2025-11-18T18:00:00.000Z'),
    },
    {
        authorName: 'Yesenia Sanchez',
        rating: 5,
        text: 'So kind and welcoming! Her hair work is absolutely stunning. She really listens to what you want and delivers beyond expectations. Love this studio!',
        createdAt: new Date('2025-11-10T18:00:00.000Z'),
    },
    {
        authorName: 'Kaylee',
        rating: 5,
        text: "She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won't go anywhere else!",
        createdAt: new Date('2025-10-25T18:00:00.000Z'),
    },
    {
        authorName: 'Janet D',
        rating: 5,
        text: 'Total vibe, she never disappoints! Every single visit is better than the last. The studio atmosphere is amazing and her work is always flawless.',
        createdAt: new Date('2025-10-18T18:00:00.000Z'),
    },
    {
        authorName: 'Gloria Jimenez',
        rating: 5,
        text: 'She goes above and beyond every time! JoJany truly cares about her clients and it shows in her work. My nails have never looked this good!',
        createdAt: new Date('2025-10-11T18:00:00.000Z'),
    },
    {
        authorName: 'Daniela Castillo',
        rating: 5,
        text: '¡Excelente trabajo y muy carismática! Hace que te sientas como en casa. Su trabajo es de primera calidad y siempre sale uno feliz. 100% recomendada.',
        createdAt: new Date('2025-10-04T18:00:00.000Z'),
    },
    {
        authorName: 'Olivia Tate',
        rating: 5,
        text: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!',
        createdAt: new Date('2025-09-24T18:00:00.000Z'),
    },
    {
        authorName: 'Maryjane Munoz',
        rating: 5,
        text: 'Amazing work and amazing energy! JoJany makes every appointment so fun and relaxing. You can tell she genuinely loves what she does. Best in the area!',
        createdAt: new Date('2025-09-16T18:00:00.000Z'),
    },
    {
        authorName: 'Anel Brito Ramirez',
        rating: 5,
        text: '¡Excelente servicio! Muy profesional y atenta a los detalles. Mis uñas quedaron increíbles y el ambiente del estudio es muy acogedor. La recomiendo ampliamente.',
        createdAt: new Date('2025-09-09T18:00:00.000Z'),
    },
    {
        authorName: 'Yajaira Dominguez',
        rating: 5,
        text: 'She gave me the most perfect layered cut! JoJany really understands hair and knows exactly what will look best for your face shape. Obsessed with my hair!',
        createdAt: new Date('2025-09-02T18:00:00.000Z'),
    },
];

export type FetchedGoogleReview = {
    authorName: string;
    rating: number;
    text: string;
    authorImage: string | null;
    createdAt: Date;
};

export interface LiveGoogleData {
    reviews: FetchedGoogleReview[];
    totalGoogleCount: number;
    rating: number;
}

const gState = globalThis as unknown as {
    __glitzGoogleTotalCount?: number;
    __glitzLastReviewSyncAt?: number;
    __glitzReviewSyncInFlight?: Promise<any>;
};

/**
 * Fetches live Google reviews (both Most Relevant and Newest 5) AND the live total review count
 * directly from Google Maps' public place feed, with fallback/supplement from Google Places API (New).
 */
export async function fetchLiveGoogleReviewsAndCount(): Promise<LiveGoogleData> {
    const collected: FetchedGoogleReview[] = [];
    let totalGoogleCount = gState.__glitzGoogleTotalCount || FALLBACK_GOOGLE_REVIEW_COUNT;
    let rating = 5.0;

    // 1. Direct fetch from Google Maps public place feed (Sort 1 = Most Relevant, Sort 2 = Newest)
    try {
        const ua =
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
        const placeHtmlRes = await fetch(GOOGLE_MAPS_PLACE_URL, {
            headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
            next: { revalidate: 0 },
        });

        if (placeHtmlRes.ok) {
            const html = await placeHtmlRes.text();
            const match = html.match(/href="(\/maps\/preview\/place[^"]+)"/);
            if (match?.[1]) {
                const baseUrl = 'https://www.google.com' + match[1].replace(/&amp;/g, '&');

                for (const sortCode of ['2', '1']) {
                    const previewUrl = baseUrl.replace('%216m1%211e1', `%216m1%211e${sortCode}`);
                    const previewRes = await fetch(previewUrl, {
                        headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
                        next: { revalidate: 0 },
                    });
                    if (!previewRes.ok) continue;

                    const rawText = (await previewRes.text()).replace(/^\)\]\}'\s*/, '');
                    const parsed = JSON.parse(rawText);

                    const liveCount = Number(parsed?.[6]?.[4]?.[8]);
                    if (Number.isFinite(liveCount) && liveCount > 0) {
                        totalGoogleCount = Math.max(totalGoogleCount, liveCount);
                    }
                    const liveRating = Number(parsed?.[6]?.[4]?.[7]);
                    if (Number.isFinite(liveRating) && liveRating > 0) {
                        rating = liveRating;
                    }

                    const rawRevs = parsed?.[6]?.[175]?.[9]?.[0]?.[0];
                    if (Array.isArray(rawRevs)) {
                        for (const entry of rawRevs) {
                            const item = entry?.[0];
                            if (!item) continue;
                            const authorName = String(item?.[1]?.[4]?.[5]?.[0] || '').trim();
                            const authorImage = item?.[1]?.[4]?.[5]?.[1] ? String(item[1][4][5][1]) : null;
                            const timestampUs = Number(item?.[1]?.[2]);
                            const createdAt =
                                Number.isFinite(timestampUs) && timestampUs > 0
                                    ? new Date(Math.floor(timestampUs / 1000))
                                    : new Date();
                            const revRating = Math.min(5, Math.max(1, Number(item?.[2]?.[0]?.[0]) || 5));
                            const rawReviewText = String(item?.[2]?.[15]?.[0]?.[0] || '').trim();

                            if (authorName && rawReviewText.length > 0) {
                                const exists = collected.some(
                                    c => c.authorName.toLowerCase() === authorName.toLowerCase()
                                );
                                if (!exists) {
                                    collected.push({
                                        authorName,
                                        rating: revRating,
                                        text: rawReviewText,
                                        authorImage,
                                        createdAt,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn('[googleReviews] Direct Google Maps preview fetch warning:', e);
    }

    // 2. Also try Google Places API (New) if GOOGLE_PLACES_API_KEY is configured and permitted
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (apiKey) {
        const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,reviews&key=${apiKey}`;
        try {
            const res = await fetch(url, {
                headers: {
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
                },
                next: { revalidate: 0 },
            });

            if (res.ok) {
                const data = await res.json();
                if (typeof data.userRatingCount === 'number' && data.userRatingCount > 0) {
                    totalGoogleCount = Math.max(totalGoogleCount, data.userRatingCount);
                }
                if (typeof data.rating === 'number' && data.rating > 0) {
                    rating = data.rating;
                }
                if (Array.isArray(data.reviews)) {
                    for (const r of data.reviews) {
                        const authorName = (r.authorAttribution?.displayName || 'Google User').trim();
                        const text = (r.text?.text || r.originalText?.text || '').trim();
                        if (!text) continue;
                        const exists = collected.some(
                            c => c.authorName.toLowerCase() === authorName.toLowerCase()
                        );
                        if (!exists) {
                            collected.push({
                                authorName,
                                rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
                                text,
                                authorImage: r.authorAttribution?.photoUri || null,
                                createdAt: r.publishTime ? new Date(r.publishTime) : new Date(),
                            });
                        }
                    }
                }
            }
        } catch {
            // Handled gracefully by direct Google Maps feed above
        }
    }

    gState.__glitzGoogleTotalCount = totalGoogleCount;

    return {
        reviews: collected,
        totalGoogleCount,
        rating,
    };
}

/**
 * Legacy helper returning just the live reviews array.
 */
export async function fetchLiveGoogleReviews(): Promise<FetchedGoogleReview[]> {
    const res = await fetchLiveGoogleReviewsAndCount();
    return res.reviews;
}

/**
 * Synchronizes Google reviews (and ensures verified Setmore reviews are seeded) into the database.
 * Combines live fetched reviews with verified Google reviews, deduplicates,
 * and appends new ones so reviews accumulate over time.
 */
export async function syncGoogleReviewsToDb() {
    let imported = 0;
    let skipped = 0;

    // 1. Fetch live reviews & live total count from Google Maps / Places API
    const { reviews: liveReviews, totalGoogleCount } = await fetchLiveGoogleReviewsAndCount();

    // 2. Combine live reviews with known verified Google reviews
    const pool: FetchedGoogleReview[] = [...liveReviews];

    for (const init of INITIAL_GOOGLE_REVIEWS) {
        const alreadyInPool = pool.some(
            p => p.authorName.toLowerCase() === init.authorName.toLowerCase()
        );
        if (!alreadyInPool) {
            pool.push(init);
        }
    }

    // 3. Upsert Google reviews into database
    for (const rev of pool) {
        if (!rev.text || !rev.authorName) continue;

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

    // 4. Ensure verified Setmore reviews are also present in the database
    let setmoreSeeded = 0;
    const setmoreInDb = await prisma.review.count({ where: { source: 'setmore' } });
    if (setmoreInDb < INITIAL_SETMORE_REVIEWS.length) {
        for (const sRev of INITIAL_SETMORE_REVIEWS) {
            const existingSetmore = await prisma.review.findFirst({
                where: {
                    source: 'setmore',
                    authorName: { equals: sRev.authorName, mode: 'insensitive' },
                },
            });
            if (!existingSetmore) {
                await (prisma as any).review.create({
                    data: {
                        rating: sRev.rating,
                        text: sRev.text,
                        source: 'setmore',
                        authorName: sRev.authorName,
                        createdAt: sRev.createdAt,
                    },
                });
                setmoreSeeded++;
            }
        }
    }

    const totalInDb = await prisma.review.count({ where: { source: 'google' } });
    const websiteInDb = await prisma.review.count({ where: { source: 'website' } });
    const effectiveGoogleCount = Math.max(totalGoogleCount, totalInDb, FALLBACK_GOOGLE_REVIEW_COUNT);
    gState.__glitzGoogleTotalCount = effectiveGoogleCount;
    gState.__glitzLastReviewSyncAt = Date.now();

    return {
        success: true,
        imported,
        skipped,
        setmoreSeeded,
        total: totalInDb,
        googleTotalCount: effectiveGoogleCount,
        setmoreTotalCount: SETMORE_BASE_REVIEW_COUNT,
        totalCombinedCount: SETMORE_BASE_REVIEW_COUNT + effectiveGoogleCount + websiteInDb,
        message: `Synced Google reviews: ${imported} new added, ${skipped} already saved (${totalInDb} stored on website, ${effectiveGoogleCount} total on Google Maps).`,
    };
}

/**
 * Ensures the daily Google review sync runs automatically (at most once every 12 hours,
 * or immediately if the DB is missing Google/Setmore reviews).
 */
export async function ensureDailyReviewSync() {
    const now = Date.now();
    const lastSync = gState.__glitzLastReviewSyncAt || 0;
    const twelveHoursMs = 12 * 60 * 60 * 1000;

    const [googleCount, setmoreCount] = await Promise.all([
        prisma.review.count({ where: { source: 'google' } }),
        prisma.review.count({ where: { source: 'setmore' } }),
    ]);

    const needsImmediateSeed = googleCount < INITIAL_GOOGLE_REVIEWS.length || setmoreCount === 0;
    const needsDailyRefresh = now - lastSync > twelveHoursMs;

    if (needsImmediateSeed) {
        if (!gState.__glitzReviewSyncInFlight) {
            gState.__glitzReviewSyncInFlight = syncGoogleReviewsToDb().finally(() => {
                gState.__glitzReviewSyncInFlight = undefined;
            });
        }
        try {
            await gState.__glitzReviewSyncInFlight;
        } catch (e) {
            console.warn('[ensureDailyReviewSync] Immediate sync error:', e);
        }
    } else if (needsDailyRefresh && !gState.__glitzReviewSyncInFlight) {
        // Trigger non-blocking background sync so user requests stay instant
        gState.__glitzReviewSyncInFlight = syncGoogleReviewsToDb()
            .catch(e => console.warn('[ensureDailyReviewSync] Background sync error:', e))
            .finally(() => {
                gState.__glitzReviewSyncInFlight = undefined;
            });
    }
}

/**
 * Returns live dynamic review statistics combining Setmore (116+), live Google Maps count (51+),
 * and website reviews.
 */
export async function getDynamicReviewStats() {
    await ensureDailyReviewSync();
    const [googleStoredCount, setmoreStoredCount, websiteStoredCount] = await Promise.all([
        prisma.review.count({ where: { source: 'google' } }),
        prisma.review.count({ where: { source: 'setmore' } }),
        prisma.review.count({ where: { source: 'website' } }),
    ]);

    const googleTotalCount = Math.max(
        gState.__glitzGoogleTotalCount || FALLBACK_GOOGLE_REVIEW_COUNT,
        googleStoredCount,
        FALLBACK_GOOGLE_REVIEW_COUNT
    );
    const setmoreTotalCount = Math.max(SETMORE_BASE_REVIEW_COUNT, setmoreStoredCount);
    const totalCount = setmoreTotalCount + googleTotalCount + websiteStoredCount;

    return {
        rating: 5.0,
        totalCount,
        googleTotalCount,
        setmoreTotalCount,
        googleStoredCount,
        setmoreStoredCount,
        websiteStoredCount,
    };
}

/**
 * Legacy compatibility export used by GET /api/reviews
 */
export async function getGoogleReviews() {
    await ensureDailyReviewSync();

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
