import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { pushAppleWalletUpdate } from '@/lib/applePush';
import fs from 'fs';
import path from 'path';

// POST — upload new banner and/or push update to all wallet devices
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get('banner') as File | null;
        const pushAll = formData.get('pushAll') === 'true';

        // 1. If a banner file was uploaded, replace loyaltycardbanner2.png in public/
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const bannerPath = path.join(process.cwd(), 'public', 'loyaltycardbanner2.png');
            fs.writeFileSync(bannerPath, buffer);
            console.log('[Wallet Push] Banner updated on disk');
        }

        // 2. If pushAll requested, send APN push to every registered device
        let pushedCount = 0;
        if (pushAll) {
            const allCards = await prisma.loyaltyCard.findMany({
                select: { id: true },
                where: {
                    appleWalletDevices: { some: {} }
                }
            });

            for (const card of allCards) {
                await pushAppleWalletUpdate(card.id).catch(console.error);
                pushedCount++;
            }
            console.log(`[Wallet Push] Pushed update to ${pushedCount} cards`);
        }

        // 3. Count registered devices for the response
        const deviceCount = await prisma.appleWalletDevice.count();

        return NextResponse.json({
            success: true,
            bannerUpdated: !!file && file.size > 0,
            pushedCount,
            deviceCount,
        });
    } catch (e: any) {
        console.error('[Wallet Push] Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET — return stats (registered device count)
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceCount = await prisma.appleWalletDevice.count();
    const cardCount = await prisma.loyaltyCard.count({
        where: { appleWalletDevices: { some: {} } }
    });

    return NextResponse.json({ deviceCount, cardCount });
}
