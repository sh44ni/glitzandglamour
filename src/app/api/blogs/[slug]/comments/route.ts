import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobileAuth';

/**
 * Resolves the authenticated user from either:
 *  - NextAuth web session (cookie-based)
 *  - Mobile Bearer JWT token
 * Returns the userId string, or null if unauthenticated.
 */
async function resolveUserId(req: NextRequest): Promise<string | null> {
    // 1. Try Bearer token (mobile app)
    const tokenPayload = await verifyMobileToken(req, 'access');
    if (tokenPayload?.sub) return tokenPayload.sub;

    // 2. Try NextAuth session (website)
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    return userId ?? null;
}

// GET /api/blogs/[slug]/comments — public
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const post = await (prisma as any).blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const comments = await (prisma as any).blogComment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json({ comments });
}

// POST /api/blogs/[slug]/comments — requires auth (web session OR mobile Bearer token)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const userId = await resolveUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Sign in to post a comment.' }, { status: 401 });
    }

    const { slug } = await params;
    const post = await (prisma as any).blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const { body } = await req.json().catch(() => ({}));
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

// DELETE /api/blogs/[slug]/comments?commentId=xxx — owner only
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const userId = await resolveUserId(req);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');
    if (!commentId) return NextResponse.json({ error: 'commentId is required.' }, { status: 400 });

    const comment = await (prisma as any).blogComment.findUnique({
        where: { id: commentId },
        select: { userId: true },
    });

    if (!comment) return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    if (comment.userId !== userId) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    await (prisma as any).blogComment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true });
}
