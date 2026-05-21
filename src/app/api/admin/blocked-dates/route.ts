import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List all blocked dates
export async function GET() {
    try {
        const blocked = await prisma.blockedDate.findMany({
            orderBy: { date: 'asc' },
        });
        return NextResponse.json({ blockedDates: blocked });
    } catch (error) {
        console.error('[blocked-dates] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
    }
}

// POST — Block a date ("No More Bookings")
export async function POST(req: NextRequest) {
    try {
        const { date, reason } = await req.json();

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
        }

        // Upsert to handle idempotent calls
        const blocked = await prisma.blockedDate.upsert({
            where: { date },
            update: { reason: reason || null },
            create: { date, reason: reason || null },
        });

        return NextResponse.json({ blockedDate: blocked });
    } catch (error) {
        console.error('[blocked-dates] POST error:', error);
        return NextResponse.json({ error: 'Failed to block date' }, { status: 500 });
    }
}

// DELETE — Unblock a date
export async function DELETE(req: NextRequest) {
    try {
        const { date } = await req.json();

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        await prisma.blockedDate.deleteMany({ where: { date } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[blocked-dates] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 });
    }
}
