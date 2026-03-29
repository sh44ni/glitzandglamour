import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateReviewToken, markReviewTokenUsed } from '@/lib/reviewTokens';
import { generateDiscountCode } from '@/lib/discountCodes';

// POST /api/reviews/submit-token
// Body: { token, rating, text, photos?: string[] }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, rating, text, photos } = body;

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

        // Validate the token
        const validation = await validateReviewToken(token);
        if (!validation.valid) {
            const msgMap: Record<string, string> = {
                not_found: 'Invalid review link.',
                already_used: 'This review link has already been used.',
                expired: 'This review link has expired (7-day limit).',
                not_completed: 'Booking is not marked as completed.',
                already_reviewed: 'A review has already been submitted for this booking.',
            };
            return NextResponse.json({ error: msgMap[validation.reason as string] || 'Invalid link.' }, { status: 400 });
        }

        const { booking, isFirstVisit } = validation;
        const customerName = booking.user?.name || booking.guestName || 'Guest';

        // Determine badge
        let badge = null;
        if (booking.userId) {
            const loyaltyCard = await prisma.loyaltyCard.findUnique({ where: { userId: booking.userId } });
            badge = loyaltyCard?.isInsider ? 'insider' : 'member';
        }

        // Create the review
        const review = await (prisma as any).review.create({
            data: {
                userId: booking.userId || null,
                bookingId: booking.id,
                rating,
                text: text.trim(),
                source: 'website',
                badge,
                authorName: !booking.userId ? customerName : null,
            },
        });

        // Mark token as used
        await markReviewTokenUsed(token);

        // If first visit → generate discount code
        let discountCode: string | null = null;
        if (isFirstVisit) {
            discountCode = await generateDiscountCode(booking.id, customerName, booking.userId);
        }

        return NextResponse.json({
            success: true,
            review: { id: review.id, rating, text: review.text },
            isFirstVisit,
            discountCode,
            customerName,
        }, { status: 201 });

    } catch (err) {
        console.error('[REVIEW SUBMIT TOKEN ERROR]', err);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}

// GET /api/reviews/submit-token?token=xxx — validate without submitting
export async function GET(req: NextRequest) {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const result = await validateReviewToken(token);
    if (!result.valid) {
        return NextResponse.json({ valid: false, reason: result.reason });
    }

    const { booking, isFirstVisit } = result;
    const customerName = booking.user?.name || booking.guestName || 'Guest';

    return NextResponse.json({
        valid: true,
        isFirstVisit,
        customerName,
        service: booking.service?.name,
        bookingId: booking.id,
        hasAccount: !!booking.userId,
        userImage: booking.user?.image || null,
    });
}
