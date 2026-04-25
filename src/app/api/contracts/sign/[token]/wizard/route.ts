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

    /* Strip interactive signature chrome — these are handled by the dedicated
       signing step and would otherwise render as garbled prose in the wizard. */
    $('.sig-block').remove();          // Client signature canvas/input + printed name block
    $('.exec-record').remove();        // Execution record metadata
    $('.geo-consent-row').remove();    // Data-collection consent checkbox
    $('.sig-line-section').remove();   // Client + Artist signature lines
    /* Remove the tiny "By signing above…" confirmation paragraph inside Section 31 */
    $('p').filter(function () {
        return $(this).text().includes('By signing above and checking the box');
    }).remove();

    const filled = $.html();

    const { chunks: rawChunks } = extractLetterheadAndWizardChunks(filled);
    const labels = [...getWizardStepLabels(contractType)];

    if (rawChunks.length !== labels.length) {
        console.error('[wizard] chunk count mismatch', { chunks: rawChunks.length, labels: labels.length });
        return NextResponse.json({ error: 'Contract configuration error' }, { status: 500 });
    }

    const allChunks = rawChunks.map((html) => parseWizardChunkToNative(html));
    const requiredInitialIds = getRequiredSpecialEventInitialIds(parsed.data);

    /* All chunks — including the last one (Sections 30–31: Data Collection &
       Privacy + Electronic Consent & Signatures) — are sent to the client so
       the user reads Section 30 in-wizard. The dedicated sign step that
       follows provides the interactive signature / consent UI for Section 31. */
    const chunks = allChunks;
    const stepLabels = labels;

    return NextResponse.json({
        ok: true as const,
        chunks,
        stepLabels,
        requiredInitialIds,
    });
}
