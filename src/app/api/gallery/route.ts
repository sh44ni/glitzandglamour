import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Retrieve public gallery images, optionally filtered by tags
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');

        const images = await prisma.galleryImage.findMany({
            where: tag && tag !== 'All' ? {
                tags: {
                    contains: tag,
                    mode: 'insensitive'
                }
            } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        // Also fetch unique tags across the database to build the filter UI dynamically
        const allImages = await prisma.galleryImage.findMany({
            select: { tags: true }
        });

        const uniqueTags = new Set<string>();
        allImages.forEach(img => {
            if (img.tags) {
                img.tags.split(',').forEach(t => {
                    const cleanTag = t.trim();
                    if (cleanTag) uniqueTags.add(cleanTag);
                });
            }
        });

        return NextResponse.json({
            images,
            tags: Array.from(uniqueTags).sort()
        });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch gallery images.' }, { status: 500 });
    }
}
