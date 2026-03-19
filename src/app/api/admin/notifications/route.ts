import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type'); // 'sms' | 'email' | null
    const status = searchParams.get('status'); // 'sent' | 'failed' | 'skipped' | null
    const limit = 50;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [logs, total, stats] = await Promise.all([
        prisma.notificationLog.findMany({
            where,
            include: { booking: { select: { guestName: true, user: { select: { name: true } }, service: { select: { name: true } } } } },
            orderBy: { sentAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit,
        }),
        prisma.notificationLog.count({ where }),
        prisma.notificationLog.groupBy({
            by: ['type', 'status'],
            _count: { id: true },
        }),
    ]);

    // Shape stats
    const summary = {
        sms: { sent: 0, failed: 0, skipped: 0 },
        email: { sent: 0, failed: 0, skipped: 0 },
    };
    for (const s of stats) {
        const t = s.type as 'sms' | 'email';
        const st = s.status as 'sent' | 'failed' | 'skipped';
        if (summary[t] && summary[t][st] !== undefined) {
            summary[t][st] = s._count.id;
        }
    }

    return NextResponse.json({ logs, total, page, limit, summary });
}
