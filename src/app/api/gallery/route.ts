import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';

const PAGE_SIZE = 24;

// GET: Retrieve public gallery images with cursor-based pagination
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');
        const cursor = searchParams.get('cursor') ?? undefined;

        const where = tag && tag !== 'All'
            ? { tags: { contains: tag, mode: 'insensitive' as const } }
            : undefined;

        const images = await prisma.galleryImage.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE + 1, // one extra to check for next page
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        const hasMore = images.length > PAGE_SIZE;
        const page = hasMore ? images.slice(0, PAGE_SIZE) : images;
        const nextCursor = hasMore ? page[page.length - 1].id : null;

        // Fetch unique tags for filter UI
        const allImages = await prisma.galleryImage.findMany({ select: { tags: true } });
        const uniqueTags = new Set<string>();
        allImages.forEach(img => {
            if (img.tags) {
                img.tags.split(',').forEach(t => {
                    const clean = t.trim();
                    if (clean) uniqueTags.add(clean);
                });
            }
        });

        return NextResponse.json({
            images: page.map(img => ({ ...img, url: resolveImageUrl(img.url) ?? img.url })),
            tags: Array.from(uniqueTags).sort(),
            nextCursor,
            hasMore,
        });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch gallery images.' }, { status: 500 });
    }
}
