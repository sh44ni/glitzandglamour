/**
 * Sends a silent push notification to all Apple Wallet devices
 * registered for a given loyalty card.
 *
 * Uses @parse/node-apn with TOKEN-BASED authentication (.p8 key).
 * This is the modern approach — no expiring push certs needed.
 * Apple Wallet then calls GET /v1/passes/... to download the fresh pass.
 */

import { prisma } from './prisma';

export async function pushAppleWalletUpdate(loyaltyCardId: string): Promise<void> {
    try {
        const devices = await prisma.appleWalletDevice.findMany({
            where: { loyaltyCardId },
        });

        if (devices.length === 0) {
            console.log(`[Apple Push] No registered devices for card ${loyaltyCardId}`);
            return;
        }

        const keyP8 = process.env.APPLE_PUSH_KEY_P8;
        const keyId = process.env.APPLE_PUSH_KEY_ID;
        const teamId = process.env.APPLE_PUSH_TEAM_ID;

        if (!keyP8 || !keyId || !teamId) {
            console.warn('[Apple Push] APPLE_PUSH_KEY_P8 / APPLE_PUSH_KEY_ID / APPLE_PUSH_TEAM_ID not set, skipping push.');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const apn = require('@parse/node-apn');

        const provider = new apn.Provider({
            token: {
                key: Buffer.from(keyP8, 'utf8'), // the raw PEM content of the .p8
                keyId,
                teamId,
            },
            production: true,
        });

        for (const device of devices) {
            try {
                const notification = new apn.Notification();
                notification.topic = 'pass.com.glitzandglamours.glitzglamour';
                notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                notification.priority = 5;
                notification.pushType = 'background';
                notification.payload = {};

                const result = await provider.send(notification, device.pushToken);

                if (result.sent?.length > 0) {
                    console.log(`[Apple Push] ✅ Notified device ${device.deviceLibraryId}`);
                } else if (result.failed?.length > 0) {
                    const err = result.failed[0];
                    console.warn(`[Apple Push] ⚠️ Failed for ${device.deviceLibraryId}: ${err.status} ${err.response?.reason || ''}`);
                    if (err.status === '410' || err.response?.reason === 'Unregistered' || err.response?.reason === 'BadDeviceToken') {
                        await prisma.appleWalletDevice.delete({ where: { id: device.id } });
                        console.log(`[Apple Push] Removed stale device ${device.deviceLibraryId}`);
                    }
                }
            } catch (e: any) {
                console.error(`[Apple Push] Error notifying ${device.deviceLibraryId}:`, e.message);
            }
        }

        provider.shutdown();
        console.log(`[Apple Push] Done for card ${loyaltyCardId}`);
    } catch (e: any) {
        console.error('[Apple Push] pushAppleWalletUpdate error:', e.message);
    }
}
