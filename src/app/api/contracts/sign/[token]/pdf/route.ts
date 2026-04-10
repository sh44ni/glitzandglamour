import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { minioGetBuffer } from '@/lib/minioGetBuffer';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

type Ctx = { params: Promise<{ token: string }> };

/**
 * Client download/preview of a completed signed PDF.
 * Requires the same signing token; only available after status === COMPLETED.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    if (!token || token.length < 8) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ip = getClientIp(req);
    const rl = rateLimit(`${ip}:${token.slice(0, 8)}`, 'contract-pdf', { limit: 40, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const invite = await prisma.contractSigningInvite.findUnique({
        where: { token },
        select: { status: true, pdfKey: true, referenceCode: true },
    });

    if (!invite || invite.status !== 'COMPLETED' || !invite.pdfKey) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const result = await minioGetBuffer(invite.pdfKey);
    if (!result) {
        return NextResponse.json({ error: 'File unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    const inline = mode === 'inline' || mode === 'preview';

    const safeRef = (invite.referenceCode || 'agreement').replace(/[^a-zA-Z0-9-_]/g, '') || 'agreement';
    const filename = `Glitz-Glamour-Agreement-${safeRef}.pdf`;
    const disposition = inline
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

    const body = new Blob([new Uint8Array(result.buffer)], { type: 'application/pdf' });
    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': disposition,
            'Content-Length': String(result.buffer.length),
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
