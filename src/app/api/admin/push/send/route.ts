import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100; // Expo recommends max 100 per request

type ExpoPushMessage = {
    to: string | string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: 'default' | null;
    badge?: number;
};

type ExpoReceipt = {
    status: 'ok' | 'error';
    message?: string;
    details?: { error?: string };
};

function chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

/**
 * POST /api/admin/push/send
 * Send a push notification to all (or targeted) app users.
 * Body: { title, body, data?, targetUserIds? }
 */
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { title, body: msgBody, data, targetUserIds } = body;

        if (!title?.trim() || !msgBody?.trim()) {
            return NextResponse.json({ error: 'title and body are required.' }, { status: 400 });
        }

        // Fetch push tokens
        const where = targetUserIds?.length
            ? { userId: { in: targetUserIds as string[] } }
            : {};

        const tokens = await (prisma as any).pushToken.findMany({
            where,
            select: { token: true },
        });

        if (tokens.length === 0) {
            return NextResponse.json({ sent: 0, failed: 0, message: 'No registered push tokens found.' });
        }

        const tokenStrings: string[] = tokens.map((t: { token: string }) => t.token);
        const chunks = chunk(tokenStrings, CHUNK_SIZE);

        let totalSent = 0;
        let totalFailed = 0;

        for (const chunkTokens of chunks) {
            const message: ExpoPushMessage = {
                to: chunkTokens,
                title: title.trim(),
                body: msgBody.trim(),
                sound: 'default',
                ...(data && Object.keys(data).length > 0 ? { data } : {}),
            };

            try {
                const res = await fetch(EXPO_PUSH_URL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });

                if (!res.ok) {
                    totalFailed += chunkTokens.length;
                    console.error('[push/send] Expo API error:', res.status, await res.text());
                    continue;
                }

                const result = await res.json();
                const receipts: ExpoReceipt[] = result?.data ?? [];
                for (const receipt of receipts) {
                    if (receipt.status === 'ok') totalSent++;
                    else totalFailed++;
                }
                // If Expo didn't return per-token receipts, count whole chunk as sent
                if (receipts.length === 0) totalSent += chunkTokens.length;
            } catch (err) {
                console.error('[push/send] chunk error:', err);
                totalFailed += chunkTokens.length;
            }
        }

        // Log campaign
        await (prisma as any).pushCampaign.create({
            data: {
                title: title.trim(),
                body: msgBody.trim(),
                data: data ?? null,
                totalSent,
                totalFailed,
            },
        });

        return NextResponse.json({ sent: totalSent, failed: totalFailed });
    } catch (err) {
        console.error('[push/send]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
