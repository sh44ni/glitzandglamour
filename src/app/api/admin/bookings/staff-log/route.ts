import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const bookingListInclude = {
    user: { select: { name: true, email: true, phone: true, image: true } },
    service: { select: { name: true, priceLabel: true, category: true } },
    staffLogs: { orderBy: { createdAt: 'desc' as const } },
};

async function fetchBookingForAdmin(bookingId: string) {
    return prisma.booking.findUnique({
        where: { id: bookingId },
        include: bookingListInclude,
    });
}

/** POST — append a staff log entry (label + text) for a booking */
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bookingId, label, text } = body;
    if (!bookingId || !text?.trim()) {
        return NextResponse.json({ error: 'bookingId and text are required' }, { status: 400 });
    }

    const exists = await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const labelTrim = typeof label === 'string' ? label.trim() : '';

    await prisma.staffBookingLog.create({
        data: {
            bookingId,
            label: labelTrim,
            text: text.trim(),
        },
    });

    const booking = await fetchBookingForAdmin(bookingId);
    return NextResponse.json({ booking });
}

/** DELETE — remove a staff log entry */
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const logId = searchParams.get('logId');
    const bookingId = searchParams.get('bookingId');
    if (!logId || !bookingId) {
        return NextResponse.json({ error: 'logId and bookingId are required' }, { status: 400 });
    }

    const log = await prisma.staffBookingLog.findUnique({ where: { id: logId } });
    if (!log || log.bookingId !== bookingId) {
        return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    await prisma.staffBookingLog.delete({ where: { id: logId } });

    const booking = await fetchBookingForAdmin(bookingId);
    return NextResponse.json({ booking });
}
