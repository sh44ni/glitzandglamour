import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public read-only endpoint — safe for browser fetch on the homepage.
// Admin write operations (POST/DELETE) remain at /api/admin/slider.
export async function GET() {
    try {
        const images = await prisma.sliderImage.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ images });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch slider images.' }, { status: 500 });
    }
}
