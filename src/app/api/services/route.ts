import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';

const CATEGORY_META: Record<string, { label: string; emoji: string; order: number }> = {
    nails:     { label: 'Nail Services', emoji: '💅', order: 0 },
    pedicures: { label: 'Pedicures',     emoji: '🦶', order: 1 },
    haircolor: { label: 'Hair Color',    emoji: '🎨', order: 2 },
    haircuts:  { label: 'Haircuts',      emoji: '✂️', order: 3 },
    waxing:    { label: 'Waxing',        emoji: '✨', order: 4 },
    facials:   { label: 'Facials',       emoji: '🧖', order: 5 },
};

export async function GET() {
    try {
        const [services, dbCategories] = await Promise.all([
            prisma.service.findMany({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
            }),
            prisma.serviceCategory.findMany({
                orderBy: { order: 'asc' },
            }),
        ]);

        // If the service_categories table is empty (not yet seeded on this environment),
        // derive categories from the services themselves so the API never returns [].
        let categories = dbCategories;
        if (categories.length === 0) {
            const seenKeys = new Set<string>();
            const derived: typeof dbCategories = [];
            for (const svc of services) {
                if (!svc.category || seenKeys.has(svc.category)) continue;
                seenKeys.add(svc.category);
                const meta = CATEGORY_META[svc.category];
                derived.push({
                    id:       svc.category,
                    key:      svc.category,
                    label:    meta?.label  ?? svc.category,
                    emoji:    meta?.emoji  ?? '✨',
                    imageUrl: null,
                    order:    meta?.order  ?? derived.length,
                });
            }
            derived.sort((a, b) => a.order - b.order);
            categories = derived;
        }

        return NextResponse.json({
            services: services.map(s => ({ ...s, imageUrl: resolveImageUrl(s.imageUrl) ?? s.imageUrl })),
            categories: categories.map(c => ({ ...c, imageUrl: resolveImageUrl(c.imageUrl) ?? c.imageUrl })),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}
