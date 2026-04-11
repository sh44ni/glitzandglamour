import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { validateAdminContractPayload, validateClientSpecialEventPayload } from '@/lib/contracts/adminContractPayload';
import { renderFrozenContractHtml } from '@/lib/contracts/renderFrozenContract';
import { wrapSpecialEventContractForPdf } from '@/lib/contracts/pdfHtmlShell';
import { renderHtmlToPdfLetter } from '@/lib/contracts/htmlToPdf';
import { uploadContractHtmlSnapshot, uploadContractPdf } from '@/lib/contracts/uploadPdf';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';
import {
    emailAdminClientSigned,
    emailClientContractReceived,
} from '@/lib/contracts/contractEmails';

type InviteRow = {
    id: string;
    adminPayload: unknown;
    lifecycleStatus: string;
    expiresAt: Date;
};

export async function submitSpecialEventContract(opts: {
    invite: InviteRow;
    body: unknown;
    ip: string;
    ua: string;
}): Promise<{ ok: true; referenceCode: string } | { ok: false; status: number; error: string }> {
    const { invite, body, ip, ua } = opts;
    const now = new Date();

    if (invite.lifecycleStatus !== 'SENT') {
        return { ok: false, status: 409, error: 'This contract is not awaiting client signature.' };
    }

    const adminParsed = validateAdminContractPayload(invite.adminPayload);
    if (!adminParsed.ok) {
        return { ok: false, status: 500, error: 'Contract data is invalid. Contact the studio.' };
    }

    const clientParsed = validateClientSpecialEventPayload(body);
    if (!clientParsed.ok) {
        return { ok: false, status: 400, error: clientParsed.message };
    }

    let sigBytes: Uint8Array;
    try {
        sigBytes = Uint8Array.from(Buffer.from(clientParsed.data.signaturePngBase64, 'base64'));
    } catch {
        return { ok: false, status: 400, error: 'Invalid signature data' };
    }
    if (sigBytes.length < 40) {
        return { ok: false, status: 400, error: 'Invalid signature data' };
    }

    const referenceCode = `GGS-${Date.now().toString().slice(-6)}`;
    const generatedAtIso = now.toISOString();

    const audit = {
        clientSignedAtIso: generatedAtIso,
        clientIp: ip,
        clientUa: ua.slice(0, 500),
    };

    const frozenHtml = renderFrozenContractHtml(adminParsed.data, clientParsed.data, 'client_signed', null, audit);

    const htmlKey = `contracts/exec-${invite.id}-client.html`;
    try {
        await uploadContractHtmlSnapshot(htmlKey, wrapSpecialEventContractForPdf(frozenHtml));
    } catch (e) {
        console.error('[contract-sign] HTML upload:', e);
        return { ok: false, status: 503, error: 'Could not store executed contract. Please contact the studio.' };
    }

    let pdfBytes = await renderHtmlToPdfLetter(wrapSpecialEventContractForPdf(frozenHtml));
    if (!pdfBytes) {
        return {
            ok: false,
            status: 503,
            error: 'We could not generate your PDF right now. Please try again or contact the studio.',
        };
    }

    const pdfKey = `contracts/signing-${invite.id}.pdf`;
    try {
        await uploadContractPdf(pdfKey, pdfBytes);
    } catch (e) {
        console.error('[contract-sign] PDF upload:', e);
        return { ok: false, status: 503, error: 'Could not store signed PDF. Please contact the studio.' };
    }

    const storedClient = {
        ...clientParsed.data,
        mode: 'special-events-v1' as const,
        geoConsent: true as const,
    } as unknown as Prisma.InputJsonValue;
    const updated = await prisma.contractSigningInvite.updateMany({
        where: {
            id: invite.id,
            lifecycleStatus: 'SENT',
            expiresAt: { gt: now },
        },
        data: {
            lifecycleStatus: 'CLIENT_SIGNED',
            status: 'COMPLETED',
            completedAt: now,
            clientSignedAt: now,
            clientPayload: storedClient,
            formData: storedClient,
            referenceCode,
            executionHtmlKey: htmlKey,
            pdfKey,
            clientPhasePdfKey: pdfKey,
            submittedIp: ip,
            submittedUa: ua.slice(0, 500),
        },
    });

    if (updated.count === 0) {
        return { ok: false, status: 409, error: 'This agreement was already submitted or is no longer available.' };
    }

    await logContractAudit(invite.id, 'client_signed', { referenceCode, htmlKey, pdfKey }, ip);

    const owner = process.env.OWNER_NOTIFICATION_ID;
    if (owner) {
        await emailAdminClientSigned({
            to: owner,
            contractNumber: adminParsed.data.contractNumber,
            clientName: clientParsed.data.printedName,
            referenceCode,
        });
    }
    if (adminParsed.data.email) {
        await emailClientContractReceived({
            to: adminParsed.data.email,
            contractNumber: adminParsed.data.contractNumber,
        });
    }

    return { ok: true, referenceCode };
}
