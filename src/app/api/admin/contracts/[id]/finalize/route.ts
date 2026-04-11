import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { finalizeSpecialEventContract } from '@/lib/contracts/finalizeSpecialEvent';
import { getClientIp } from '@/lib/rateLimit';

type Ctx = { params: Promise<{ id: string }> };

/** POST — retainer + studio countersignature (CLIENT_SIGNED → SIGNED) */
export async function POST(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv || !inv.adminPayload || !inv.clientPayload) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (inv.lifecycleStatus !== 'CLIENT_SIGNED') {
        return NextResponse.json({ error: 'Client must sign before finalizing' }, { status: 409 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const result = await finalizeSpecialEventContract({
        invite: {
            id: inv.id,
            adminPayload: inv.adminPayload,
            clientPayload: inv.clientPayload,
            clientSignedAt: inv.clientSignedAt,
        },
        body,
        ip,
    });

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
}
