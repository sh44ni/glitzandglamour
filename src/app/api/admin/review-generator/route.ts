import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { sendReviewRequestEmail } from '@/lib/email';
import { sendReviewRequestSMS } from '@/lib/sms';
import { createReviewToken } from '@/lib/reviewTokens';
import { generateReviewMessage } from '@/lib/reviewAI';

// GET — list all completed bookings for account holders (tracking log)
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookings = await (prisma as any).booking.findMany({
        where: { status: 'COMPLETED', userId: { not: null } },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            service: { select: { name: true } },
            review: { select: { rating: true, text: true, createdAt: true } },
            reviewToken: { select: { isFirstVisit: true, used: true, expiresAt: true } },
            notifications: {
                where: { event: 'review_request' },
                orderBy: { sentAt: 'desc' },
                take: 5,
            },
        },
        orderBy: { updatedAt: 'desc' },
        take: 150,
    });

    return NextResponse.json({ bookings });
}

// POST — manual AI generate (no bookingId) or resend for a booking
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bookingId, includeDiscount, channel, generateOnly, manualClient } = body;

    const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://glitzandglamours.com';

    // ── MANUAL (no bookingId) — generate for walk-in client ──────────────────
    if (!bookingId && manualClient) {
        const firstName = (manualClient.name || 'beautiful').trim().split(' ')[0];
        const serviceName = manualClient.service || 'your nails';
        // For walk-ins there's no token — point them to the general reviews page
        const reviewUrl = `${siteUrl}/reviews`;
        const { sms, emailBody } = await generateReviewMessage(firstName, serviceName, !!includeDiscount);
        // Replace [REVIEW_LINK] with the actual URL in both outputs
        const smsWithLink = sms.includes('[REVIEW_LINK]')
            ? sms.replace('[REVIEW_LINK]', reviewUrl)
            : `${sms} ${reviewUrl}`;
        const emailWithLink = emailBody.includes('[REVIEW_LINK]')
            ? emailBody.replace('[REVIEW_LINK]', reviewUrl)
            : `${emailBody} ${reviewUrl}`;
        return NextResponse.json({ generated: true, sms: smsWithLink, emailBody: emailWithLink, email: emailWithLink, reviewUrl });
    }

    // ── BOOKING-BASED (account holder manual resend) ──────────────────────────
    if (!bookingId) return NextResponse.json({ error: 'bookingId or manualClient required' }, { status: 400 });

    const booking = await (prisma as any).booking.findUnique({
        where: { id: bookingId },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            service: { select: { name: true } },
            reviewToken: true,
        },
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const customerName = booking.user?.name || booking.guestName || 'Customer';
    const customerEmail = booking.user?.email || booking.guestEmail;
    const customerPhone = booking.user?.phone || booking.guestPhone;
    const serviceName = booking.service?.name || 'your service';

    let reviewToken = booking.reviewToken;
    if (!reviewToken) {
        const { token, isFirstVisit } = await createReviewToken(bookingId);
        reviewToken = { token, isFirstVisit } as any;
    }

    const reviewUrl = `${siteUrl}/leave-review/${reviewToken.token}`;
    const firstVisit = includeDiscount ?? reviewToken.isFirstVisit;
    const firstName = customerName.trim().split(' ')[0];

    // generateOnly — return AI copy with link already embedded, don't send
    if (generateOnly) {
        const { sms, emailBody } = await generateReviewMessage(firstName, serviceName, firstVisit);
        const smsWithLink = sms.includes('[REVIEW_LINK]')
            ? sms.replace('[REVIEW_LINK]', reviewUrl)
            : `${sms} ${reviewUrl}`;
        const emailWithLink = emailBody.includes('[REVIEW_LINK]')
            ? emailBody.replace('[REVIEW_LINK]', reviewUrl)
            : `${emailBody} ${reviewUrl}`;
        return NextResponse.json({ generated: true, sms: smsWithLink, emailBody: emailWithLink, email: emailWithLink, reviewUrl });
    }

    // Send
    const results: Record<string, any> = {};
    if ((channel === 'email' || channel === 'both') && customerEmail) {
        await sendReviewRequestEmail(bookingId, customerEmail, customerName, serviceName, reviewUrl, firstVisit);
        results.email = { sent: true };
    }
    if ((channel === 'sms' || channel === 'both') && customerPhone) {
        await sendReviewRequestSMS(bookingId, customerPhone, customerName, reviewUrl, firstVisit, serviceName);
        results.sms = { sent: true };
    }

    return NextResponse.json({ success: true, results, reviewUrl });
}
