import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/rateLimit';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';
import { emailAdminContractVoided, emailClientContractVoided } from '@/lib/contracts/contractEmails';
import { regenerateVoidedContractPdf } from '@/lib/contracts/voidSpecialEventPdf';
import { sendAdminContractVoidedSMS, sendContractVoidedSMS } from '@/lib/sms';
import type { ContractType } from '@/lib/contracts/specialEventConstants';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    let body: { reasonInternal?: string; noteClient?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const reasonInternal = typeof body.reasonInternal === 'string' ? body.reasonInternal.trim() : '';
    const noteClient = typeof body.noteClient === 'string' ? body.noteClient.trim() : '';

    if (!reasonInternal) {
        return NextResponse.json({ error: 'A reason for the internal system is required.' }, { status: 400 });
    }
    if (!noteClient) {
        return NextResponse.json({ error: 'A note for the client is required.' }, { status: 400 });
    }

    const inv = await prisma.contractSigningInvite.findUnique({ where: { id } });
    if (!inv) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (inv.isVoided) {
        return NextResponse.json({ error: 'This contract has already been voided.' }, { status: 409 });
    }

    const ip = getClientIp(req);
    const now = new Date();

    // Update contract record
    await prisma.contractSigningInvite.update({
        where: { id },
        data: {
            isVoided: true,
            voidedAt: now,
            voidReasonInternal: reasonInternal,
            voidNoteClient: noteClient,
        },
    });

    // Regenerate stored PDF so the contract header says "Status: Voided" instead of "Fully Executed"
    if (inv.pdfKey || inv.clientPayload) {
        try {
            await regenerateVoidedContractPdf(id);
        } catch (e) {
            console.error('[contract-void] PDF regeneration failed:', e);
        }
    }

    // Write to audit trail
    await logContractAudit(id, 'contract_voided', { reasonInternal, noteClient }, ip);

    // Extract client details from adminPayload or fallback hints
    let clientName = inv.clientHintName || 'Client';
    let clientEmail = inv.clientHintEmail || '';
    let clientPhone = '';
    let contractNumber = 'GGS Contract';
    let contractType: ContractType | undefined;

    if (inv.adminPayload && typeof inv.adminPayload === 'object') {
        const ap = inv.adminPayload as Record<string, unknown>;
        if (typeof ap.clientLegalName === 'string' && ap.clientLegalName.trim()) {
            clientName = ap.clientLegalName.trim();
        }
        if (typeof ap.email === 'string' && ap.email.trim()) {
            clientEmail = ap.email.trim();
        }
        if (typeof ap.phone === 'string' && ap.phone.trim()) {
            clientPhone = ap.phone.trim();
        }
        if (typeof ap.contractNumber === 'string' && ap.contractNumber.trim()) {
            contractNumber = ap.contractNumber.trim();
        }
        if (typeof ap.contractType === 'string') {
            contractType = ap.contractType as ContractType;
        }
    }

    let emailSent = false;
    let smsSent = false;
    let adminEmailSent = false;
    let adminSmsSent = false;

    // 1. Dispatch Client Email via Pingram
    if (clientEmail) {
        try {
            emailSent = await emailClientContractVoided({
                to: clientEmail,
                clientName,
                contractNumber,
                noteClient,
                contractType,
            });
        } catch (e) {
            console.error('[contract-void] Client email dispatch failed:', e);
        }
    }

    // 2. Dispatch Client SMS via Pingram
    if (clientPhone) {
        try {
            const smsRes = await sendContractVoidedSMS({
                contractNumber,
                phone: clientPhone,
                clientName,
                noteClient,
            });
            smsSent = smsRes.success;
        } catch (e) {
            console.error('[contract-void] Client SMS dispatch failed:', e);
        }
    }

    // 3. Dispatch Admin (Jojo) Email via Pingram
    const ownerEmail = process.env.OWNER_NOTIFICATION_ID || 'info@glitzandglamours.com';
    if (ownerEmail) {
        try {
            adminEmailSent = await emailAdminContractVoided({
                to: ownerEmail,
                contractNumber,
                clientName,
                clientEmail: clientEmail || undefined,
                clientPhone: clientPhone || undefined,
                reasonInternal,
                noteClient,
            });
        } catch (e) {
            console.error('[contract-void] Admin email dispatch failed:', e);
        }
    }

    // 4. Dispatch Admin (Jojo) SMS via Pingram
    try {
        const adminSmsRes = await sendAdminContractVoidedSMS({
            contractNumber,
            clientName,
            reasonInternal,
            noteClient,
        });
        adminSmsSent = adminSmsRes.success;
    } catch (e) {
        console.error('[contract-void] Admin SMS dispatch failed:', e);
    }

    return NextResponse.json({
        ok: true,
        voidedAt: now.toISOString(),
        emailSent,
        smsSent,
        adminEmailSent,
        adminSmsSent,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
    });
}

