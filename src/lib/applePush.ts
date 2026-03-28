/**
 * Sends a silent push notification to all Apple Wallet devices
 * registered for a given loyalty card.
 *
 * Uses @parse/node-apn which properly handles HTTP/2 (required by Apple APN).
 * Apple Wallet then calls GET /v1/passes/... to download the fresh pass.
 */

import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

export async function pushAppleWalletUpdate(loyaltyCardId: string): Promise<void> {
    try {
        const devices = await prisma.appleWalletDevice.findMany({
            where: { loyaltyCardId },
        });

        if (devices.length === 0) {
            console.log(`[Apple Push] No registered devices for card ${loyaltyCardId}`);
            return;
        }

        const envCert = process.env.APPLE_PUSH_CERT_PATH;
        const envKey = process.env.APPLE_PUSH_KEY_PATH;

        let certPath = envCert || path.join(process.cwd(), 'certs', 'apple-push-cert.pem');
        let keyPath = envKey || path.join(process.cwd(), 'certs', 'apple-push.key');

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            console.warn('[Apple Push] Dedicated push certs not found. Falling back to pass-cert.pem (Warning: this often causes 403 InvalidProviderToken)');
            certPath = path.join(process.cwd(), 'certs', 'pass-cert.pem');
            keyPath = path.join(process.cwd(), 'certs', 'pass-key.pem');
        }

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            console.warn('[Apple Push] No certificates found at all, skipping push.');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const apn = require('@parse/node-apn');

        const provider = new apn.Provider({
            cert: certPath,
            key: keyPath,
            production: true,
        });

        for (const device of devices) {
            try {
                const notification = new apn.Notification();
                notification.topic = 'pass.com.glitzandglamours.glitzglamour';
                notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                notification.priority = 5; // Required for background/wallet pushes
                notification.pushType = 'background';
                notification.rawPayload = '{}';


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
