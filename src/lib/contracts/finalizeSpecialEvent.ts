import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
    validateAdminContractPayload,
    validateAdminFinalizePayload,
    validateClientSpecialEventPayload,
} from '@/lib/contracts/adminContractPayload';
import { renderFrozenContractHtml } from '@/lib/contracts/renderFrozenContract';
import { renderHtmlToPdfLetter } from '@/lib/contracts/htmlToPdf';
import { uploadContractHtmlSnapshot, uploadContractPdf } from '@/lib/contracts/uploadPdf';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';

type InviteRow = {
    id: string;
    adminPayload: unknown;
    clientPayload: unknown;
    clientSignedAt: Date | null;
};

export async function finalizeSpecialEventContract(opts: {
    invite: InviteRow;
    body: unknown;
    ip: string;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
    const adminParsed = validateAdminContractPayload(opts.invite.adminPayload);
    if (!adminParsed.ok) {
        return { ok: false, status: 500, error: 'Invalid stored contract' };
    }
    const clientReparse = validateClientSpecialEventPayload(opts.invite.clientPayload);
    if (!clientReparse.ok) {
        return { ok: false, status: 500, error: 'Invalid stored client execution' };
    }
    const client = clientReparse.data;

    const fin = validateAdminFinalizePayload(opts.body);
    if (!fin.ok) {
        return { ok: false, status: 400, error: fin.message };
    }

    let _sigCheck: Uint8Array;
    try {
        _sigCheck = Uint8Array.from(Buffer.from(fin.data.signaturePngBase64, 'base64'));
    } catch {
        return { ok: false, status: 400, error: 'Invalid studio signature data' };
    }

    const now = new Date();
    const audit = {
        clientSignedAtIso: (opts.invite.clientSignedAt ?? now).toISOString(),
        clientIp: '—',
        clientUa: '—',
    };

    const frozenHtml = renderFrozenContractHtml(
        adminParsed.data,
        client,
        'final',
        fin.data,
        audit
    );

    const htmlKey = `contracts/exec-${opts.invite.id}-final.html`;
    try {
        await uploadContractHtmlSnapshot(htmlKey, frozenHtml);
    } catch (e) {
        console.error('[contract-finalize] HTML upload:', e);
        return { ok: false, status: 503, error: 'Could not store final HTML snapshot.' };
    }

    const pdfBytes = await renderHtmlToPdfLetter(frozenHtml);
    if (!pdfBytes) {
        return {
            ok: false,
            status: 503,
            error:
                'PDF engine is not configured. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH to a Chrome/Chromium binary.',
        };
    }

    const pdfKey = `contracts/signing-${opts.invite.id}-final.pdf`;
    try {
        await uploadContractPdf(pdfKey, pdfBytes);
    } catch (e) {
        console.error('[contract-finalize] PDF upload:', e);
        return { ok: false, status: 503, error: 'Could not store final PDF.' };
    }

    const finJson = fin.data as unknown as Prisma.InputJsonValue;

    await prisma.contractSigningInvite.update({
        where: { id: opts.invite.id },
        data: {
            lifecycleStatus: 'SIGNED',
            adminFinalizePayload: finJson,
            finalExecutionHtmlKey: htmlKey,
            pdfKey,
            adminSignedAt: now,
            retainerReceived: true,
            retainerReceivedAt: now,
        },
    });

    await logContractAudit(opts.invite.id, 'studio_finalized', { htmlKey, pdfKey }, opts.ip);

    return { ok: true };
}
