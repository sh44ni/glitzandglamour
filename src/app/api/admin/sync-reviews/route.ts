import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { INITIAL_SETMORE_REVIEWS, getDynamicReviewStats } from '@/lib/googleReviews';

const SETMORE_URL = 'https://glitzandglamourstudio.setmore.com/';

/**
 * Fetches Setmore's public booking page HTML and extracts reviews.
 * Falls back to INITIAL_SETMORE_REVIEWS if Setmore rate-limits (429) or blocks automated fetch.
 */
async function scrapeSetmoreReviews(): Promise<{ name: string; text: string; rating: number; createdAt?: Date }[]> {
    try {
        const res = await fetch(SETMORE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html',
            },
            next: { revalidate: 0 },
        });

        if (res.ok) {
            const html = await res.text();
            const reviews: { name: string; text: string; rating: number }[] = [];

            const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
            if (nextDataMatch) {
                try {
                    const data = JSON.parse(nextDataMatch[1]);
                    const findReviews = (obj: unknown): unknown[] => {
                        if (Array.isArray(obj)) {
                            if (obj.length > 0 && obj[0] && typeof obj[0] === 'object') {
                                const first = obj[0] as Record<string, unknown>;
                                if (('reviewerName' in first || 'reviewer_name' in first || 'name' in first) &&
                                    ('comment' in first || 'text' in first || 'review' in first || 'reviewText' in first)) {
                                    return obj;
                                }
                            }
                            for (const item of obj) {
                                const found = findReviews(item);
                                if (found.length > 0) return found;
                            }
                        } else if (obj && typeof obj === 'object') {
                            for (const val of Object.values(obj as Record<string, unknown>)) {
                                const found = findReviews(val);
                                if (found.length > 0) return found;
                            }
                        }
                        return [];
                    };

                    const found = findReviews(data);
                    if (found.length > 0) {
                        for (const item of found) {
                            const r = item as Record<string, unknown>;
                            const name = (r.reviewerName || r.reviewer_name || r.name || r.customerName || '') as string;
                            const text = (r.comment || r.text || r.review || r.reviewText || r.description || '') as string;
                            const rating = Number(r.rating || r.stars || r.score || 5);
                            if (name && text) {
                                reviews.push({
                                    name: String(name).trim(),
                                    text: String(text).replace(/More\s*$/, '').trim(),
                                    rating: Math.min(5, Math.max(1, rating || 5)),
                                });
                            }
                        }
                        if (reviews.length > 0) return reviews;
                    }
                } catch {
                    // Fall through to HTML parsing
                }
            }

            const textContent = html
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&ldquo;|&rdquo;|&amp;|&lt;|&gt;|&nbsp;/g, ' ')
                .replace(/\s+/g, ' ');

            const reviewPattern = /([A-ZÀ-ÿ][a-zÀ-ÿA-Z\s]+(?:\s[A-ZÀ-ÿ][a-zÀ-ÿA-Z\s]+)*)\s*[·•]\s*([\w\s,!?'.¡¿\u00C0-\u024F\u{1F300}-\u{1F9FF}][^·•]{40,}?)(?:More|$)/gmu;

            let match;
            const seen = new Set<string>();
            while ((match = reviewPattern.exec(textContent)) !== null) {
                const name = match[1].trim();
                const text = match[2].replace(/More\s*$/, '').trim();
                const key = `${name.toLowerCase()}${text.substring(0, 30).toLowerCase()}`;
                if (!seen.has(key) && text.length > 30 && name.length < 60) {
                    seen.add(key);
                    reviews.push({ name, text, rating: 5 });
                }
                if (reviews.length >= 150) break;
            }

            if (reviews.length > 0) return reviews;
        }
    } catch {
        // Fall through to verified Setmore pool
    }

    return INITIAL_SETMORE_REVIEWS.map(r => ({
        name: r.authorName,
        text: r.text,
        rating: r.rating,
        createdAt: r.createdAt,
    }));
}

// POST /api/admin/sync-reviews — scrape Setmore and upsert into DB
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const scraped = await scrapeSetmoreReviews();

        let imported = 0;
        let skipped = 0;

        for (const { name, text, rating, createdAt } of scraped) {
            const existing = await prisma.review.findFirst({
                where: {
                    source: 'setmore',
                    authorName: { equals: name, mode: 'insensitive' },
                },
            });

            if (existing) {
                skipped++;
                continue;
            }

            await prisma.review.create({
                data: {
                    rating,
                    text,
                    source: 'setmore',
                    authorName: name,
                    ...(createdAt ? { createdAt } : {}),
                },
            });
            imported++;
        }

        const totalInDb = await prisma.review.count({ where: { source: 'setmore' } });

        return NextResponse.json({
            success: true,
            imported,
            skipped,
            total: totalInDb,
            message: `Synced Setmore reviews: ${imported} new added, ${skipped} already saved (${totalInDb} stored on website, 116+ verified on Setmore).`,
        });
    } catch (e) {
        console.error('[sync-reviews]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Failed to sync reviews. Check server logs.' }, { status: 500 });
    }
}

// GET /api/admin/sync-reviews — list all reviews for admin management
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDynamicReviewStats();

    const reviews = await (prisma as any).review.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json({ reviews, stats });
}

// DELETE /api/admin/sync-reviews?id=xxx — delete a review
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
