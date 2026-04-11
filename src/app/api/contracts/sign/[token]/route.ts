import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildSignedContractPdf } from '@/lib/contracts/buildPdf';
import { uploadContractPdf } from '@/lib/contracts/uploadPdf';
import { validateContractSubmit } from '@/lib/contracts/validate';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { submitSpecialEventContract } from '@/lib/contracts/submitSpecialEventSign';
import { validateAdminContractPayload } from '@/lib/contracts/adminContractPayload';

type Ctx = { params: Promise<{ token: string }> };

function contractNumberFromAdminPayload(raw: unknown): string | null {
    if (!raw || typeof raw !== 'object') return null;
    const n = (raw as Record<string, unknown>).contractNumber;
    return typeof n === 'string' ? n : null;
}

// GET — check link (public)
export async function GET(_req: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    if (!token || token.length < 8) {
        return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 404 });
    }

    const invite = await prisma.contractSigningInvite.findUnique({
        where: { token },
        select: {
            status: true,
            expiresAt: true,
            clientHintName: true,
            clientHintEmail: true,
            referenceCode: true,
            pdfKey: true,
            adminPayload: true,
            lifecycleStatus: true,
        },
    });

    if (!invite) {
        return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 404 });
    }

    const now = new Date();
    const isSpecial = invite.adminPayload != null;

    if (invite.status === 'COMPLETED') {
        return NextResponse.json({
            ok: false,
            reason: 'completed',
            referenceCode: invite.referenceCode,
            pdfAvailable: Boolean(invite.pdfKey),
            lifecycleStatus: invite.lifecycleStatus,
            flow: isSpecial ? 'special-events-v1' : 'legacy',
        });
    }

    if (invite.expiresAt < now) {
        return NextResponse.json({
            ok: false,
            reason: 'expired',
            expiresAt: invite.expiresAt.toISOString(),
        });
    }

    if (isSpecial && invite.lifecycleStatus === 'DRAFT') {
        return NextResponse.json({ ok: false, reason: 'not_sent' }, { status: 403 });
    }

    if (isSpecial && invite.lifecycleStatus !== 'SENT') {
        return NextResponse.json({
            ok: false,
            reason: 'invalid',
        }, { status: 404 });
    }

    const base = {
        ok: true as const,
        clientHintName: invite.clientHintName,
        clientHintEmail: invite.clientHintEmail,
        expiresAt: invite.expiresAt.toISOString(),
    };

    if (isSpecial) {
        const parsed = validateAdminContractPayload(invite.adminPayload);
        if (!parsed.ok) {
            return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 500 });
        }
        const { internalNotes: _internalOnly, ...adminPayload } = parsed.data;
        return NextResponse.json({
            ...base,
            flow: 'special-events-v1' as const,
            contractNumber: contractNumberFromAdminPayload(invite.adminPayload),
            adminPayload,
        });
    }

    return NextResponse.json(base);
}

// POST — submit signed contract (public)
export async function POST(req: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    if (!token || token.length < 8) {
        return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    const ip = getClientIp(req);
    const rl = rateLimit(ip, 'contract-sign', { limit: 8, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many submissions. Try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    const invite = await prisma.contractSigningInvite.findUnique({
        where: { token },
    });

    if (!invite) {
        return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    const now = new Date();
    if (invite.expiresAt < now) {
        return NextResponse.json({ error: 'This signing link has expired.' }, { status: 410 });
    }

    if (invite.status === 'COMPLETED') {
        return NextResponse.json({ error: 'This agreement was already submitted.' }, { status: 409 });
    }

    let json: unknown;
    try {
        json = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const ua = req.headers.get('user-agent')?.slice(0, 500) ?? '';

    if (invite.adminPayload != null) {
        const mode = json && typeof json === 'object' ? (json as Record<string, unknown>).mode : null;
        if (mode !== 'special-events-v1') {
            return NextResponse.json(
                { error: 'This contract must be signed using the studio agreement page.' },
                { status: 400 }
            );
        }
        const result = await submitSpecialEventContract({
            invite: {
                id: invite.id,
                adminPayload: invite.adminPayload,
                lifecycleStatus: invite.lifecycleStatus,
                expiresAt: invite.expiresAt,
            },
            body: json,
            ip,
            ua,
        });
        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }
        return NextResponse.json({ ok: true, referenceCode: result.referenceCode });
    }

    const parsed = validateContractSubmit(json);
    if (!parsed.ok) {
        return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    let sigBytes: Uint8Array;
    try {
        sigBytes = Uint8Array.from(Buffer.from(parsed.signatureBase64, 'base64'));
    } catch {
        return NextResponse.json({ error: 'Invalid signature data' }, { status: 400 });
    }

    const referenceCode = `GGS-${Date.now().toString().slice(-6)}`;
    const generatedAtIso = now.toISOString();
    let pdfBytes: Uint8Array;
    try {
        pdfBytes = await buildSignedContractPdf(parsed.stored, sigBytes, {
            referenceCode,
            generatedAtIso,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'PDF failed';
        return NextResponse.json({ error: msg }, { status: 400 });
    }

    const pdfKey = `contracts/signing-${invite.id}.pdf`;
    try {
        await uploadContractPdf(pdfKey, pdfBytes);
    } catch (e) {
        console.error('[contract-sign] PDF upload:', e);
        return NextResponse.json(
            { error: 'Could not store signed PDF. Please contact the studio.' },
            { status: 503 }
        );
    }

    const updated = await prisma.contractSigningInvite.updateMany({
        where: {
            id: invite.id,
            status: 'PENDING',
            expiresAt: { gt: now },
        },
        data: {
            status: 'COMPLETED',
            completedAt: now,
            referenceCode,
            pdfKey,
            formData: parsed.stored as Prisma.InputJsonValue,
            submittedIp: ip,
            submittedUa: ua,
            lifecycleStatus: 'CLIENT_SIGNED',
            clientSignedAt: now,
        },
    });

    if (updated.count === 0) {
        return NextResponse.json({ error: 'This agreement was already submitted.' }, { status: 409 });
    }

    return NextResponse.json({ ok: true, referenceCode });
}
