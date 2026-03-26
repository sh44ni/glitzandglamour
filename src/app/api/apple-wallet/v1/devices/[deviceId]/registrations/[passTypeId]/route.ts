import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorized(req: Request): boolean {
    const auth = req.headers.get('Authorization');
    return auth === `ApplePass ${process.env.APPLE_PASS_AUTH_TOKEN}`;
}

/**
 * GET /v1/devices/{deviceId}/registrations/{passTypeId}
 *
 * Apple calls this after a push notification to ask:
 * "Which of this device's passes have been updated since timestamp X?"
 *
 * Query param: passesUpdatedSince (ISO 8601 timestamp, optional)
 * Response: { "serialNumbers": [...], "lastUpdated": "..." }
 * If no updates: 204 No Content
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ deviceId: string; passTypeId: string }> }
) {
    if (!isAuthorized(req)) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const { deviceId } = await params;
        const url = new URL(req.url);
        const since = url.searchParams.get('passesUpdatedSince');

        const sinceDate = since ? new Date(since) : null;

        // Find all loyalty cards registered by this device
        const deviceEntries = await prisma.appleWalletDevice.findMany({
            where: { deviceLibraryId: deviceId },
            include: { loyaltyCard: { select: { id: true, updatedAt: true } } },
        });

        if (!deviceEntries.length) {
            return new NextResponse(null, { status: 204 });
        }

        // Filter to passes updated since the given timestamp (or return all if no timestamp)
        const updatedPasses = sinceDate
            ? deviceEntries.filter(e => e.loyaltyCard.updatedAt > sinceDate)
            : deviceEntries;

        if (!updatedPasses.length) {
            return new NextResponse(null, { status: 204 });
        }

        const serialNumbers = updatedPasses.map(e => e.loyaltyCardId);
        const lastUpdated = Math.max(...updatedPasses.map(e => e.loyaltyCard.updatedAt.getTime()));

        console.log(`[Apple Wallet] Device ${deviceId} asked for updates, returning ${serialNumbers.length} serial(s)`);

        return NextResponse.json({
            serialNumbers,
            lastUpdated: new Date(lastUpdated).toISOString(),
        });
    } catch (e: any) {
        console.error('[Apple Wallet] Registrations GET error:', e.message);
        return new NextResponse('Internal error', { status: 500 });
    }
}
