import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Retrieve all public special event page content
export async function GET(req: NextRequest) {
    try {
        const [hero, heroImages, categories, services] = await Promise.all([
            prisma.specialEventHero.findFirst({ where: { isActive: true } }),
            prisma.specialEventHeroImage.findMany({ orderBy: { order: 'asc' } }),
            prisma.specialEventCategory.findMany({ orderBy: { displayOrder: 'asc' } }),
            prisma.specialEventService.findMany({ orderBy: { displayOrder: 'asc' } }),
        ]);
        
        return NextResponse.json({ hero, heroImages, categories, services });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }
}
