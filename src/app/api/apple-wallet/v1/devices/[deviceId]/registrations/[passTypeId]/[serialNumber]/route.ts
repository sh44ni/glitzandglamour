import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorized(req: Request): boolean {
    const auth = req.headers.get('Authorization');
    return auth === `ApplePass ${process.env.APPLE_PASS_AUTH_TOKEN}`;
}

// POST — Apple Wallet registers a device when user adds the pass
export async function POST(
    req: Request,
    { params }: { params: Promise<{ deviceId: string; passTypeId: string; serialNumber: string }> }
) {
    if (!isAuthorized(req)) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const { pushToken } = await req.json();
        const { deviceId, serialNumber } = await params;

        // serialNumber = loyaltyCard.id
        const card = await prisma.loyaltyCard.findUnique({ where: { id: serialNumber } });
        if (!card) return new NextResponse('Pass not found', { status: 404 });

        await prisma.appleWalletDevice.upsert({
            where: {
                deviceLibraryId_loyaltyCardId: {
                    deviceLibraryId: deviceId,
                    loyaltyCardId: serialNumber,
                },
            },
            update: { pushToken },
            create: {
                deviceLibraryId: deviceId,
                pushToken,
                loyaltyCardId: serialNumber,
            },
        });

        console.log(`[Apple Wallet] Registered device ${deviceId} for card ${serialNumber}`);
        return new NextResponse(null, { status: 201 });
    } catch (e: any) {
        console.error('[Apple Wallet] Register error:', e.message);
        return new NextResponse('Internal error', { status: 500 });
    }
}

// DELETE — Apple Wallet unregisters when user removes the pass
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ deviceId: string; passTypeId: string; serialNumber: string }> }
) {
    if (!isAuthorized(req)) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const { deviceId, serialNumber } = await params;

        await prisma.appleWalletDevice.deleteMany({
            where: {
                deviceLibraryId: deviceId,
                loyaltyCardId: serialNumber,
            },
        });

        console.log(`[Apple Wallet] Unregistered device ${deviceId} for card ${serialNumber}`);
        return new NextResponse(null, { status: 200 });
    } catch (e: any) {
        console.error('[Apple Wallet] Unregister error:', e.message);
        return new NextResponse('Internal error', { status: 500 });
    }
}
