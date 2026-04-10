import { NextRequest, NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

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
    });

    const now = new Date();
    const rows = invites.map((inv) => ({
        id: inv.id,
        token: inv.token,
        label: inv.label,
        clientHintName: inv.clientHintName,
        clientHintEmail: inv.clientHintEmail,
        expiresAt: inv.expiresAt.toISOString(),
        status: inv.status,
        isExpired: inv.expiresAt < now,
        completedAt: inv.completedAt?.toISOString() ?? null,
        referenceCode: inv.referenceCode,
        pdfKey: inv.pdfKey,
        createdAt: inv.createdAt.toISOString(),
    }));

    return NextResponse.json({ invites: rows, origin: appOrigin(req) });
}

// POST — create a new signing link
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: {
        label?: string;
        clientHintName?: string;
        clientHintEmail?: string;
        expiresInDays?: number;
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
    const invite = await prisma.contractSigningInvite.create({
        data: {
            token,
            label: body.label?.trim() || null,
            clientHintName: body.clientHintName?.trim() || null,
            clientHintEmail: body.clientHintEmail?.trim() || null,
            expiresAt,
        },
    });

    const origin = appOrigin(req);
    const signUrl = origin ? `${origin}/sign/${invite.token}` : `/sign/${invite.token}`;

    return NextResponse.json({
        invite: {
            id: invite.id,
            token: invite.token,
            expiresAt: invite.expiresAt.toISOString(),
            signUrl,
        },
    });
}
