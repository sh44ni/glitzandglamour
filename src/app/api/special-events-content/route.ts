import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public read-only — no auth required
export async function GET() {
    try {
        const [hero, heroImages, categories, services] = await Promise.all([
            prisma.specialEventHero.findFirst({ where: { isActive: true } }),
            prisma.specialEventHeroImage.findMany({ orderBy: { order: 'asc' } }),
            prisma.specialEventCategory.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
            prisma.specialEventService.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
        ]);
        return NextResponse.json({ hero, heroImages, categories, services });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }
}
