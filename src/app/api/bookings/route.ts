import { NextRequest, NextResponse } from 'next/server';
import { BookingData } from '@/types';
import { getServiceById } from '@/data/services';

// Admin API URL for forwarding bookings
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5000';

async function sendOwnerSMS(booking: BookingData) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const ownerPhone = process.env.OWNER_PHONE_NUMBER || '+17602905910';

    if (!accountSid || !authToken || !messagingServiceSid) return;

    const body = `New Booking Request!\nName: ${booking.name}\nPhone: ${booking.phone}\nEmail: ${booking.email}\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}${booking.notes ? `\nNotes: ${booking.notes}` : ''}\n\nView: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://glitzandglamourstudio.com'}/admin/calendar`;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ MessagingServiceSid: messagingServiceSid, To: ownerPhone, Body: body }).toString(),
    });
}

async function sendCustomerEmail(booking: BookingData) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromDomain = process.env.RESEND_FROM_DOMAIN || 'glitzandglamours.com';
    if (!apiKey) return;

    const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#fff;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#FF1493,#C71185);padding:32px;text-align:center">
    <h1 style="margin:0;font-size:28px;color:#fff">Glitz &amp; Glamour Studio</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-style:italic">&ldquo;Unleash the Glitz, Embrace the Glamour&rdquo;</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#FF1493;margin-top:0">Booking Request Received!</h2>
    <p style="color:#ccc;line-height:1.6">Hi <strong style="color:#fff">${booking.name}</strong>,</p>
    <p style="color:#ccc;line-height:1.6">I will be reaching out shortly to confirm your appointment details and collect the deposit required to secure your booking. Please note, your appointment is not confirmed until you receive confirmation from me.</p>
    <div style="background:#1A1A1A;border-radius:8px;padding:20px;margin:24px 0">
      <h3 style="color:#FF1493;margin-top:0">Your Request Details</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#888;padding:6px 0">Service</td><td style="color:#fff;padding:6px 0">${booking.service}</td></tr>
        <tr><td style="color:#888;padding:6px 0">Date</td><td style="color:#fff;padding:6px 0">${booking.date}</td></tr>
        <tr><td style="color:#888;padding:6px 0">Time</td><td style="color:#fff;padding:6px 0">${booking.time}</td></tr>
        ${booking.notes ? `<tr><td style="color:#888;padding:6px 0;vertical-align:top">Notes</td><td style="color:#fff;padding:6px 0">${booking.notes}</td></tr>` : ''}
      </table>
    </div>
    <div style="background:#1A1A1A;border-radius:8px;padding:20px;border-left:3px solid #FF1493">
      <p style="color:#FF1493;font-weight:bold;margin-top:0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Accepted Payment Methods</p>
      <p style="color:#ccc;margin-bottom:0">Cash &middot; Cash App &middot; Venmo &middot; Zelle</p>
    </div>
    <p style="color:#888;font-size:14px;margin-top:24px">Questions? Reach me at <a href="mailto:glitzandglamour12@gmail.com" style="color:#FF1493">glitzandglamour12@gmail.com</a> or <a href="tel:+17602905910" style="color:#FF1493">(760) 290-5910</a></p>
  </div>
  <div style="padding:16px 32px;text-align:center;border-top:1px solid #1A1A1A">
    <p style="color:#555;font-size:12px;margin:0">Glitz &amp; Glamour Studio &middot; 812 Frances Dr, Vista, CA 92084</p>
  </div>
</div>`;

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: `JoJany @ Glitz & Glamour <bookings@${fromDomain}>`,
            to: [booking.email],
            subject: 'Booking Request Received – Glitz & Glamour Studio',
            html,
        }),
    });
}

/**
 * POST /api/bookings
 * Handle booking form submissions - forwards to admin panel + sends SMS/email notifications
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate phone format (10 digits)
        const phoneDigits = body.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            return NextResponse.json(
                { success: false, error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Get service name from ID
        const service = getServiceById(body.service);
        const serviceName = service ? `${service.name} - ${service.price}` : body.service;

        const bookingData: BookingData = {
            name: body.name,
            email: body.email,
            phone: body.phone,
            service: serviceName,
            date: body.date,
            time: body.time,
            notes: body.notes || '',
            timestamp: body.timestamp || new Date().toISOString(),
            status: 'pending',
        };

        // Save to admin bookings store (non-critical)
        try {
            const { writeBooking } = await import('@/lib/bookingStore');
            await writeBooking(bookingData);
        } catch (error) {
            console.warn('Could not save to admin store:', error);
        }

        // Send SMS to owner (non-blocking)
        sendOwnerSMS(bookingData).catch((err) => console.warn('SMS failed:', err));

        // Send confirmation email to customer (non-blocking)
        sendCustomerEmail(bookingData).catch((err) => console.warn('Email failed:', err));

        return NextResponse.json({
            success: true,
            message: 'Booking request received successfully',
        });
    } catch (error) {
        console.error('Booking API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process booking request' },
            { status: 500 }
        );
    }
}
