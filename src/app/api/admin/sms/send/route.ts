import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { dispatchSms } from '@/lib/sms';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { phone, message, bookingId, recipientName } = body;

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json({ error: 'A valid recipient phone number is required.' }, { status: 400 });
        }

        if (!message || typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
        }

        // Clean phone number to E.164
        const rawDigits = phone.replace(/\D/g, '');
        if (rawDigits.length < 10) {
            return NextResponse.json({ error: 'Phone number must contain at least 10 digits.' }, { status: 400 });
        }

        let e164 = phone.trim();
        if (!e164.startsWith('+')) {
            if (rawDigits.length === 10) {
                e164 = `+1${rawDigits}`;
            } else if (rawDigits.length === 11 && rawDigits.startsWith('1')) {
                e164 = `+${rawDigits}`;
            } else {
                e164 = `+${rawDigits}`;
            }
        }

        // Dispatch via Pingram SMS dispatcher
        const result = await dispatchSms({
            bookingId: bookingId || 'manual',
            event: 'admin_manual_sms',
            toId: e164,
            toNumber: e164,
            message: message.trim(),
            type: 'booking_request',
        });

        if (!result.success) {
            const errDescription =
                result.errorCode === 'no_api_key'
                    ? 'Pingram API key is not configured on the server.'
                    : result.errorCode === 'credits_exhausted'
                    ? 'Pingram SMS credits are exhausted or billing issue occurred.'
                    : result.errorCode === 'invalid_number'
                    ? 'Recipient phone number is invalid for SMS delivery.'
                    : result.errorCode === 'pingram_user_unsubscribed'
                    ? 'Recipient has opted out or unsubscribed from SMS notifications.'
                    : result.errorCode === 'pingram_channel_disabled'
                    ? 'SMS channel is currently disabled in your Pingram settings.'
                    : result.errorCode || 'SMS dispatch failed via Pingram gateway.';

            return NextResponse.json(
                {
                    success: false,
                    error: errDescription,
                    reason: result.reason,
                    errorCode: result.errorCode,
                    trackingId: result.trackingId,
                },
                { status: 422 }
            );
        }

        // If bookingId is provided and exists in DB, append a staff log entry so staff can see it in history
        let updatedBooking = null;
        if (bookingId && bookingId !== 'manual') {
            try {
                const bookingExists = await prisma.booking.findUnique({
                    where: { id: bookingId },
                    select: { id: true },
                });

                if (bookingExists) {
                    await prisma.staffBookingLog.create({
                        data: {
                            bookingId,
                            label: 'SMS Sent',
                            text: `To ${e164}: "${message.trim()}"${result.trackingId ? ` · ID: ${result.trackingId.slice(0, 10)}` : ''}`,
                        },
                    });

                    updatedBooking = await prisma.booking.findUnique({
                        where: { id: bookingId },
                        include: {
                            user: { select: { name: true, email: true, phone: true, image: true } },
                            service: { select: { name: true, priceLabel: true, category: true } },
                            staffLogs: { orderBy: { createdAt: 'desc' as const } },
                        },
                    });
                }
            } catch (logErr) {
                console.warn('[ADMIN SMS STAFF LOG WARNING]', logErr);
            }
        }

        return NextResponse.json({
            success: true,
            trackingId: result.trackingId,
            booking: updatedBooking,
            recipient: e164,
        });
    } catch (err: any) {
        console.error('[ADMIN SMS ROUTE ERROR]', err);
        return NextResponse.json(
            { error: err?.message || 'Internal server error while sending SMS.' },
            { status: 500 }
        );
    }
}
