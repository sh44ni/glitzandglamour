import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';
import { emailContractInviteToClient, emailAdminContractSent } from '@/lib/contracts/contractEmails';

function appOrigin(req: NextRequest): string {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    if (base) return base;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    return host ? `${proto}://${host}` : '';
}

type Ctx = { params: Promise<{ id: string }> };

/** POST — email client the signing link (DRAFT → SENT) */
export async function POST(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv || !inv.adminPayload) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (inv.lifecycleStatus !== 'DRAFT') {
        return NextResponse.json({ error: 'Contract is not a draft' }, { status: 409 });
    }

    const parsed = validateAdminContractPayload(inv.adminPayload);
    if (!parsed.ok) {
        return NextResponse.json({ error: 'Invalid stored contract' }, { status: 400 });
    }

    const now = new Date();
    const origin = appOrigin(req);
    const signPath = `/sign/${inv.token}`;
    const signUrl = origin ? `${origin}${signPath}` : signPath;

    await prisma.contractSigningInvite.update({
        where: { id },
        data: {
            lifecycleStatus: 'SENT',
            sentAt: now,
            clientHintName: parsed.data.clientLegalName,
            clientHintEmail: parsed.data.email,
        },
    });

    await logContractAudit(id, 'admin_sent_to_client', { signUrl }, null);

    const emailed = await emailContractInviteToClient({
        to: parsed.data.email,
        clientName: parsed.data.clientLegalName,
        contractNumber: parsed.data.contractNumber,
        eventDateLabel: parsed.data.eventDate || '—',
        signUrl,
    });

    const owner = process.env.OWNER_NOTIFICATION_ID;
    if (owner) {
        await emailAdminContractSent({
            to: owner,
            contractNumber: parsed.data.contractNumber,
            clientEmail: parsed.data.email,
        });
    }

    return NextResponse.json({
        ok: true,
        signUrl,
        clientEmailed: emailed,
    });
}
