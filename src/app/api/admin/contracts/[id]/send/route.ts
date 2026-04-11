import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { dispatchContractInviteEmails, markSpecialInviteSent } from '@/lib/contracts/releaseContractInvite';

function appOrigin(req: NextRequest): string {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    if (base) return base;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    return host ? `${proto}://${host}` : '';
}

type Ctx = { params: Promise<{ id: string }> };

/** POST — release draft: DRAFT → SENT, email client (legacy second step) */
export async function POST(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv || !inv.adminPayload) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const parsed = validateAdminContractPayload(inv.adminPayload);
    if (!parsed.ok) {
        return NextResponse.json({ error: 'Invalid stored contract' }, { status: 400 });
    }

    const origin = appOrigin(req);
    const signPath = `/sign/${inv.token}`;
    const signUrl = origin ? `${origin}${signPath}` : signPath;

    if (inv.lifecycleStatus === 'DRAFT') {
        await markSpecialInviteSent({ inviteId: id, admin: parsed.data });
    } else if (inv.lifecycleStatus === 'SENT' && inv.status === 'PENDING') {
        /* resend emails only */
    } else {
        return NextResponse.json({ error: 'Cannot send or resend this contract' }, { status: 409 });
    }

    const { clientEmailed } = await dispatchContractInviteEmails(id, signUrl, parsed.data);

    return NextResponse.json({
        ok: true,
        signUrl,
        clientEmailed,
    });
}
