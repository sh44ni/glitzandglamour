import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/blogs/[slug]/comments — public, returns all comments for a post
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const post = await (prisma as any).blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const comments = await (prisma as any).blogComment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json({ comments });
}

// POST /api/blogs/[slug]/comments — requires sign-in
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!session?.user || !userId) {
        return NextResponse.json({ error: 'Sign in to post a comment.' }, { status: 401 });
    }

    const { slug } = await params;
    const post = await (prisma as any).blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const { body } = await req.json();
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
        return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
    }
    if (body.trim().length > 1000) {
        return NextResponse.json({ error: 'Comment must be 1000 characters or less.' }, { status: 400 });
    }

    const comment = await (prisma as any).blogComment.create({
        data: { postId: post.id, userId, body: body.trim() },
        include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
}
