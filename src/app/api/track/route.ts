import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function safeParseUrl(u: string | null): URL | null {
    if (!u) return null;
    try {
        return new URL(u);
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, sessionId, referrer, device, duration, queryString, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

        if (!path || !sessionId) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const refUrl = safeParseUrl(referrer || null);
        const referrerHost = refUrl?.host ? refUrl.host.slice(0, 120) : null;

        const qs = typeof queryString === 'string' ? queryString.replace(/^\?/, '').slice(0, 800) : null;
        const norm = (v: unknown, max = 120) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

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
                referrerHost,
                device: device || 'unknown',
                queryString: qs,
                utmSource: norm(utmSource),
                utmMedium: norm(utmMedium),
                utmCampaign: norm(utmCampaign),
                utmTerm: norm(utmTerm, 200),
                utmContent: norm(utmContent, 200),
            },
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
