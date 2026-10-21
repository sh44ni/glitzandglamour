import { load } from 'cheerio';
import { prisma } from '@/lib/prisma';
import { minioGetBuffer } from '@/lib/minioGetBuffer';
import {
    getRequiredSpecialEventInitialIds,
    validateAdminContractPayload,
    validateClientSpecialEventPayload,
} from '@/lib/contracts/adminContractPayload';
import { renderFrozenContractHtml } from '@/lib/contracts/renderFrozenContract';
import { wrapSpecialEventContractForPdf } from '@/lib/contracts/pdfHtmlShell';
import { renderHtmlToPdfLetter } from '@/lib/contracts/htmlToPdf';
import { uploadContractHtmlSnapshot, uploadContractPdf } from '@/lib/contracts/uploadPdf';

/**
 * Regenerates the stored PDF (and HTML snapshot) for a voided special-event contract
 * so the contract letterhead displays Status: Voided instead of Fully Executed.
 */
export async function regenerateVoidedContractPdf(
    inviteId: string
): Promise<{ pdfKey: string; pdfBytes: Uint8Array } | null> {
    const inv = await prisma.contractSigningInvite.findUnique({
        where: { id: inviteId },
        select: {
            id: true,
            adminPayload: true,
            clientPayload: true,
            adminFinalizePayload: true,
            clientSignedAt: true,
            adminSignedAt: true,
            submittedIp: true,
            submittedUa: true,
            finalExecutionHtmlKey: true,
            executionHtmlKey: true,
        },
    });

    if (!inv) return null;

    let wrappedHtml: string | null = null;

    // 1. Primary path: rebuild from stored payloads with phase = 'voided'
    if (inv.adminPayload && inv.clientPayload) {
        const adminParsed = validateAdminContractPayload(inv.adminPayload);
        if (adminParsed.ok) {
            const requiredInitialIds = getRequiredSpecialEventInitialIds(adminParsed.data);
            const clientReparse = validateClientSpecialEventPayload(inv.clientPayload, requiredInitialIds);
            if (clientReparse.ok) {
                let finalizeData: {
                    retainerReceived: true;
                    adminPrintedName: string;
                    adminSignDateDisplay: string;
                    signaturePngBase64?: string;
                } | null = null;

                if (inv.adminFinalizePayload && typeof inv.adminFinalizePayload === 'object') {
                    const fp = inv.adminFinalizePayload as Record<string, unknown>;
                    finalizeData = {
                        retainerReceived: true,
                        adminPrintedName:
                            typeof fp.adminPrintedName === 'string' && fp.adminPrintedName.trim()
                                ? fp.adminPrintedName.trim()
                                : 'Jojany Lavalle',
                        adminSignDateDisplay:
                            typeof fp.adminSignDateDisplay === 'string' && fp.adminSignDateDisplay.trim()
                                ? fp.adminSignDateDisplay.trim()
                                : (inv.adminSignedAt ?? new Date()).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                  }),
                        signaturePngBase64:
                            typeof fp.signaturePngBase64 === 'string' ? fp.signaturePngBase64 : undefined,
                    };
                }

                const audit = {
                    clientSignedAtIso: (inv.clientSignedAt ?? new Date()).toISOString(),
                    clientIp: inv.submittedIp || '—',
                    clientUa: inv.submittedUa || '—',
                };

                const frozenHtml = renderFrozenContractHtml(
                    adminParsed.data,
                    clientReparse.data,
                    'voided',
                    finalizeData,
                    audit
                );
                wrappedHtml = wrapSpecialEventContractForPdf(frozenHtml);
            }
        }
    }

    // 2. Fallback path: patch existing HTML snapshot in object storage
    if (!wrappedHtml) {
        const existingHtmlKey = inv.finalExecutionHtmlKey || inv.executionHtmlKey;
        if (existingHtmlKey) {
            const existingBuf = await minioGetBuffer(existingHtmlKey);
            if (existingBuf) {
                const rawHtml = existingBuf.buffer.toString('utf8');
                const $ = load(rawHtml);
                $('#contract_status')
                    .text('Voided')
                    .attr('style', 'color:#ff6b6b;font-weight:700;letter-spacing:0.03em');
                wrappedHtml = $.html();
            }
        }
    }

    if (!wrappedHtml) return null;

    const voidedHtmlKey = `contracts/exec-${inv.id}-voided.html`;
    try {
        await uploadContractHtmlSnapshot(voidedHtmlKey, wrappedHtml);
    } catch (e) {
        console.error('[contract-void] Voided HTML snapshot upload failed:', e);
    }

    const pdfBytes = await renderHtmlToPdfLetter(wrappedHtml);
    if (!pdfBytes) {
        return null;
    }

    const voidedPdfKey = `contracts/signing-${inv.id}-voided.pdf`;
    try {
        await uploadContractPdf(voidedPdfKey, pdfBytes);
    } catch (e) {
        console.error('[contract-void] Voided PDF upload failed:', e);
        return null;
    }

    await prisma.contractSigningInvite.update({
        where: { id: inv.id },
        data: {
            pdfKey: voidedPdfKey,
        },
    });

    return { pdfKey: voidedPdfKey, pdfBytes };
}
