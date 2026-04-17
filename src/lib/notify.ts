// Pingram Email dispatcher — mirrors dispatchSms() in sms.ts.
// Used by src/lib/email.ts and src/lib/contracts/contractEmails.ts.

import { logNotification, detectPingramSoftWarning } from './notifLogger';
import { buildPingram } from './pingramClient';
import type { PingramSendResult } from './sms';

const FROM_EMAIL = process.env.PINGRAM_FROM_EMAIL || 'info@glitzandglamours.com';
const FROM_NAME = process.env.PINGRAM_FROM_NAME || 'Glitz & Glamour';

export interface EmailDispatchOpts {
    bookingId: string;
    event: string;
    to: string;           // recipient email address
    subject: string;
    html: string;
    previewText?: string;
    /** Buffer attachments (e.g. contract PDFs) — base64-encoded before sending. */
    attachments?: { filename: string; content: Buffer }[];
}

export async function dispatchEmail(opts: EmailDispatchOpts): Promise<PingramSendResult> {
    const { bookingId, event, to, subject, html, previewText, attachments } = opts;

    const pingram = await buildPingram();
    if (!pingram) {
        console.log('[EMAIL SKIPPED - No Pingram key]', { event, to });
        await logNotification({
            bookingId, type: 'email', event, recipient: to, status: 'skipped',
            error: 'no_api_key', message: subject,
        });
        return { success: false, reason: 'no-key', errorCode: 'no_api_key' };
    }

    // Convert Buffer attachments to Pingram's base64 url format
    const pingramAttachments = attachments?.map(a => ({
        filename: a.filename,
        content: a.content.toString('base64'),
    }));

    try {
        const response = await pingram.send({
            type: event,
            to: { id: to, email: to },
            forceChannels: ['EMAIL'],
            email: {
                subject,
                html,
                previewText,
                senderName: FROM_NAME,
                senderEmail: FROM_EMAIL,
            },
            options: pingramAttachments?.length
                ? { email: { attachments: pingramAttachments } }
                : undefined,
        } as Parameters<typeof pingram.send>[0]) as { trackingId?: string; messages?: string[] } | undefined;

        const trackingId = response?.trackingId;
        const soft = detectPingramSoftWarning(response);

        if (soft) {
            console.warn('[EMAIL SOFT-FAILURE]', { event, to, trackingId, warning: soft, response });
            await logNotification({
                bookingId, type: 'email', event, recipient: to, status: 'failed',
                error: soft,
                message: trackingId ? `[tracking=${trackingId}] ${subject}` : subject,
            });
            return { success: false, reason: 'soft-failure', errorCode: soft, trackingId, rawResponse: response };
        }

        await logNotification({
            bookingId, type: 'email', event, recipient: to, status: 'sent',
            message: trackingId ? `[tracking=${trackingId}] ${subject}` : subject,
        });
        return { success: true, trackingId, rawResponse: response };
    } catch (error) {
        const errCode = detectEmailError(error);
        console.error('[EMAIL ERROR]', { event, to, error });
        await logNotification({
            bookingId, type: 'email', event, recipient: to, status: 'failed',
            error: errCode, message: subject,
        });
        return { success: false, reason: 'exception', errorCode: errCode, rawError: error };
    }
}

function detectEmailError(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error);
    if (/rate.limit|too many|quota|limit/i.test(msg)) return 'credits_exhausted';
    if (/invalid.*email|email.*invalid/i.test(msg)) return 'invalid_email';
    if (/domain.*not.*verified|not.*verify/i.test(msg)) return 'domain_not_verified';
    if (/suppress|bounce|complaint/i.test(msg)) return 'email_suppressed';
    if (/network|timeout|ECONNREFUSED/i.test(msg)) return 'network_error';
    return 'unknown_error';
}
