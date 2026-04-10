import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { buildSignedContractPdf } from '@/lib/contracts/buildPdf';
import { uploadContractPdf } from '@/lib/contracts/uploadPdf';
import { validateContractSubmit } from '@/lib/contracts/validate';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

type Ctx = { params: Promise<{ token: string }> };

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
        },
    });

    if (!invite) {
        return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 404 });
    }

    const now = new Date();

    if (invite.status === 'COMPLETED') {
        return NextResponse.json({
            ok: false,
            reason: 'completed',
            referenceCode: invite.referenceCode,
            pdfAvailable: Boolean(invite.pdfKey),
        });
    }

    if (invite.expiresAt < now) {
        return NextResponse.json({
            ok: false,
            reason: 'expired',
            expiresAt: invite.expiresAt.toISOString(),
        });
    }

    return NextResponse.json({
        ok: true,
        clientHintName: invite.clientHintName,
        clientHintEmail: invite.clientHintEmail,
        expiresAt: invite.expiresAt.toISOString(),
    });
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

    const ua = req.headers.get('user-agent')?.slice(0, 500) ?? null;

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
        },
    });

    if (updated.count === 0) {
        return NextResponse.json({ error: 'This agreement was already submitted.' }, { status: 409 });
    }

    return NextResponse.json({ ok: true, referenceCode });
}
