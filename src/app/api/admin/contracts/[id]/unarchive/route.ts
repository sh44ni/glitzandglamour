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
    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const ip = getClientIp(req);

    await prisma.contractSigningInvite.update({
        where: { id },
        data: {
            isArchived: false,
            archivedAt: null,
            archiveReason: null,
        },
    });

    await logContractAudit(id, 'contract_unarchived', {}, ip);

    return NextResponse.json({ ok: true });
}
