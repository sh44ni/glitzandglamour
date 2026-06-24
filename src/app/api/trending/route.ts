import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';

// Public endpoint — returns top 3 most booked active services
// Used by the mobile app home screen "Trending Services" widget
export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            include: {
                _count: { select: { bookings: true } },
            },
            orderBy: { bookings: { _count: 'desc' } },
            take: 3,
        });

        return NextResponse.json({
            trending: services.map(s => ({
                id: s.id,
                name: s.name,
                category: s.category,
                priceLabel: s.priceLabel,
                imageUrl: resolveImageUrl(s.imageUrl) ?? null,
                bookingCount: s._count.bookings,
            })),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch trending services' }, { status: 500 });
    }
}
