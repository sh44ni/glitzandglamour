// Pingram SMS helper
// Falls back to console.log if API key is placeholder

import { logNotification, detectSmsError, detectPingramSoftWarning } from './notifLogger';
import { generateReviewMessage } from './reviewAI';
import { buildPingram } from './pingramClient';

export type PingramSendResult = {
    success: boolean;
    reason?: 'no-key' | 'soft-failure' | 'exception';
    errorCode?: string;
    trackingId?: string;
    rawResponse?: unknown;
    rawError?: unknown;
};

// Internal single-purpose dispatcher so every helper surfaces the Pingram
// response truthfully instead of blindly logging "sent" on 2xx.
async function dispatchSms(opts: {
    bookingId: string;
    event: string;
    toId: string;        // Pingram user id (phone or email-like stable id)
    toNumber: string;    // E.164 phone
    message: string;
    type?: string;       // Pingram notification type; defaults to 'booking_request'
}): Promise<PingramSendResult> {
    const { bookingId, event, toId, toNumber, message } = opts;
    const notificationType = opts.type || 'booking_request';

    const pingram = await buildPingram();
    if (!pingram) {
        console.log('[SMS SKIPPED - No Pingram key]', { event, toNumber });
        await logNotification({
            bookingId, type: 'sms', event, recipient: toNumber, status: 'skipped',
            error: 'no_api_key', message,
        });
        return { success: false, reason: 'no-key', errorCode: 'no_api_key' };
    }

    try {
        const response = await pingram.send({
            type: notificationType,
            to: { id: toId, number: toNumber },
            sms: { message },
        }) as { trackingId?: string; messages?: string[] } | undefined;

        const trackingId = response?.trackingId;
        const soft = detectPingramSoftWarning(response);

        if (soft) {
            // Pingram returned 2xx but signalled the SMS did not actually dispatch
            // (e.g. type not configured, channel off, recipient unsubscribed).
            console.warn('[SMS SOFT-FAILURE]', { event, toNumber, trackingId, warning: soft, response });
            await logNotification({
                bookingId, type: 'sms', event, recipient: toNumber, status: 'failed',
                error: soft,
                message: trackingId ? `[tracking=${trackingId}] ${message}` : message,
            });
            return { success: false, reason: 'soft-failure', errorCode: soft, trackingId, rawResponse: response };
        }

        await logNotification({
            bookingId, type: 'sms', event, recipient: toNumber, status: 'sent',
            message: trackingId ? `[tracking=${trackingId}] ${message}` : message,
        });
        return { success: true, trackingId, rawResponse: response };
    } catch (error) {
        const errCode = detectSmsError(error);
        console.error('[SMS ERROR]', { event, toNumber, error });
        await logNotification({
            bookingId, type: 'sms', event, recipient: toNumber, status: 'failed',
            error: errCode, message,
        });
        return { success: false, reason: 'exception', errorCode: errCode, rawError: error };
    }
}

// ── JoJany: new booking alert ─────────────────────────────────────────────────

export async function sendBookingSMS(
    bookingId: string,
    customerName: string,
    service: string,
    date: string,
    time: string,
    notes?: string,
    phone?: string | null
): Promise<PingramSendResult> {
    const ownerPhone = process.env.OWNER_PHONE_NUMBER || '+17602905910';
    const ownerId = process.env.OWNER_NOTIFICATION_ID || 'info@glitzandglamours.com';
    const phoneInfo = phone ? ` Phone: ${phone}.` : '';
    const message = `New booking! ${customerName} wants ${service} on ${date} at ${time}.${phoneInfo} Notes: ${notes || 'None'}. Login: glitzandglamours.com/admin`;

    return dispatchSms({
        bookingId, event: 'booking_received',
        toId: ownerId, toNumber: ownerPhone, message,
    });
}

// ── Client SMS helpers ────────────────────────────────────────────────────────

export async function sendClientConfirmationSMS(bookingId: string, phone: string, customerName: string, service: string, date: string, time: string) {
    const msg = `Hi ${customerName}! ✅ Your appointment for ${service} on ${date} at ${time} is confirmed at Glitz & Glamour. See you soon! 💅 - JoJany`;
    return dispatchSms({ bookingId, event: 'booking_confirmed', toId: phone, toNumber: phone, message: msg });
}

export async function sendClientRescheduledSMS(bookingId: string, phone: string, customerName: string, service: string, date: string, time: string) {
    const msg = `Hi ${customerName}! 🗓️ Your Glitz & Glamour appointment for ${service} has been rescheduled to ${date} at ${time}. Questions? Reply or call us! - JoJany`;
    return dispatchSms({ bookingId, event: 'booking_rescheduled', toId: phone, toNumber: phone, message: msg });
}

export async function sendClientCancellationSMS(bookingId: string, phone: string, customerName: string, service: string, date: string) {
    const msg = `Hi ${customerName}, your Glitz & Glamour appointment for ${service} on ${date} has been cancelled. To rebook, visit glitzandglamours.com or contact us. Sorry for any inconvenience! - JoJany`;
    return dispatchSms({ bookingId, event: 'booking_cancelled', toId: phone, toNumber: phone, message: msg });
}

