import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { load } from 'cheerio';
import { getRequiredSpecialEventInitialIds, validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';
import {
    extractLetterheadAndWizardChunks,
    getWizardStepLabels,
    parseWizardChunkToNative,
    readSpecialEventsContractFragmentHtml,
} from '@/lib/contracts/contractFragment';
import {
    applyAdminFieldsToContract,
    stripOptionalContractSectionsFromContractDom,
} from '@/lib/contracts/renderFrozenContract';

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

    const contractType = parsed.data.contractType;
    const raw = readSpecialEventsContractFragmentHtml(contractType);
    const $ = load(raw);
    applyAdminFieldsToContract($, parsed.data);
    stripOptionalContractSectionsFromContractDom($, parsed.data);
    const filled = $.html();

    const { chunks: rawChunks } = extractLetterheadAndWizardChunks(filled);
    const labels = [...getWizardStepLabels(contractType)];

    if (rawChunks.length !== labels.length) {
        console.error('[wizard] chunk count mismatch', { chunks: rawChunks.length, labels: labels.length });
        return NextResponse.json({ error: 'Contract configuration error' }, { status: 500 });
    }

    const allChunks = rawChunks.map((html) => parseWizardChunkToNative(html));
    const requiredInitialIds = getRequiredSpecialEventInitialIds(parsed.data);

    /* Remove the last chunk (Section 31: Electronic consent & signatures)
       because the signing UI is handled by the dedicated sign step. */
    const chunks = allChunks.slice(0, -1);
    const stepLabels = labels.slice(0, -1);

    return NextResponse.json({
        ok: true as const,
        chunks,
        stepLabels,
        requiredInitialIds,
    });
}
