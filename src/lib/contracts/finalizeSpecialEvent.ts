import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
    getRequiredSpecialEventInitialIds,
    validateAdminContractPayload,
    validateAdminAcceptancePayload,
    validateClientSpecialEventPayload,
} from '@/lib/contracts/adminContractPayload';
import { renderFrozenContractHtml } from '@/lib/contracts/renderFrozenContract';
import { wrapSpecialEventContractForPdf } from '@/lib/contracts/pdfHtmlShell';
import { renderHtmlToPdfLetter } from '@/lib/contracts/htmlToPdf';
import { uploadContractHtmlSnapshot, uploadContractPdf } from '@/lib/contracts/uploadPdf';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';
import { emailClientBookingConfirmed } from '@/lib/contracts/contractEmails';

type InviteRow = {
    id: string;
    adminPayload: unknown;
    clientPayload: unknown;
    clientSignedAt: Date | null;
    pdfKey?: string | null;
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
    const requiredInitialIds = getRequiredSpecialEventInitialIds(adminParsed.data);
    const clientReparse = validateClientSpecialEventPayload(opts.invite.clientPayload, requiredInitialIds);
    if (!clientReparse.ok) {
        return { ok: false, status: 500, error: 'Invalid stored client execution' };
    }
    const client = clientReparse.data;

    const now = new Date();
    const fin = validateAdminAcceptancePayload(opts.body);
    if (!fin.ok) {
        return { ok: false, status: 400, error: fin.message };
    }
    const adminPrintedName = 'Jojany Lavalle';
    const adminSignDateDisplay = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const finJson = {
        ...fin.data,
        adminPrintedName,
        adminSignDateDisplay,
    } as unknown as Prisma.InputJsonValue;

    const audit = {
        clientSignedAtIso: (opts.invite.clientSignedAt ?? now).toISOString(),
        clientIp: '—',
        clientUa: '—',
    };

    const frozenHtml = renderFrozenContractHtml(adminParsed.data, client, 'final', { ...fin.data, adminPrintedName, adminSignDateDisplay }, audit);

    const htmlKey = `contracts/exec-${opts.invite.id}-final.html`;
    try {
        await uploadContractHtmlSnapshot(htmlKey, wrapSpecialEventContractForPdf(frozenHtml));
    } catch (e) {
        console.error('[contract-finalize] HTML upload:', e);
        return { ok: false, status: 503, error: 'Could not store final HTML snapshot.' };
    }

    const pdfBytes = await renderHtmlToPdfLetter(wrapSpecialEventContractForPdf(frozenHtml));
    if (!pdfBytes) {
        return {
            ok: false,
            status: 503,
            error: 'We could not generate the final PDF. Please try again or contact support.',
        };
    }

    const pdfKey = `contracts/signing-${opts.invite.id}-final.pdf`;
    try {
        await uploadContractPdf(pdfKey, pdfBytes);
    } catch (e) {
        console.error('[contract-finalize] PDF upload:', e);
        return { ok: false, status: 503, error: 'Could not store final PDF.' };
    }

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

    // Send client confirmation email with attached PDF (use existing signed PDF).
    const to = adminParsed.data.email;
    if (to) {
        await emailClientBookingConfirmed({
            to,
            clientName: client.printedName || adminParsed.data.clientLegalName,
            contractNumber: adminParsed.data.contractNumber,
            dateConfirmedLabel: adminSignDateDisplay,
            pdf: Buffer.from(pdfBytes),
        });
    }

    return { ok: true };
}
