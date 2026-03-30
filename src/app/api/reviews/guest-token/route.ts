import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { auth } from '@/auth';

// GET /api/reviews/guest-token?token=xxx — validate without submitting
export async function GET(req: NextRequest) {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const link = await (prisma as any).guestReviewLink.findUnique({ where: { token } });
    if (!link) return NextResponse.json({ valid: false, reason: 'not_found' });
    if (link.used) return NextResponse.json({ valid: false, reason: 'already_used' });
    if (new Date() > new Date(link.expiresAt)) return NextResponse.json({ valid: false, reason: 'expired' });

    return NextResponse.json({
        valid: true,
        guestName: link.guestName,
        isFirstVisit: link.isFirstVisit,
    });
}

// POST /api/reviews/guest-token — submit review via guest link
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, rating, text, displayName } = body;

        if (!token || !rating || !text?.trim()) {
            return NextResponse.json({ error: 'token, rating, and text are required' }, { status: 400 });
        }
        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
        }
        if (text.trim().length < 10) {
            return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
        }
        if (text.trim().length > 800) {
            return NextResponse.json({ error: 'Review must be under 800 characters' }, { status: 400 });
        }

        const link = await (prisma as any).guestReviewLink.findUnique({ where: { token } });
        if (!link) return NextResponse.json({ error: 'Invalid review link.' }, { status: 400 });
        if (link.used) return NextResponse.json({ error: 'This review link has already been used.' }, { status: 400 });
        if (new Date() > new Date(link.expiresAt)) return NextResponse.json({ error: 'This review link has expired.' }, { status: 400 });

        const authorName = (displayName?.trim()) || link.guestName;
        const session = await auth();
        const userId = session?.user?.id || null;

        // Create review with no bookingId — authorName tracks the guest
        await (prisma as any).review.create({
            data: {
                userId,
                bookingId: null,
                rating,
                text: text.trim(),
                source: 'website',
                badge: null,
                authorName,
            },
        });

        // Mark link as used
        await (prisma as any).guestReviewLink.update({
            where: { token },
            data: { used: true },
        });

        return NextResponse.json({ success: true, isFirstVisit: link.isFirstVisit }, { status: 201 });

    } catch (err) {
        console.error('[GUEST REVIEW SUBMIT ERROR]', err);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
