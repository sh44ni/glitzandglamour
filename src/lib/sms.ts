<<<<<<< HEAD
// Pingram SMS helper
// Falls back to console.log if API key is placeholder

import { logNotification, detectSmsError } from './notifLogger';

async function buildPingram() {
    const apiKey = process.env.PINGRAM_API_KEY;
    if (!apiKey || apiKey === 'placeholder') return null;
    const { Pingram } = await import('pingram');
    return new Pingram({ apiKey, baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io' });
}

// ── JoJany: new booking alert ─────────────────────────────────────────────────

export async function sendBookingSMS(
    bookingId: string,
=======
// Pingram SMS helper — sends SMS to JoJany on new booking
// Falls back to console.log if API key is placeholder

export async function sendBookingSMS(
>>>>>>> a7fa34923a476d02ba3492394f12a32694860ecf
    customerName: string,
    service: string,
    date: string,
    time: string,
    notes?: string,
    phone?: string | null
) {
<<<<<<< HEAD
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
=======
    const apiKey = process.env.PINGRAM_API_KEY;
    const ownerPhone = process.env.OWNER_PHONE_NUMBER;
    const ownerId = process.env.OWNER_NOTIFICATION_ID;

    if (!apiKey || apiKey === 'placeholder') {
        console.log('[SMS SKIPPED - No Pingram key] New booking:', {
            customerName, service, date, time,
        });
        return { success: false, reason: 'no-key' };
    }

    const phoneInfo = phone ? ` Phone: ${phone}.` : '';
    const message = `New booking! ${customerName} wants ${service} on ${date} at ${time}.${phoneInfo} Notes: ${notes || 'None'}. Login: glitzandglamours.com/admin`;

    try {
        const { Pingram } = await import('pingram');
        const pingram = new Pingram({
            apiKey,
            baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io',
        });

        await pingram.send({
            type: 'booking_request',
            to: {
                id: ownerId || 'info@glitzandglamours.com',
                number: ownerPhone || '+17602905910',
            },
            sms: { message },
        });

        return { success: true };
    } catch (error) {
>>>>>>> a7fa34923a476d02ba3492394f12a32694860ecf
        console.error('[SMS ERROR]', error);
        return { success: false, error };
    }
}

<<<<<<< HEAD
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

// ── JoJany: cancellation alert (kept for owner awareness) ────────────────────
// NOTE: As per spec, only NEW BOOKING goes to JoJany. Cancellation SMS to JoJany removed.
// sendCancellationSMS kept for backwards compatibility but is now a no-op stub.
export async function sendCancellationSMS(_name: string, _service: string, _date: string) {
    // JoJany no longer gets a cancellation SMS — only the client does.
    return { success: true };
}
=======
export async function sendCancellationSMS(
    customerName: string,
    service: string,
    date: string
) {
    const apiKey = process.env.PINGRAM_API_KEY;
    const ownerPhone = process.env.OWNER_PHONE_NUMBER;
    const ownerId = process.env.OWNER_NOTIFICATION_ID;

    if (!apiKey || apiKey === 'placeholder') {
        console.log('[SMS SKIPPED] Cancellation:', { customerName, service, date });
        return { success: false, reason: 'no-key' };
    }

    try {
        const { Pingram } = await import('pingram');
        const pingram = new Pingram({
            apiKey,
            baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io',
        });

        await pingram.send({
            type: 'booking_request',
            to: {
                id: ownerId || 'info@glitzandglamours.com',
                number: ownerPhone || '+17602905910',
            },
            sms: {
                message: `Booking cancelled: ${customerName} for ${service} on ${date}.`,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('[SMS ERROR]', error);
        return { success: false, error };
    }
}
>>>>>>> a7fa34923a476d02ba3492394f12a32694860ecf
