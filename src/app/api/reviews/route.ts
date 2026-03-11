import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/reviews — public list of all reviews + eligibility for current user
export async function GET() {
    const session = await auth();

    // Fetch all submitted reviews (newest first) — both website and setmore
    const reviews = await (prisma as any).review.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, image: true } },
            booking: { select: { service: { select: { name: true } } } },
        },
    });

    // If signed in, find completed bookings NOT yet reviewed
    let eligibleBookings: { id: string; service: { name: string } }[] = [];
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
        if (user) {
            eligibleBookings = await prisma.booking.findMany({
                where: {
                    userId: user.id,
                    status: 'COMPLETED',
                    review: null,
                },
                select: {
                    id: true,
                    service: { select: { name: true } },
                },
            });
        }
    }

    return NextResponse.json({ reviews, eligibleBookings });
}

// POST /api/reviews — submit a review (website users only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, rating, text } = body;

    if (!bookingId || !rating || !text?.trim()) {
        return NextResponse.json({ error: 'bookingId, rating and text are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }
    if (text.trim().length < 10) {
        return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }
    if (text.trim().length > 600) {
        return NextResponse.json({ error: 'Review must be under 600 characters' }, { status: 400 });
    }

    // Get the user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify the booking belongs to this user, is COMPLETED, and has no review
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            userId: user.id,
            status: 'COMPLETED',
            review: null,
        },
    });

    if (!booking) {
        return NextResponse.json({ error: 'This booking is not eligible for a review' }, { status: 403 });
    }

    // Determine loyalty badge — snapshot at time of review
    const loyaltyCard = await prisma.loyaltyCard.findUnique({ where: { userId: user.id } });
    const badge = loyaltyCard?.isInsider ? 'insider' : 'member';

    const review = await (prisma as any).review.create({
        data: {
            userId: user.id,
            bookingId,
            rating,
            text: text.trim(),
            source: 'website',
            badge,
        },
        include: {
            user: { select: { name: true, image: true } },
            booking: { select: { service: { select: { name: true } } } },
        },
    });

    return NextResponse.json({ review }, { status: 201 });
}
