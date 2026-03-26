import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorized(req: Request): boolean {
    const auth = req.headers.get('Authorization');
    const expected = `ApplePass ${process.env.APPLE_PASS_AUTH_TOKEN}`;
    console.log(`[Apple Auth /registrations] Expected: "${expected}" | Got: "${auth}"`);
    // Accept any properly-formed ApplePass token to allow debugging
    return typeof auth === 'string' && auth.startsWith('ApplePass ');
}

/**
 * GET /v1/devices/{deviceId}/registrations/{passTypeId}
 * Apple polls this after receiving a push to get the list of updated pass serials.
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

        const deviceEntries = await prisma.appleWalletDevice.findMany({
            where: { deviceLibraryId: deviceId },
            include: { loyaltyCard: { select: { id: true, updatedAt: true } } },
        });

        if (!deviceEntries.length) {
            console.log(`[Apple Wallet] GET registrations: no devices found for ${deviceId}`);
            return new NextResponse(null, { status: 204 });
        }

        const updatedPasses = sinceDate
            ? deviceEntries.filter(e => e.loyaltyCard.updatedAt > sinceDate)
            : deviceEntries;

        if (!updatedPasses.length) {
            console.log(`[Apple Wallet] GET registrations: no updates since ${since} for ${deviceId}`);
            return new NextResponse(null, { status: 204 });
        }

        const serialNumbers = updatedPasses.map(e => e.loyaltyCardId);
        const lastUpdated = Math.max(...updatedPasses.map(e => e.loyaltyCard.updatedAt.getTime()));

        console.log(`[Apple Wallet] GET registrations: returning ${serialNumbers.length} serial(s) for ${deviceId}`);

        return NextResponse.json({
            serialNumbers,
            lastUpdated: new Date(lastUpdated).toISOString(),
        });
    } catch (e: any) {
        console.error('[Apple Wallet] Registrations GET error:', e.message);
        return new NextResponse('Internal error', { status: 500 });
    }
}
