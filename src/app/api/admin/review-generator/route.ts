import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { sendReviewRequestEmail } from '@/lib/email';
import { sendReviewRequestSMS } from '@/lib/sms';
import { createReviewToken } from '@/lib/reviewTokens';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_REVIEWS });

// GET — list all completed bookings for account holders (tracking)
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookings = await prisma.booking.findMany({
        where: { status: 'COMPLETED', userId: { not: null } }, // account holders only
        include: {
            user: { select: { name: true, email: true, phone: true } },
            service: { select: { name: true } },
            review: { select: { rating: true, text: true, createdAt: true } },
            reviewToken: { select: { isFirstVisit: true, used: true, expiresAt: true } },
            notifications: {
                where: { event: 'review_request' },
                orderBy: { sentAt: 'desc' },
                take: 3,
            },
        },
        orderBy: { updatedAt: 'desc' },
        take: 150,
    });

    return NextResponse.json({ bookings });
}

// POST — either manual AI generate (no bookingId) or resend for a booking
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bookingId, includeDiscount, channel, generateOnly, manualClient } = body;
    // manualClient = { name, phone, email } for non-account manual sends

    const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://glitzandglamours.com';

    // ── MANUAL (no bookingId) ──────────────────────────────────────────────
    if (!bookingId && manualClient) {
        const { name, phone, email } = manualClient;

        const prompt = `You are JoJany, the owner of Glitz & Glamour nail studio in Vista, CA.
Write a warm, short, genuine review request message to a client named ${name}.${includeDiscount ? ' Include: "As a thank-you, leave a review and get $10 off your next visit!"' : ''}
Keep the SMS under 160 characters. The email can be 2-3 sentences.
Return ONLY valid JSON: { "sms": "...", "email": "..." }`;

        const chat = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            max_tokens: 400,
        });

        const content = JSON.parse(chat.choices[0].message.content || '{}');
        return NextResponse.json({
            generated: true,
            sms: content.sms || '',
            email: content.email || '',
        });
    }

    // ── BOOKING-BASED (account holder resend) ─────────────────────────────
    if (!bookingId) return NextResponse.json({ error: 'bookingId or manualClient required' }, { status: 400 });

    const booking = await prisma.booking.findUnique({
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
    const customerPhone = (booking.user as any)?.phone || booking.guestPhone;
    const serviceName = booking.service.name;

    let reviewToken = booking.reviewToken;
    if (!reviewToken) {
        const { token, isFirstVisit } = await createReviewToken(bookingId);
        reviewToken = { token, isFirstVisit } as any;
    }

    const reviewUrl = `${siteUrl}/leave-review/${reviewToken!.token}`;
    const firstVisit = includeDiscount ?? reviewToken!.isFirstVisit;

    // generateOnly — return AI copy without sending
    if (generateOnly) {
        const prompt = `You are JoJany, owner of Glitz & Glamour nail studio in Vista, CA. Write a warm, SHORT review request to ${customerName} who got a ${serviceName}.${firstVisit ? ' They are a first-time client — mention $10 off their next visit for reviewing.' : ''} SMS under 160 chars. Return JSON: { "sms": "...", "email": "..." }`;
        const chat = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            max_tokens: 400,
        });
        const content = JSON.parse(chat.choices[0].message.content || '{}');
        return NextResponse.json({ generated: true, sms: content.sms || '', email: content.email || '', reviewUrl });
    }

    const results: Record<string, any> = {};
    if ((channel === 'email' || channel === 'both') && customerEmail) {
        await sendReviewRequestEmail(bookingId, customerEmail, customerName, serviceName, reviewUrl, firstVisit);
        results.email = { sent: true };
    }
    if ((channel === 'sms' || channel === 'both') && customerPhone) {
        await sendReviewRequestSMS(bookingId, customerPhone, customerName, reviewUrl, firstVisit);
        results.sms = { sent: true };
    }

    return NextResponse.json({ success: true, results, reviewUrl });
}
