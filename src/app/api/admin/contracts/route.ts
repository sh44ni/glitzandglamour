import { NextRequest, NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { validateAdminContractPayload, type AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { dispatchContractInviteEmails } from '@/lib/contracts/releaseContractInvite';

const tokenAlphabet = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 28);

function appOrigin(req: NextRequest): string {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    if (base) return base;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    return host ? `${proto}://${host}` : '';
}

// GET — list recent contract signing invites
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invites = await prisma.contractSigningInvite.findMany({
        orderBy: { createdAt: 'desc' },
        take: 80,
        select: {
            id: true,
            token: true,
            label: true,
            clientHintName: true,
            clientHintEmail: true,
            expiresAt: true,
            status: true,
            lifecycleStatus: true,
            completedAt: true,
            referenceCode: true,
            pdfKey: true,
            createdAt: true,
            adminPayload: true,
            sentAt: true,
            clientSignedAt: true,
            adminSignedAt: true,
            retainerReceived: true,
        },
    });

    const now = new Date();
    const rows = invites.map((inv) => {
        let contractNumber: string | null = null;
        if (inv.adminPayload && typeof inv.adminPayload === 'object' && 'contractNumber' in inv.adminPayload) {
            const c = (inv.adminPayload as Record<string, unknown>).contractNumber;
            contractNumber = typeof c === 'string' ? c : null;
        }
        return {
            id: inv.id,
            token: inv.token,
            label: inv.label,
            clientHintName: inv.clientHintName,
            clientHintEmail: inv.clientHintEmail,
            expiresAt: inv.expiresAt.toISOString(),
            status: inv.status,
            lifecycleStatus: inv.lifecycleStatus,
            isExpired: inv.expiresAt < now,
            completedAt: inv.completedAt?.toISOString() ?? null,
            referenceCode: inv.referenceCode,
            pdfKey: inv.pdfKey,
            createdAt: inv.createdAt.toISOString(),
            isSpecialEvent: inv.adminPayload != null,
            contractNumber,
            sentAt: inv.sentAt?.toISOString() ?? null,
            clientSignedAt: inv.clientSignedAt?.toISOString() ?? null,
            adminSignedAt: inv.adminSignedAt?.toISOString() ?? null,
            retainerReceived: inv.retainerReceived,
        };
    });

    return NextResponse.json({ invites: rows, origin: appOrigin(req) });
}

// POST — create a new signing link (legacy quick link, or special-events draft with full admin payload)
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: {
        label?: string;
        clientHintName?: string;
        clientHintEmail?: string;
        expiresInDays?: number;
        adminPayload?: unknown;
        /** Default true for special-events: email client after create */
        sendEmail?: boolean;
    };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const days = Math.min(90, Math.max(1, Number(body.expiresInDays) || 14));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const token = tokenAlphabet();
    const hasSpecial = body.adminPayload != null;

    let adminData: Prisma.InputJsonValue | undefined;
    let lifecycleStatus: 'DRAFT' | 'SENT' = 'SENT';
    let clientHintName = body.clientHintName?.trim() || null;
    let clientHintEmail = body.clientHintEmail?.trim() || null;
    let parsedAdmin: AdminContractPayload | null = null;
    const sendEmail = body.sendEmail !== false;

    if (hasSpecial) {
        const parsed = validateAdminContractPayload(body.adminPayload);
        if (!parsed.ok) {
            return NextResponse.json({ error: parsed.message }, { status: 400 });
        }
        adminData = parsed.data as Prisma.InputJsonValue;
        parsedAdmin = parsed.data;
        lifecycleStatus = 'SENT';
        clientHintName = parsed.data.clientLegalName;
        clientHintEmail = parsed.data.email;
    }

    const now = new Date();
    const invite = await prisma.contractSigningInvite.create({
        data: {
            token,
            label: body.label?.trim() || null,
            clientHintName,
            clientHintEmail,
            expiresAt,
            adminPayload: adminData,
            lifecycleStatus,
            sentAt: hasSpecial ? now : undefined,
            contractVersion: hasSpecial ? 'special-events-v1' : 'legacy-generic',
        },
    });

    const origin = appOrigin(req);
    const signUrl = origin ? `${origin}/sign/${invite.token}` : `/sign/${invite.token}`;

    let clientEmailed: boolean | undefined;
    if (hasSpecial && parsedAdmin && sendEmail) {
        const r = await dispatchContractInviteEmails(invite.id, signUrl, parsedAdmin);
        clientEmailed = r.clientEmailed;
    }

    return NextResponse.json({
        invite: {
            id: invite.id,
            token: invite.token,
            expiresAt: invite.expiresAt.toISOString(),
            signUrl,
            lifecycleStatus: invite.lifecycleStatus,
            clientEmailed,
        },
    });
}
