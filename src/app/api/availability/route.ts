import { NextRequest, NextResponse } from 'next/server';
import { getDayAvailability } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date')?.trim() || '';

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD.' },
                { status: 400 }
            );
        }

        const availability = await getDayAvailability(date);
        return NextResponse.json(availability, {
            headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
    } catch (error) {
        console.error('[availability] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to check availability' },
            { status: 500 }
        );
    }
}
