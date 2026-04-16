import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { __diagnosticSend } from '@/lib/sms';

// GET — env snapshot only (safe, no outbound call)
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = process.env.PINGRAM_API_KEY;
    const hasApiKey = !!apiKey && apiKey !== 'placeholder';

    let apiKeyMetadata: Record<string, unknown> | undefined;
    let apiKeyPrefix: string | undefined;
    let apiKeySuffix: string | undefined;
    if (apiKey) {
        apiKeyPrefix = apiKey.slice(0, 14);
        apiKeySuffix = apiKey.slice(-6);
        try {
            const parts = apiKey.replace(/^pingram_sk_/, '').replace(/^pingram_pk_/, '').split('.');
            if (parts.length >= 2) {
                apiKeyMetadata = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            }
        } catch { /* best-effort */ }
    }

    const hasResendKey = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder';

    return NextResponse.json({
        pingram: {
            hasApiKey,
            apiKeyPrefix,
            apiKeySuffix,
            apiKeyMetadata,
            baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io',
            fromNumber: process.env.PINGRAM_FROM_NUMBER,
        },
        resend: { hasApiKey: hasResendKey, from: process.env.RESEND_FROM },
        owner: {
            phone: process.env.OWNER_PHONE_NUMBER,
            notificationId: process.env.OWNER_NOTIFICATION_ID,
        },
        serverTime: new Date().toISOString(),
    });
}

// POST — live test-send. Body: { toNumber?: string, toId?: string }
// Defaults to OWNER_PHONE_NUMBER. Returns the full raw Pingram response.
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: { toNumber?: string; toId?: string } = {};
    try { body = await req.json(); } catch { /* body optional */ }

    const toNumber = body.toNumber || process.env.OWNER_PHONE_NUMBER || '+17602905910';
    const toId = body.toId || toNumber;

    const result = await __diagnosticSend(toNumber, toId);

    return NextResponse.json({
        target: { toNumber, toId },
        ...result,
        serverTime: new Date().toISOString(),
    });
}
