import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET — list all campaigns with summary
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const campaigns = await (prisma as any).smsCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { recipients: true } },
        },
    });

    return NextResponse.json({ campaigns });
}

// POST — create a new campaign (DRAFT)
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, message, recipients } = body as {
        name: string;
        message: string;
        recipients: { phone: string; name: string; email?: string; hasConsent: boolean }[];
    };

    if (!name?.trim()) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    if (!recipients?.length) return NextResponse.json({ error: 'At least one recipient is required' }, { status: 400 });

    const campaign = await (prisma as any).smsCampaign.create({
        data: {
            name: name.trim(),
            message: message.trim(),
            totalRecipients: recipients.length,
            recipients: {
                create: recipients.map((r) => ({
                    phone: r.phone,
                    name: r.name,
                    email: r.email || null,
                    hasConsent: r.hasConsent,
                })),
            },
        },
        include: { recipients: true },
    });

    return NextResponse.json({ campaign });
}

// DELETE — delete a campaign
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });

    await (prisma as any).smsCampaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
