import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { sendReviewRequestEmail } from '@/lib/email';
import { sendReviewRequestSMS } from '@/lib/sms';
import { createReviewToken } from '@/lib/reviewTokens';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_REVIEWS });

// GET /api/admin/review-generator — list completed bookings with review status
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (bookingId) {
        // Get single booking details + notification history
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                service: { select: { name: true } },
                review: true,
                reviewToken: true,
                notifications: {
                    where: { event: 'review_request' },
                    orderBy: { sentAt: 'desc' },
                },
            },
        });
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        return NextResponse.json({ booking });
    }

    // List all completed bookings
    const bookings = await prisma.booking.findMany({
        where: { status: 'COMPLETED' },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            service: { select: { name: true } },
            review: true,
            reviewToken: true,
            notifications: {
                where: { event: 'review_request' },
                orderBy: { sentAt: 'desc' },
                take: 1,
            },
        },
        orderBy: { updatedAt: 'desc' },
        take: 100,
    });

    return NextResponse.json({ bookings });
}

// POST /api/admin/review-generator
// Body: { bookingId, includeDiscount, channel: 'email'|'sms'|'both', customMessage? }
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bookingId, includeDiscount, channel, generateOnly } = body;

    if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            service: { select: { name: true } },
            review: true,
            reviewToken: true,
        },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const customerName = booking.user?.name || booking.guestName || 'Customer';
    const customerEmail = booking.user?.email || booking.guestEmail;
    const customerPhone = booking.user?.phone || booking.guestPhone;
    const serviceName = booking.service.name;

    const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://glitzandglamours.com';

    // Get or create review token
    let reviewToken = booking.reviewToken;
    if (!reviewToken) {
        const { token, isFirstVisit } = await createReviewToken(bookingId);
        reviewToken = { token, isFirstVisit } as any;
    }

    const reviewUrl = `${siteUrl}/leave-review/${reviewToken!.token}`;
    const isFirstVisit = includeDiscount ?? reviewToken!.isFirstVisit;

    // If only generating message, return AI-generated copy without sending
    if (generateOnly) {
        const prompt = `You are JoJany, owner of Glitz & Glamour nail studio in Vista, CA. Write a warm, personal, SHORT review request message to a client named ${customerName} who just got a ${serviceName} service.${isFirstVisit ? ' They are a first-time client — include mention of a $10 discount on their next visit as a thank-you for reviewing.' : ''} Keep it friendly, genuine, under 160 characters for SMS version. Return JSON with keys: sms (under 160 chars), email (2-3 sentences, warm and personal).`;

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
            reviewUrl,
            isFirstVisit,
            customerName,
        });
    }

    // Send the message
    const results: Record<string, any> = {};

    if ((channel === 'email' || channel === 'both') && customerEmail) {
        await sendReviewRequestEmail(bookingId, customerEmail, customerName, serviceName, reviewUrl, isFirstVisit);
        results.email = { sent: true, to: customerEmail };
    } else if ((channel === 'email' || channel === 'both') && !customerEmail) {
        results.email = { sent: false, reason: 'No email on file' };
    }

    if ((channel === 'sms' || channel === 'both') && customerPhone) {
        await sendReviewRequestSMS(bookingId, customerPhone, customerName, reviewUrl, isFirstVisit);
        results.sms = { sent: true, to: customerPhone };
    } else if ((channel === 'sms' || channel === 'both') && !customerPhone) {
        results.sms = { sent: false, reason: 'No phone on file' };
    }

    return NextResponse.json({ success: true, results, reviewUrl });
}