// JoJany no longer gets a cancellation SMS — only the client does.
export async function sendCancellationSMS(_name: string, _service: string, _date: string) {
    return { success: true };
}

export async function sendCustomSMS(phone: string, message: string, event: string = 'manual_sms') {
    return dispatchSms({ bookingId: 'manual', event, toId: phone, toNumber: phone, message });
}

export async function sendClientCompletedSMS(bookingId: string, phone: string, customerName: string, service: string) {
    const firstName = customerName.trim().split(' ')[0];
    const msg = `Hi ${firstName}! 🌸 Your ${service} appointment is all done — thank you for visiting Glitz & Glamour! We'd love to see you again. Book anytime at glitzandglamours.com 💅 - JoJany`;
    return dispatchSms({ bookingId, event: 'booking_completed', toId: phone, toNumber: phone, message: msg });
}

export async function sendReviewRequestSMS(
    bookingId: string,
    phone: string,
    customerName: string,
    reviewUrl: string,
    isFirstVisit: boolean,
    service?: string
) {
    const firstName = customerName.trim().split(' ')[0];
    // AI generates a unique, attractive message with [REVIEW_LINK] placeholder
    const { sms } = await generateReviewMessage(firstName, service || '', isFirstVisit);
    const msg = sms.includes('[REVIEW_LINK]')
        ? sms.replace('[REVIEW_LINK]', reviewUrl)
        : `${sms} ${reviewUrl}`;
    return dispatchSms({ bookingId, event: 'review_request', toId: phone, toNumber: phone, message: msg });
}

// Internal — exposed for the admin diagnostic endpoint only
export async function __diagnosticSend(toNumber: string, toId: string): Promise<{
    hasApiKey: boolean;
    apiKeyPrefix?: string;
    apiKeySuffix?: string;
    apiKeyMetadata?: Record<string, unknown>;
    baseUrl: string;
    fromNumber?: string;
    ownerPhoneConfigured?: string;
    response?: unknown;
    error?: string;
    errorDetail?: unknown;
}> {
    const apiKey = process.env.PINGRAM_API_KEY;
    const baseUrl = process.env.PINGRAM_BASE_URL || 'https://api.pingram.io';
    const fromNumber = process.env.PINGRAM_FROM_NUMBER;
    const ownerPhoneConfigured = process.env.OWNER_PHONE_NUMBER;

    const hasApiKey = !!apiKey && apiKey !== 'placeholder';

    let apiKeyMetadata: Record<string, unknown> | undefined;
    let apiKeyPrefix: string | undefined;
    let apiKeySuffix: string | undefined;
    if (apiKey) {
        apiKeyPrefix = apiKey.slice(0, 14);  // e.g. "pingram_sk_eyJ"
        apiKeySuffix = apiKey.slice(-6);
        // Key is a JWT-like triple. Decode the middle segment (non-secret metadata).
        try {
            const parts = apiKey.replace(/^pingram_sk_/, '').replace(/^pingram_pk_/, '').split('.');
            if (parts.length >= 2) {
                const payload = Buffer.from(parts[1], 'base64').toString('utf8');
                apiKeyMetadata = JSON.parse(payload);
            }
        } catch {
            // ignore – metadata is best-effort
        }
    }

    if (!hasApiKey) {
        return { hasApiKey: false, baseUrl, fromNumber, ownerPhoneConfigured };
    }

    try {
        const { Pingram } = await import('pingram');
        const client = new Pingram({ apiKey: apiKey!, baseUrl });
        const response = await client.send({
            type: 'booking_request',
            to: { id: toId, number: toNumber },
            sms: { message: `[DIAGNOSTIC] Glitz & Glamour SMS test @ ${new Date().toISOString()}` },
        });
        return {
            hasApiKey: true, apiKeyPrefix, apiKeySuffix, apiKeyMetadata,
            baseUrl, fromNumber, ownerPhoneConfigured,
            response,
        };
    } catch (e) {
        const err = e as Error & { response?: unknown };
        let errorDetail: unknown = err?.message || String(e);
        // Pingram SDK throws ResponseError — try to read the raw fetch Response if present.
        const maybeResponse = (e as { response?: { status?: number; statusText?: string; text?: () => Promise<string> } })?.response;
        if (maybeResponse && typeof maybeResponse.text === 'function') {
            try {
                const bodyText = await maybeResponse.text();
                errorDetail = {
                    status: maybeResponse.status,
                    statusText: maybeResponse.statusText,
                    body: bodyText,
                };
            } catch {
                // ignore
            }
        }
        return {
            hasApiKey: true, apiKeyPrefix, apiKeySuffix, apiKeyMetadata,
            baseUrl, fromNumber, ownerPhoneConfigured,
            error: err?.message || String(e),
            errorDetail,
        };
    }
}
