import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServiceContent } from '@/lib/serviceContent';

type Faq = { q: string; a: string };

function asFaqs(value: unknown): Faq[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((x: any) => ({ q: String(x?.q || '').trim(), a: String(x?.a || '').trim() }))
        .filter(x => x.q && x.a);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const [service, relatedRaw] = await Promise.all([
            prisma.service.findUnique({ where: { id } }),
            // Fetch related after we know the category — done in sequence below
            Promise.resolve(null),
        ]);

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Related services in same category (excluding this one)
        const related = await prisma.service.findMany({
            where: { isActive: true, category: service.category, NOT: { id: service.id } },
            orderBy: { displayOrder: 'asc' },
            take: 4,
            select: { id: true, name: true, slug: true, priceLabel: true, imageUrl: true, category: true },
        });

        // Merge DB faqs with category defaults
        const defaults = getServiceContent(service.category);
        const overrideFaqs = asFaqs(service.faqs);
        const faqs: Faq[] = overrideFaqs.length ? overrideFaqs : defaults.faqs;

        // Merge long description & benefits with defaults
        const longDescription = service.longDescription?.trim() || defaults.descriptionParagraphs.join('\n\n');
        const benefits = service.benefits?.trim() || defaults.includedBullets.map(b => `- ${b}`).join('\n');

        return NextResponse.json({
            service: {
                ...service,
                longDescription,
                benefits,
                faqs,
            },
            related,
            defaults: {
                headline: defaults.headline,
            },
        });
    } catch (error) {
        console.error('[service detail]', error);
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }
}
