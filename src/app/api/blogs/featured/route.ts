import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const post = await prisma.blogPost.findFirst({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                content: true,
                coverImage: true,
                author: true,
                tags: true,
                views: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!post) return NextResponse.json({ post: null });
        return NextResponse.json({ post: { ...post, coverImage: resolveImageUrl(post.coverImage) ?? post.coverImage } });
    } catch (error) {
        console.error('[GET /api/blogs/featured]', error);
        return NextResponse.json({ error: 'Failed to fetch featured post' }, { status: 500 });
    }
}
