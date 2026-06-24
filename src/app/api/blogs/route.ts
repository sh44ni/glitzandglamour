import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const posts = await prisma.blogPost.findMany({
            where: { published: true },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                coverImage: true,
                author: true,
                tags: true,
                views: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ posts: posts.map(p => ({ ...p, coverImage: resolveImageUrl(p.coverImage) ?? p.coverImage })) });
    } catch (error) {
        console.error('[GET /api/blogs]', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
