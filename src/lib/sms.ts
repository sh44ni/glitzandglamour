// Pingram SMS helper
// Falls back to console.log if API key is placeholder

import { logNotification, detectSmsError } from './notifLogger';
import { generateReviewMessage } from './reviewAI';

async function buildPingram() {
    const apiKey = process.env.PINGRAM_API_KEY;
    if (!apiKey || apiKey === 'placeholder') return null;
    const { Pingram } = await import('pingram');
    return new Pingram({ apiKey, baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io' });
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
) {
    const pingram = await buildPingram();
    const ownerPhone = process.env.OWNER_PHONE_NUMBER || '+17602905910';
    const ownerId = process.env.OWNER_NOTIFICATION_ID || 'info@glitzandglamours.com';
    const phoneInfo = phone ? ` Phone: ${phone}.` : '';
    const message = `New booking! ${customerName} wants ${service} on ${date} at ${time}.${phoneInfo} Notes: ${notes || 'None'}. Login: glitzandglamours.com/admin`;

    if (!pingram) {
        console.log('[SMS SKIPPED - No Pingram key] New booking:', { customerName, service, date, time });
        await logNotification({ bookingId, type: 'sms', event: 'booking_received', recipient: ownerPhone, status: 'skipped', message });
        return { success: false, reason: 'no-key' };
    }

    try {
        await pingram.send({ type: 'booking_request', to: { id: ownerId, number: ownerPhone }, sms: { message } });
        await logNotification({ bookingId, type: 'sms', event: 'booking_received', recipient: ownerPhone, status: 'sent', message });
        return { success: true };
    } catch (error) {
        const errCode = detectSmsError(error);
        await logNotification({ bookingId, type: 'sms', event: 'booking_received', recipient: ownerPhone, status: 'failed', error: errCode, message });
        console.error('[SMS ERROR]', error);
        return { success: false, error };
    }
}

// ── Client SMS helpers ────────────────────────────────────────────────────────

async function sendSmsToClient(
    bookingId: string,
    event: string,
    phone: string,
    message: string
) {
    const pingram = await buildPingram();
    if (!pingram) {
        console.log('[CLIENT SMS SKIPPED - No Pingram key]', message);
        await logNotification({ bookingId, type: 'sms', event, recipient: phone, status: 'skipped', message });
        return { success: false, reason: 'no-key' };
    }
    try {
        await pingram.send({ type: 'booking_request', to: { id: phone, number: phone }, sms: { message } });
        await logNotification({ bookingId, type: 'sms', event, recipient: phone, status: 'sent', message });
        return { success: true };
    } catch (error) {
        const errCode = detectSmsError(error);
        await logNotification({ bookingId, type: 'sms', event, recipient: phone, status: 'failed', error: errCode, message });
        console.error('[CLIENT SMS ERROR]', error);
        return { success: false, error };
    }
}

export async function sendClientConfirmationSMS(bookingId: string, phone: string, customerName: string, service: string, date: string, time: string) {
    const msg = `Hi ${customerName}! ✅ Your appointment for ${service} on ${date} at ${time} is confirmed at Glitz & Glamour. See you soon! 💅 - JoJany`;
    return sendSmsToClient(bookingId, 'booking_confirmed', phone, msg);
}

export async function sendClientRescheduledSMS(bookingId: string, phone: string, customerName: string, service: string, date: string, time: string) {
    const msg = `Hi ${customerName}! 🗓️ Your Glitz & Glamour appointment for ${service} has been rescheduled to ${date} at ${time}. Questions? Reply or call us! - JoJany`;
    return sendSmsToClient(bookingId, 'booking_rescheduled', phone, msg);
}

export async function sendClientCancellationSMS(bookingId: string, phone: string, customerName: string, service: string, date: string) {
    const msg = `Hi ${customerName}, your Glitz & Glamour appointment for ${service} on ${date} has been cancelled. To rebook, visit glitzandglamours.com or contact us. Sorry for any inconvenience! - JoJany`;
    return sendSmsToClient(bookingId, 'booking_cancelled', phone, msg);
}

// JoJany no longer gets a cancellation SMS — only the client does.
export async function sendCancellationSMS(_name: string, _service: string, _date: string) {
    return { success: true };
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
    // Replace [REVIEW_LINK] placeholder with the real URL; fallback: append
    const msg = sms.includes('[REVIEW_LINK]')
        ? sms.replace('[REVIEW_LINK]', reviewUrl)
        : `${sms} ${reviewUrl}`;
    return sendSmsToClient(bookingId, 'review_request', phone, msg);
}
