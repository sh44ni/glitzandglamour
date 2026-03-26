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

        const blog = await prisma.blogPost.update({
            where: { slug },
            data: { views: { increment: 1 } },
            select: { views: true }
        });

        return NextResponse.json({ success: true, views: blog.views });
    } catch (error) {
        console.error('[Blog View Error]', error);
        return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }
}
