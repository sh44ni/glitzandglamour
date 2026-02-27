// Pingram SMS helper — sends SMS to JoJany on new booking
// Falls back to console.log if API key is placeholder

export async function sendBookingSMS(
    customerName: string,
    service: string,
    date: string,
    time: string,
    notes?: string
) {
    const apiKey = process.env.PINGRAM_API_KEY;
    const ownerPhone = process.env.OWNER_PHONE_NUMBER;
    const ownerId = process.env.OWNER_NOTIFICATION_ID;

    if (!apiKey || apiKey === 'placeholder') {
        console.log('[SMS SKIPPED - No Pingram key] New booking:', {
            customerName, service, date, time,
        });
        return { success: false, reason: 'no-key' };
    }

    const message = `New booking! ${customerName} wants ${service} on ${date} at ${time}. Notes: ${notes || 'None'}. Login: glitzandglamours.com/admin`;

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
        console.error('[SMS ERROR]', error);
        return { success: false, error };
    }
}

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
