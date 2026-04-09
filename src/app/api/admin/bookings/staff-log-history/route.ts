import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            userId: true,
            guestName: true,
            guestEmail: true,
        },
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Identity rules:
    // - Logged-in: match all bookings for that userId
    // - Guest: match bookings with same guestEmail AND guestName when both exist (fallback to email only)
    let relatedBookingIds: string[] = [];
    if (booking.userId) {
        const related = await prisma.booking.findMany({
            where: { userId: booking.userId },
            select: { id: true },
        });
        relatedBookingIds = related.map(b => b.id);
    } else if (booking.guestEmail && booking.guestName) {
        const related = await prisma.booking.findMany({
            where: {
                userId: null,
                guestEmail: booking.guestEmail,
                guestName: booking.guestName,
            },
            select: { id: true },
        });
        relatedBookingIds = related.map(b => b.id);
    } else if (booking.guestEmail) {
        const related = await prisma.booking.findMany({
            where: { userId: null, guestEmail: booking.guestEmail },
            select: { id: true },
        });
        relatedBookingIds = related.map(b => b.id);
    }

    if (relatedBookingIds.length === 0) {
        return NextResponse.json({ bookingId, logs: [] });
    }

    const logs = await prisma.staffBookingLog.findMany({
        where: { bookingId: { in: relatedBookingIds } },
        orderBy: { createdAt: 'desc' },
        include: {
            booking: {
                select: {
                    id: true,
                    preferredDate: true,
                    preferredTime: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
    });

    return NextResponse.json({
        bookingId,
        logs: logs.map(l => ({
            id: l.id,
            label: l.label,
            text: l.text,
            createdAt: l.createdAt,
            bookingId: l.bookingId,
            booking: l.booking,
        })),
    });
}

