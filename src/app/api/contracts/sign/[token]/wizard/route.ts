import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { load } from 'cheerio';
import { validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';
import {
    CONTRACT_WIZARD_STEP_LABELS,
    extractLetterheadAndWizardChunks,
    readSpecialEventsContractFragmentHtml,
} from '@/lib/contracts/contractFragment';
import { applyAdminFieldsToContract } from '@/lib/contracts/renderFrozenContract';

type Ctx = { params: Promise<{ token: string }> };

/**
 * Pre-rendered agreement slices for the native sign wizard (admin-filled, same markup as PDF).
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    if (!token || token.length < 8) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const invite = await prisma.contractSigningInvite.findUnique({
        where: { token },
        select: {
            adminPayload: true,
            expiresAt: true,
            lifecycleStatus: true,
            status: true,
        },
    });

    if (!invite?.adminPayload) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const now = new Date();
    if (invite.expiresAt < now) {
        return NextResponse.json({ error: 'Expired' }, { status: 410 });
    }

    if (invite.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    if (invite.lifecycleStatus !== 'SENT') {
        return NextResponse.json({ error: 'Not available' }, { status: 404 });
    }

    const parsed = validateAdminContractPayload(invite.adminPayload);
    if (!parsed.ok) {
        return NextResponse.json({ error: 'Invalid contract data' }, { status: 500 });
    }

    const raw = readSpecialEventsContractFragmentHtml();
    const $ = load(raw);
    applyAdminFieldsToContract($, parsed.data);
    const filled = $.html();

    const { letterheadHtml, chunks } = extractLetterheadAndWizardChunks(filled);
    const labels = [...CONTRACT_WIZARD_STEP_LABELS];

    if (chunks.length !== labels.length) {
        console.error('[wizard] chunk count mismatch', { chunks: chunks.length, labels: labels.length });
        return NextResponse.json({ error: 'Contract configuration error' }, { status: 500 });
    }

    return NextResponse.json({
        ok: true as const,
        letterheadHtml,
        chunks,
        stepLabels: labels,
    });
}
