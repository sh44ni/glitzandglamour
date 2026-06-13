import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;
        const post = await prisma.blogPost.findUnique({
            where: { slug },
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
                published: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!post || !post.published) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Increment view count (non-blocking)
        prisma.blogPost.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});

        return NextResponse.json({ post });
    } catch (error) {
        console.error('[GET /api/blogs/:slug]', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}
