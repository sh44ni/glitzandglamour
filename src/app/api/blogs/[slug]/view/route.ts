import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        // Simple rate limit to prevent spamming views (1 view per minute per slug per IP)
        const ip = getClientIp(req);
        const { slug } = await params;
        const rl = rateLimit(`${ip}-view-${slug}`, 'view', { limit: 1, windowMs: 60 * 1000 });
        
        if (!rl.ok) {
            return NextResponse.json({ success: false, message: 'Rate limited' }, { status: 429 });
        }

        // updateMany: code-only fallback blogs have no DB row, which made update() throw a 500 on every view.
        const { count } = await prisma.blogPost.updateMany({ where: { slug }, data: { views: { increment: 1 } } });
        if (!count) return NextResponse.json({ success: true, views: null });
        const blog = await prisma.blogPost.findUnique({ where: { slug }, select: { views: true } });

        return NextResponse.json({ success: true, views: blog?.views ?? null });
    } catch (error) {
        console.error('[Blog View Error]', error);
        return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }
}
