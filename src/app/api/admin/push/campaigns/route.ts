import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

/**
 * GET /api/admin/push/campaigns
 * Returns push campaign history + total registered token count.
 */
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [campaigns, tokenCount] = await Promise.all([
            (prisma as any).pushCampaign.findMany({
                orderBy: { sentAt: 'desc' },
                take: 50,
            }),
            (prisma as any).pushToken.count(),
        ]);

        return NextResponse.json({ campaigns, tokenCount });
    } catch (err) {
        console.error('[push/campaigns]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
