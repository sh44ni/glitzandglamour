import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

// GET — List manual blocks, optionally filtered by ?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const where = date ? { date } : {};

    try {
        const blocks = await (prisma as any).manualBlock.findMany({
            where,
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        return NextResponse.json({ blocks });
    } catch (error) {
        console.error('[manual-blocks] GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch manual blocks' }, { status: 500 });
    }
}

// POST — Create a new manual time block
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { date, startTime, endTime, reason } = await req.json();

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
        }
        if (!startTime || !endTime || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
            return NextResponse.json({ error: 'Invalid time format. Use HH:MM (24h).' }, { status: 400 });
        }
        if (startTime >= endTime) {
            return NextResponse.json({ error: 'Start time must be before end time.' }, { status: 400 });
        }

        const block = await (prisma as any).manualBlock.create({
            data: {
                date,
                startTime,
                endTime,
                reason: reason || null,
            },
        });

        return NextResponse.json({ block }, { status: 201 });
    } catch (error) {
        console.error('[manual-blocks] POST error:', error);
        return NextResponse.json({ error: 'Failed to create manual block' }, { status: 500 });
    }
}

// DELETE — Remove a manual block by ID
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'Block ID is required.' }, { status: 400 });
        }

        await (prisma as any).manualBlock.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[manual-blocks] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete manual block' }, { status: 500 });
    }
}
