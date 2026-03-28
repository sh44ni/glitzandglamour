import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { logNotification } from '@/lib/notifLogger';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const { clientName, clientPhone, clientEmail, message, autoSend = true } = await req.json();

        if (!clientName || !message) {
            return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
        }

        // Generate token
        const token = nanoid(16);

        // Save to db
        // Note: Using `any` cast here as a quick bypass if Prisma client generation failed locally,
        // but it will be type-safe when deployed to VPS.
        const reviewRequest = await (prisma as any).reviewRequest.create({
            data: {
                token,
                clientName,
                clientPhone: clientPhone || null,
                clientEmail: clientEmail || null,
                message
            }
        });

        const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://glitzandglamours.com';
        const reviewUrl = `${baseUrl}/leave-review/${token}`;

        // Append the link to the message for SMS
        const finalMessage = `${message}\n\nReview Link: ${reviewUrl}`;

        let smsStatus = 'not_attempted';
        let emailStatus = 'not_attempted';

        // Send SMS via pingram
        if (clientPhone) {
            if (autoSend) {
                const apiKey = process.env.PINGRAM_API_KEY;
                if (apiKey && apiKey !== 'placeholder') {
                    try {
                        const { Pingram } = await import('pingram');
                        const pingram = new Pingram({ apiKey, baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io' });
                        await pingram.send({ type: 'review_request', to: { id: clientPhone, number: clientPhone }, sms: { message: finalMessage } });
                        smsStatus = 'sent';
                        await logNotification({ bookingId: reviewRequest.id, event: 'review_request', type: 'sms', recipient: clientPhone, status: 'sent', message: finalMessage });
                    } catch (e) {
                        console.error('Pingram error:', e);
                        smsStatus = 'failed';
                    }
                } else {
                    smsStatus = 'skipped_no_key';
                }
            } else {
                smsStatus = 'skipped_by_user';
            }
        }

        // Send Email via Resend
        if (clientEmail) {
            if (autoSend) {
                const resendKey = process.env.RESEND_API_KEY;
                if (resendKey) {
                    try {
                        const resend = new Resend(resendKey);
                        await resend.emails.send({
                            from: `Glitz & Glamour <${process.env.RESEND_FROM || 'info@glitzandglamours.com'}>`,
                            to: clientEmail,
                            subject: 'Thank you for your visit! 💖',
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                                    <h2 style="color: #FF2D78;">Glitz & Glamour Studio</h2>
                                    <p>Hi ${clientName},</p>
                                    <p style="line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
                                    <br/>
                                    <a href="${reviewUrl}" style="display:inline-block;background:#FF2D78;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;">Leave a Review</a>
                                    <p style="margin-top: 30px; font-size: 12px; color: #888;">© Glitz & Glamour Studio</p>
                                </div>
                            `
                        });
                        emailStatus = 'sent';
                        await logNotification({ bookingId: reviewRequest.id, event: 'review_request', type: 'email', recipient: clientEmail, status: 'sent', message: finalMessage });
                    } catch (e) {
                        console.error('Resend error:', e);
                        emailStatus = 'failed';
                    }
                } else {
                    emailStatus = 'skipped_no_key';
                }
            } else {
                emailStatus = 'skipped_by_user';
            }
        }

        return NextResponse.json({ success: true, url: reviewUrl, fullMessage: finalMessage, smsStatus, emailStatus });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
