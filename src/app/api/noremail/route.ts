import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// We initialize the Resend client with the secondary API key.
// Ensure this environment variable is set on the VPS.
const resend = new Resend(process.env.RESEND_API_KEY_SECONDARY);

export async function POST(req: Request) {
  try {
    const { to, subject, html, passcode } = await req.json();

    // The hardcoded generic passcode as requested, since this is a completely separate isolated app
    if (passcode !== 'pakvisa2026') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields: To, Subject, and Body are needed.' }, { status: 400 });
    }

    // Split 'to' by comma in case multiple recipients are provided
    const recipients = to.split(',').map((email: string) => email.trim()).filter((email: string) => email);

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
