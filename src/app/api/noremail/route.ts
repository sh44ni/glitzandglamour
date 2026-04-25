import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdminRequest } from '@/lib/adminAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// We initialize the Resend client with the secondary API key.
// Ensure this environment variable is set on the VPS.
const resend = new Resend(process.env.RESEND_API_KEY_SECONDARY);

export async function POST(req: NextRequest) {
  try {
    // Require admin authentication (JWT cookie) — no more hardcoded passcode
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 sends per hour even for admin
    const rl = rateLimit(getClientIp(req), 'noremail', { limit: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many emails sent. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields: To, Subject, and Body are needed.' }, { status: 400 });
    }

    // Split 'to' by comma in case multiple recipients are provided
    const recipients = to.split(',').map((email: string) => email.trim()).filter((email: string) => email);

    // Cap recipients to prevent mass-mailing
    if (recipients.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 recipients per send.' }, { status: 400 });
    }

    // Using the specifically requested sender address
    const data = await resend.emails.send({
      from: 'pakvisa.noreply@glitzandglamours.com',
      to: recipients,
      subject,
      html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Secondary Resend API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send email through secondary client.' },
      { status: 500 }
    );
  }
}
