import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { minioGetBuffer } from '@/lib/minioGetBuffer';
import { regenerateVoidedContractPdf } from '@/lib/contracts/voidSpecialEventPdf';

type Ctx = { params: Promise<{ id: string }> };

/** GET — download latest stored PDF for a contract (admin) */
export async function GET(req: NextRequest, ctx: Ctx) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const inv = await prisma.contractSigningInvite.findUnique({
        where: { id },
        select: { pdfKey: true, referenceCode: true, contractVersion: true, isVoided: true },
    });

    if (!inv?.pdfKey) {
        return NextResponse.json({ error: 'PDF not available' }, { status: 404 });
    }

    let pdfBuffer: Buffer | Uint8Array | null = null;

    if (inv.isVoided && !inv.pdfKey.endsWith('-voided.pdf')) {
        try {
            const regen = await regenerateVoidedContractPdf(id);
            if (regen) {
                pdfBuffer = regen.pdfBytes;
            }
        } catch (e) {
            console.error('[admin-contract-pdf] Failed to regenerate voided PDF:', e);
        }
    }

    if (!pdfBuffer) {
        const result = await minioGetBuffer(inv.pdfKey);
        if (!result) {
            return NextResponse.json({ error: 'File unavailable' }, { status: 503 });
        }
        pdfBuffer = result.buffer;
    }

    const { searchParams } = new URL(req.url);
    const inline = searchParams.get('mode') === 'inline';
    const safeRef = (inv.referenceCode || 'agreement').replace(/[^a-zA-Z0-9-_]/g, '') || 'agreement';
    const filename = `Glitz-Glamour-Contract-${safeRef}.pdf`;
    const disposition = inline
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

    const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
    return new NextResponse(blob, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': disposition,
            'Content-Length': String(pdfBuffer.length),
            'Cache-Control': 'private, no-store',
        },
    });
}
