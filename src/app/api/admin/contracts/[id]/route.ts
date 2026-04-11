import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';

type Ctx = { params: Promise<{ id: string }> };

/** PATCH — update draft admin payload only */
export async function PATCH(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    let body: { adminPayload?: unknown };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (inv.lifecycleStatus !== 'DRAFT') {
        return NextResponse.json({ error: 'Only draft contracts can be edited' }, { status: 409 });
    }

    const parsed = validateAdminContractPayload(body.adminPayload);
    if (!parsed.ok) {
        return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    await prisma.contractSigningInvite.update({
        where: { id },
        data: {
            adminPayload: parsed.data as Prisma.InputJsonValue,
            clientHintName: parsed.data.clientLegalName,
            clientHintEmail: parsed.data.email,
        },
    });

    await logContractAudit(id, 'admin_draft_saved', { contractNumber: parsed.data.contractNumber }, null);

    return NextResponse.json({ ok: true });
}
