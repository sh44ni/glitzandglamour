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

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const apn = require('@parse/node-apn');

        let provider;

        // 1. Try Proven Certificates first (proven to work in previous logs)
        const certPath = path.join(process.cwd(), 'certs', 'pass-cert.pem');
        const keyPath = path.join(process.cwd(), 'certs', 'pass-key.pem');

        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            console.log('[Apple Push] Using proven certificate authentication (pass-cert.pem)');
            provider = new apn.Provider({
                cert: certPath,
                key: keyPath,
                production: true,
            });
        } 
        // 2. Fallback to Dedicated Push Certs
        else if (fs.existsSync(path.join(process.cwd(), 'certs', 'apple-push-cert.pem'))) {
            console.log('[Apple Push] Using dedicated apple-push-cert.pem');
            provider = new apn.Provider({
                cert: path.join(process.cwd(), 'certs', 'apple-push-cert.pem'),
                key: path.join(process.cwd(), 'certs', 'apple-push.key'),
                production: true,
            });
        }
        // 3. Fallback to .p8 Token Authentication
        else if (process.env.APPLE_PUSH_KEY_P8 && process.env.APPLE_PUSH_KEY_ID && process.env.APPLE_PUSH_TEAM_ID) {
            console.log('[Apple Push] Using .p8 Token Authentication');
            // Clean the key (remove quotes and handle escaped newlines)
            const rawKey = process.env.APPLE_PUSH_KEY_P8.trim().replace(/^"|"$/g, '');
            provider = new apn.Provider({
                token: {
                    key: rawKey.replace(/\\n/g, '\n'),
                    keyId: process.env.APPLE_PUSH_KEY_ID,
                    teamId: process.env.APPLE_PUSH_TEAM_ID
                },
                production: true
            });
        } else {
            console.warn('[Apple Push] No valid authentication credentials found (certs or .p8)');
            return;
        }

        for (const device of devices) {
            try {
                const notification = new apn.Notification();
                notification.topic = 'pass.com.glitzandglamours.glitzglamour';
                notification.expiry = Math.floor(Date.now() / 1000) + 3600;
                notification.priority = 5; // Required for background/wallet pushes
                notification.pushType = 'background';
                notification.rawPayload = {};

                const result = await provider.send(notification, device.pushToken);

                if (result.sent?.length > 0) {
                    console.log(`[Apple Push] ✅ Notified device ${device.deviceLibraryId}`);
                } else if (result.failed?.length > 0) {
                    const err = result.failed[0];
                    if (err.error) {
                         console.warn(`[Apple Push] ⚠️ Internal Error for ${device.deviceLibraryId}: ${err.error.message || err.error}`);
                    } else {
                         console.warn(`[Apple Push] ⚠️ APNs Rejected ${device.deviceLibraryId}: ${err.status} ${err.response?.reason || ''}`);
                    }
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
