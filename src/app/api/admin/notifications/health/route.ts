import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { __diagnosticSend } from '@/lib/sms';
import { dispatchEmail } from '@/lib/notify';

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
            fromEmail: process.env.PINGRAM_FROM_EMAIL || 'info@glitzandglamours.com',
            fromName: process.env.PINGRAM_FROM_NAME || 'Glitz & Glamour',
        },
        resend: { hasApiKey: hasResendKey, from: process.env.RESEND_FROM, deprecated: true },
        owner: {
            phone: process.env.OWNER_PHONE_NUMBER,
            notificationId: process.env.OWNER_NOTIFICATION_ID,
        },
        serverTime: new Date().toISOString(),
    });
}

// POST — live test-send.
// Body: { channel?: 'sms' | 'email', toNumber?: string, toId?: string, toEmail?: string }
// channel defaults to 'sms' for backward compatibility.
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: { channel?: 'sms' | 'email'; toNumber?: string; toId?: string; toEmail?: string } = {};
    try { body = await req.json(); } catch { /* body optional */ }

    const channel = body.channel || 'sms';

    if (channel === 'email') {
        const toEmail = body.toEmail || process.env.OWNER_NOTIFICATION_ID || process.env.OWNER_PHONE_NUMBER || '';
        if (!toEmail || !toEmail.includes('@')) {
            return NextResponse.json({ error: 'Provide a valid toEmail for email diagnostics.' }, { status: 400 });
        }

        const result = await dispatchEmail({
            bookingId: 'diagnostic',
            event: 'diagnostic_email',
            to: toEmail,
            subject: `[DIAGNOSTIC] Glitz & Glamour email test @ ${new Date().toISOString()}`,
            previewText: 'This is a diagnostic test email from the admin panel.',
            html: `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#fff;font-family:Poppins,sans-serif;padding:40px;">
<h1 style="color:#FF2D78">Glitz &amp; Glamour — Email Diagnostic ✅</h1>
<p>This test email was sent at <strong>${new Date().toISOString()}</strong> via Pingram.</p>
<p style="color:#888;font-size:13px">If you received this, Pingram email delivery is working correctly.</p>
</body></html>`,
        });

        return NextResponse.json({
            channel: 'email',
            target: { toEmail },
            success: result.success,
            reason: result.reason,
            errorCode: result.errorCode,
            trackingId: result.trackingId,
            rawResponse: result.rawResponse,
            rawError: result.rawError,
            serverTime: new Date().toISOString(),
        });
    }

    // Default: SMS diagnostic (existing behavior)
    const toNumber = body.toNumber || process.env.OWNER_PHONE_NUMBER || '+17602905910';
    const toId = body.toId || toNumber;

    const result = await __diagnosticSend(toNumber, toId);

    return NextResponse.json({
        channel: 'sms',
        target: { toNumber, toId },
        ...result,
        serverTime: new Date().toISOString(),
    });
}
