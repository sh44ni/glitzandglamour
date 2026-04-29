import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPingram } from '@/lib/pingramClient';

const OWNER_PHONE  = process.env.OWNER_PHONE_NUMBER  || '+17602905910';
const OWNER_ID     = process.env.OWNER_NOTIFICATION_ID || 'info@glitzandglamours.com';
const FROM_NUMBER  = process.env.PINGRAM_FROM_NUMBER  || '+17609070455';

async function sendSms(toId: string, toNumber: string, message: string, type = 'booking_request') {
    try {
        const pingram = await buildPingram();
        if (!pingram) { console.log('[INQUIRY SMS SKIPPED]', toNumber); return; }
        await pingram.send({ type, to: { id: toId, number: toNumber }, sms: { message } });
    } catch (err) {
        console.error('[INQUIRY SMS ERROR]', { toNumber, err });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            firstName, lastName, phone, email,
            eventType, eventDate, startTime, guestCount,
            location, services, onLocation, inspiration,
            budget, referral, notes,
        } = body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !eventType || !eventDate || !guestCount || !location || !services?.length || !onLocation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save to DB
        const inquiry = await prisma.specialEventInquiry.create({
            data: {
                firstName, lastName, phone, email,
                eventType, eventDate,
                startTime: startTime || null,
                guestCount, location,
                services: JSON.stringify(services),
                onLocation,
                inspiration: inspiration || null,
                budget: budget || null,
                referral: referral || null,
                notes: notes || null,
            },
        });

        // Clean phone to E.164 for SMS
        const rawDigits = phone.replace(/\D/g, '');
        const e164 = rawDigits.length === 10 ? `+1${rawDigits}` : rawDigits.startsWith('1') ? `+${rawDigits}` : `+1${rawDigits}`;

        // 1. Client confirmation SMS
        const clientMsg = `Hi ${firstName}! 🌸 Your special event inquiry has been received by Glitz & Glamour Studio. We'll review your details and get back to you shortly. Thank you! — JoJany 💅`;
        await sendSms(e164, e164, clientMsg, 'booking_request');

        // 2. Admin alert SMS
        const svcList = (Array.isArray(services) ? services : JSON.parse(services)).join(', ');
        const adminMsg = `✨ New Event Inquiry! ${firstName} ${lastName} | ${eventType} on ${eventDate} | ${guestCount} guests | ${location} | Services: ${svcList} | Phone: ${phone} | Email: ${email}`;
        await sendSms(OWNER_ID, OWNER_PHONE, adminMsg, 'booking_request');

        return NextResponse.json({ success: true, id: inquiry.id });
    } catch (err) {
        console.error('[INQUIRY API ERROR]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Admin-only — basic check via referer or just allow (admin panel is behind its own auth)
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const inquiries = await prisma.specialEventInquiry.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return NextResponse.json({ inquiries });
    } catch (err) {
        console.error('[INQUIRY GET ERROR]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, status } = await req.json();
        if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        const updated = await prisma.specialEventInquiry.update({ where: { id }, data: { status } });
        return NextResponse.json({ success: true, inquiry: updated });
    } catch (err) {
        console.error('[INQUIRY PATCH ERROR]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
