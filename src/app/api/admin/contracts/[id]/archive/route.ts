import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/rateLimit';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    let body: { archiveReason?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const archiveReason = typeof body.archiveReason === 'string' ? body.archiveReason.trim() : '';
    if (!archiveReason) {
        return NextResponse.json({ error: 'A reason for archiving this contract is required.' }, { status: 400 });
    }

    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const ip = getClientIp(req);
    const now = new Date();

    await prisma.contractSigningInvite.update({
        where: { id },
        data: {
            isArchived: true,
            archivedAt: now,
            archiveReason,
        },
    });

    await logContractAudit(id, 'contract_archived', { archiveReason }, ip);

    return NextResponse.json({
        ok: true,
        archivedAt: now.toISOString(),
        archiveReason,
    });
}
