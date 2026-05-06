import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [services, categories] = await Promise.all([
            prisma.service.findMany({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
            }),
            prisma.serviceCategory.findMany({
                orderBy: { order: 'asc' },
            }),
        ]);
        return NextResponse.json({ services, categories });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}
