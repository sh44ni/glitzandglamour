/**
 * Sends a silent push notification to all Apple Wallet devices
 * that have registered a given loyalty card pass.
 *
 * Apple Wallet receives the push → calls GET /v1/passes/... → downloads fresh pass.
 * We use HTTP/2 to Apple's APN endpoint with the pass-signing cert (same cert used for pass generation).
 */

import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';
import https from 'https';

export async function pushAppleWalletUpdate(loyaltyCardId: string): Promise<void> {
    try {
        const devices = await prisma.appleWalletDevice.findMany({
            where: { loyaltyCardId },
        });

        if (devices.length === 0) {
            console.log(`[Apple Push] No registered devices for card ${loyaltyCardId}`);
            return;
        }

        const certPath = path.join(process.cwd(), 'certs', 'pass-cert.pem');
        const keyPath = path.join(process.cwd(), 'certs', 'pass-key.pem');

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            console.warn('[Apple Push] Certs not found, skipping push.');
            return;
        }

        const cert = fs.readFileSync(certPath);
        const key = fs.readFileSync(keyPath);

        const agent = new https.Agent({ cert, key });

        for (const device of devices) {
            try {
                // APN payload for Wallet passes is always an empty JSON object
                const payload = JSON.stringify({});

                const res = await fetch(
                    `https://api.push.apple.com/3/device/${device.pushToken}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apns-topic': 'pass.com.glitzandglamours.glitzglamour',
                            'apns-push-type': 'background',
                        },
                        body: payload,
                        // @ts-ignore — agent is a valid undici option in Node 18+
                        agent,
                    }
                );

                if (res.ok || res.status === 200) {
                    console.log(`[Apple Push] ✅ Notified device ${device.deviceLibraryId}`);
                } else {
                    const err = await res.text();
                    console.warn(`[Apple Push] ⚠️ Failed for device ${device.deviceLibraryId}: ${res.status} ${err}`);

                    // If token is bad/expired, clean it up
                    if (res.status === 410 || res.status === 400) {
                        await prisma.appleWalletDevice.delete({ where: { id: device.id } });
                        console.log(`[Apple Push] Removed stale device ${device.deviceLibraryId}`);
                    }
                }
            } catch (e: any) {
                console.error(`[Apple Push] Error notifying device ${device.deviceLibraryId}:`, e.message);
            }
        }
    } catch (e: any) {
        console.error('[Apple Push] pushAppleWalletUpdate error:', e.message);
    }
}
