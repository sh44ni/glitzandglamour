import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logNotification } from '@/lib/notifLogger';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const { reviewRequestId, method, to, message, clientName } = await req.json();

        if (!reviewRequestId || !method || !to || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let status = 'failed';

        if (method === 'sms') {
            const apiKey = process.env.PINGRAM_API_KEY;
            if (apiKey && apiKey !== 'placeholder') {
                try {
                    const { Pingram } = await import('pingram');
                    const pingram = new Pingram({ apiKey, baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io' });
                    await pingram.send({ type: 'review_request', to: { id: to, number: to }, sms: { message } });
                    status = 'sent';
                    await logNotification({ bookingId: reviewRequestId, event: 'review_request', type: 'sms', recipient: to, status: 'sent', message });
                } catch (e) {
                    console.error('Pingram error:', e);
                }
            } else {
                status = 'skipped_no_key';
            }
        } 
        else if (method === 'email') {
            const resendKey = process.env.RESEND_API_KEY;
            if (resendKey) {
                try {
                    const resend = new Resend(resendKey);
                    
                    // Reconstruct HTML for email
                    const reviewUrl = message.split('Review Link: ')[1] || 'https://glitzandglamours.com';
                    const justMessage = message.split('\n\nReview Link: ')[0];

                    await resend.emails.send({
                        from: `Glitz & Glamour <${process.env.RESEND_FROM || 'info@glitzandglamours.com'}>`,
                        to: to,
                        subject: 'Thank you for your visit! 💖',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                                <h2 style="color: #FF2D78;">Glitz & Glamour Studio</h2>
                                <p>Hi ${clientName || 'Beautiful'},</p>
                                <p style="line-height: 1.6;">${justMessage.replace(/\n/g, '<br/>')}</p>
                                <br/>
                                <a href="${reviewUrl}" style="display:inline-block;background:#FF2D78;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;">Leave a Review</a>
                                <p style="margin-top: 30px; font-size: 12px; color: #888;">© Glitz & Glamour Studio</p>
                            </div>
                        `
                    });
                    status = 'sent';
                    await logNotification({ bookingId: reviewRequestId, event: 'review_request', type: 'email', recipient: to, status: 'sent', message });
                } catch (e) {
                    console.error('Resend error:', e);
                }
            } else {
                status = 'skipped_no_key';
            }
        }

        return NextResponse.json({ success: status === 'sent', status });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
