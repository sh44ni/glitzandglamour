import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';

    if (!['sms_leads', 'photo_consent', 'se_clients'].includes(type)) {
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    let rows: { name: string; email: string; phone: string; date: string; detail: string }[] = [];

    if (type === 'sms_leads' || type === 'photo_consent') {
        const consentType = type === 'sms_leads' ? 'promo_sms' : 'image_usage';

        const consents = await (prisma as any).bookingConsent.findMany({
            where: { consentType, granted: true, userId: { not: null } },
            select: {
                createdAt: true,
                userId: true,
                booking: {
                    select: {
                        preferredDate: true,
                        service: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Dedupe by userId — keep the most recent consent
        const seen = new Set<string>();
        const users = await (prisma as any).user.findMany({
            where: { id: { in: consents.map((c: any) => c.userId) } },
            select: { id: true, name: true, email: true, phone: true },
        });
        const userMap: Map<string, { id: string; name: string; email: string; phone: string | null }> = new Map(users.map((u: any) => [u.id, u]));

        for (const c of consents) {
            if (seen.has(c.userId)) continue;
            seen.add(c.userId);
            const u = userMap.get(c.userId);
            if (!u) continue;
            rows.push({
                name: u.name || '',
                email: u.email || '',
                phone: u.phone || '',
                date: new Date(c.createdAt).toISOString().split('T')[0],
                detail: c.booking?.service?.name || c.booking?.preferredDate || '',
            });
        }
    } else if (type === 'se_clients') {
        const seClients = await prisma.specialEventClient.findMany({
            where: { linkedUserId: { not: null } },
            select: {
                createdAt: true,
                notes: true,
                linkedUserId: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const linkedUserIds = seClients.map(se => se.linkedUserId).filter(Boolean) as string[];
        const linkedUsers = linkedUserIds.length > 0
            ? await prisma.user.findMany({
                where: { id: { in: linkedUserIds } },
                select: { id: true, name: true, email: true, phone: true },
            })
            : [];
        const linkedUserMap: Map<string, { name: string; email: string; phone: string | null }> = new Map(linkedUsers.map(u => [u.id, u]));

        const seen = new Set<string>();
        for (const se of seClients) {
            const u = se.linkedUserId ? linkedUserMap.get(se.linkedUserId) : null;
            if (!u || seen.has(u.email)) continue;
            seen.add(u.email);
            rows.push({
                name: u.name || '',
                email: u.email || '',
                phone: u.phone || '',
                date: new Date(se.createdAt).toISOString().split('T')[0],
                detail: se.notes || '',
            });
        }
    }

    // Build CSV
    const label = type === 'sms_leads' ? 'SMS Leads' : type === 'photo_consent' ? 'Photo Consent' : 'SE Clients';
    const detailHeader = type === 'se_clients' ? 'Event Name' : 'Service';
    const header = `Name,Email,Phone,Consent Date,${detailHeader}`;
    const csvRows = rows.map(r =>
        [r.name, r.email, r.phone, r.date, r.detail]
            .map(v => `"${(v || '').replace(/"/g, '""')}"`)
            .join(',')
    );
    const csv = [header, ...csvRows].join('\n');

    const filename = `${label.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
