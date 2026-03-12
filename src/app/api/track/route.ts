import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, sessionId, referrer, device, duration } = body;

        if (!path || !sessionId) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        // If duration is provided, update the existing page view instead of creating new
        if (duration !== undefined) {
            await prisma.pageView.updateMany({
                where: { sessionId, path, duration: null },
                data: { duration: Math.min(duration, 3600) }, // cap at 1hr
            });
            return NextResponse.json({ ok: true });
        }

        await prisma.pageView.create({
            data: {
                path: path.slice(0, 255),
                sessionId,
                referrer: referrer?.slice(0, 500) || null,
                device: device || 'unknown',
            },
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
