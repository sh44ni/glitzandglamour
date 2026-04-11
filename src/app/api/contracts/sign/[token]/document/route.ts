import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildEmbeddedSpecialEventHtml } from '@/lib/contracts/injectSpecialEventEmbed';
import { validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';
import { getClientIp } from '@/lib/rateLimit';

type Ctx = { params: Promise<{ token: string }> };

/**
 * Full special-events agreement HTML for embedding (legal text is unchanged from the template file).
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    if (!token || token.length < 8) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const invite = await prisma.contractSigningInvite.findUnique({
        where: { token },
    });

    if (!invite || !invite.adminPayload) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const now = new Date();
    if (invite.expiresAt < now) {
        return NextResponse.json({ error: 'Expired' }, { status: 410 });
    }

    if (invite.lifecycleStatus !== 'SENT') {
        return NextResponse.json({ error: 'Not available' }, { status: 404 });
    }

    if (invite.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    const parsed = validateAdminContractPayload(invite.adminPayload);
    if (!parsed.ok) {
        return NextResponse.json({ error: 'Invalid contract data' }, { status: 500 });
    }

    if (!invite.openedFirstAt) {
        const ip = getClientIp(_req);
        await prisma.contractSigningInvite.update({
            where: { id: invite.id },
            data: { openedFirstAt: now },
        });
        await logContractAudit(invite.id, 'client_opened_document', {}, ip);
    }

    const html = buildEmbeddedSpecialEventHtml(parsed.data, token);

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
