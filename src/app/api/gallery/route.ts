import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';

const PAGE_SIZE = 24;

// GET: Retrieve public gallery images
// Supports:
//   ?all=true      — returns ALL images (for website)
//   ?cursor=<id>   — cursor-based pagination (for mobile app)
//   ?tag=<tag>     — filter by tag
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');
        const cursor = searchParams.get('cursor') ?? undefined;
        const all = searchParams.get('all') === 'true';

        const where = tag && tag !== 'All'
            ? { tags: { contains: tag, mode: 'insensitive' as const } }
            : undefined;

        // ── Non-paginated mode (website) ──────────────────────────────────
        if (all) {
            const images = await prisma.galleryImage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });

            const uniqueTags = extractTags(images);
            return NextResponse.json({
                images: images.map(img => ({ ...img, url: resolveImageUrl(img.url) ?? img.url })),
                tags: uniqueTags,
            });
        }

        // ── Paginated mode (mobile app) ───────────────────────────────────
        const images = await prisma.galleryImage.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        const hasMore = images.length > PAGE_SIZE;
        const page = hasMore ? images.slice(0, PAGE_SIZE) : images;
        const nextCursor = hasMore ? page[page.length - 1].id : null;

        // Fetch all tags for the filter UI (always returns the full tag list)
        const allImages = await prisma.galleryImage.findMany({ select: { tags: true } });
        const uniqueTags = extractTags(allImages);

        return NextResponse.json({
            images: page.map(img => ({ ...img, url: resolveImageUrl(img.url) ?? img.url })),
            tags: uniqueTags,
            nextCursor,
            hasMore,
        });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch gallery images.' }, { status: 500 });
    }
}

function extractTags(images: { tags: string | null }[]): string[] {
    const set = new Set<string>();
    images.forEach(img => {
        if (img.tags) {
            img.tags.split(',').forEach(t => {
                const clean = t.trim();
                if (clean) set.add(clean);
            });
        }
    });
    return Array.from(set).sort();
}
