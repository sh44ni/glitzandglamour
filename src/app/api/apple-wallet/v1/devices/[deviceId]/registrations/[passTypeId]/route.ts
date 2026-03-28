import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /v1/devices/{deviceId}/registrations/{passTypeId}
 *
 * Apple calls this after a push. No Authorization header is sent on GET
 * (Apple only sends auth on POST/DELETE registrations).
 * Returns which passes need updating.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ deviceId: string; passTypeId: string }> }
) {
    // NOTE: Apple does NOT send Authorization header on GET registrations.
    // Auth is only enforced on POST (register) and DELETE (unregister).
    const authHeader = req.headers.get('Authorization');
    console.log(`[Apple Wallet] GET registrations — auth: "${authHeader}"`);

    try {
        const { deviceId } = await params;
        const url = new URL(req.url);
        const since = url.searchParams.get('passesUpdatedSince');
        const sinceDate = since ? new Date(since) : null;

        const deviceEntries = await prisma.appleWalletDevice.findMany({
            where: { deviceLibraryId: deviceId },
            include: { loyaltyCard: { select: { id: true, updatedAt: true } } },
        });

        if (!deviceEntries.length) {
            console.log(`[Apple Wallet] GET registrations: no devices for ${deviceId}`);
            return new NextResponse(null, { status: 204 });
        }

        const updatedPasses = sinceDate
            ? deviceEntries.filter(e => e.loyaltyCard.updatedAt > sinceDate)
            : deviceEntries;

        if (!updatedPasses.length) {
            console.log(`[Apple Wallet] GET registrations: no updates since ${since}`);
            return new NextResponse(null, { status: 204 });
        }

        const serialNumbers = updatedPasses.map(e => e.loyaltyCardId);
        const lastUpdated = Math.max(...updatedPasses.map(e => e.loyaltyCard.updatedAt.getTime()));

        console.log(`[Apple Wallet] GET registrations: returning serials ${serialNumbers} to device ${deviceId}`);

        return NextResponse.json(
            {
                serialNumbers,
                lastUpdated: new Date(lastUpdated).toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        );
    } catch (e: any) {
        console.error('[Apple Wallet] Registrations GET error:', e.message);
        return new NextResponse('Internal error', { status: 500 });
    }
}
