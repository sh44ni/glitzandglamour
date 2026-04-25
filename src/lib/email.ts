import { dispatchEmail } from './notify';
import { generateReviewMessage } from './reviewAI';

/** Escape HTML special characters to prevent injection in email templates */
function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const baseHtml = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0A0A0A; font-family: 'Poppins', Arial, sans-serif; color: #ffffff; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .header { text-align: center; padding: 32px 0 24px; }
  .logo { font-size: 28px; font-weight: 800; color: #FF2D78; letter-spacing: -0.5px; }
  .logo span { color: #ffffff; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,45,120,0.2); border-radius: 20px; padding: 32px; margin: 24px 0; }
  .pink { color: #FF2D78; }
  .muted { color: #888888; font-size: 14px; }
  .btn { display: inline-block; background: #FF2D78; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
  .footer { text-align: center; padding: 24px 0; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 32px; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
  p { font-size: 15px; line-height: 1.7; color: #cccccc; margin-bottom: 12px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">Glitz <span>&</span> Glamour</div>
    <p class="muted" style="margin-top:4px">812 Frances Dr, Vista, CA 92083 · info@glitzandglamours.com</p>
  </div>
  ${content}
  <div class="footer">
    <p class="muted">© 2026 Glitz & Glamour Studio · 812 Frances Dr, Vista, CA 92083</p>
    <p class="muted">Powered by <a href="https://projekts.pk" style="color:#FF2D78;text-decoration:none">projekts.pk</a></p>
  </div>
</div>
</body>
</html>
`;

async function sendAndLog(opts: {
  bookingId: string;
  event: string;
  to: string;
  subject: string;
  html: string;
  previewText?: string;
}) {
  return dispatchEmail({
    bookingId: opts.bookingId,
    event: opts.event,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    previewText: opts.previewText,
  });
}

export async function sendCustomEmail(to: string, subject: string, html: string, event: string = 'manual_email') {
  return sendAndLog({
    bookingId: 'manual',
    event,
    to,
    subject,
    html: baseHtml(`
      <div class="card">
        <h1>A message from Glitz & Glamour ✨</h1>
        <p>${html.replace(/\n/g, '<br>')}</p>
      </div>
      <p style="text-align:center">With love,<br><strong class="pink">JoJany 💅</strong></p>
    `),
  });
}

export async function sendBookingReceived(bookingId: string, to: string, name: string, service: string, date: string, time: string) {
  return sendAndLog({
    bookingId, event: 'booking_received', to,
    subject: `Got your booking, ${esc(name)}! 💅`,
    previewText: `Your booking for ${esc(service)} on ${esc(date)} is received.`,
    html: baseHtml(`
      <div class="card">
        <h1>I got it! 🌸</h1>
        <p>Hey <strong class="pink">${esc(name)}</strong>,</p>
        <p>I received your booking request for <strong>${esc(service)}</strong> on <strong>${esc(date)}</strong> at <strong>${esc(time)}</strong>.</p>
        <p>I'll reach out soon to discuss your look and finalize everything. Can't wait to see you!</p>
        <p class="muted" style="margin-top:16px;font-size:13px">💡 Prices are finalized after our consultation — the rate shown is just a starting point.</p>
      </div>
      <p style="text-align:center">With love,<br><strong class="pink">JoJany ✨</strong></p>
    `),
  });
}

export async function sendBookingConfirmed(bookingId: string, to: string, name: string, service: string, date: string) {
  return sendAndLog({
    bookingId, event: 'booking_confirmed', to,
    subject: `You're all set! See you ${esc(date)} 🌸`,
    previewText: `Your ${esc(service)} appointment on ${esc(date)} is confirmed.`,
    html: baseHtml(`
      <div class="card">
        <h1>You're confirmed! ✅</h1>
        <p>Hey <strong class="pink">${esc(name)}</strong>,</p>
        <p>Your appointment for <strong>${esc(service)}</strong> on <strong class="pink">${esc(date)}</strong> is confirmed.</p>
        <p>I can't wait to see you! If anything comes up, just reach out.</p>
      </div>
      <p style="text-align:center">See you soon!<br><strong class="pink">JoJany 💅</strong></p>
    `),
  });
}

export async function sendBookingRescheduled(bookingId: string, to: string, name: string, service: string, date: string) {
  return sendAndLog({
    bookingId, event: 'booking_rescheduled', to,
    subject: `🗓️ Appointment Update: Your booking has been rescheduled!`,
    previewText: `Your ${esc(service)} appointment has a new time: ${esc(date)}.`,
    html: baseHtml(`
      <div class="card">
        <h1>Appointment Rescheduled 🗓️</h1>
        <p>Hey <strong class="pink">${esc(name)}</strong>,</p>
        <p>Your confirmed appointment for <strong>${esc(service)}</strong> has been rescheduled by the studio.</p>
        <p>Your new appointment time is: <strong class="pink">${esc(date)}</strong></p>
        <p>If this new time doesn't work for you, please contact us.</p>
      </div>
      <p style="text-align:center">See you soon!<br><strong class="pink">JoJany 💅</strong></p>
    `),
  });
}

export async function sendStampEarned(bookingId: string, to: string, name: string, currentStamps: number, totalStamps: number = 10) {
  const isMax = currentStamps >= totalStamps;
  return sendAndLog({
    bookingId, event: 'stamp_earned', to,
    subject: isMax ? '💅 Free Nail Set Unlocked!' : `Stamp earned! 🐱 You're at ${currentStamps}/${totalStamps}`,
    previewText: isMax ? 'You collected all 10 stamps — free nail set awaits!' : `${totalStamps - currentStamps} more visits until your free nail set.`,
    html: baseHtml(`
      <div class="card">
        <h1>${isMax ? '💅 Free Nail Set Unlocked!' : `🐱 Stamp #${currentStamps} Earned!`}</h1>
        <p>Hey <strong class="pink">${esc(name)}</strong>,</p>
        ${isMax
        ? `<p>You've collected all <strong class="pink">10 stamps!</strong> 🎉 You've earned a free nail set — next time you visit, just let me know!</p>`
        : `<p>Amazing seeing you! You now have <strong class="pink">${currentStamps}/${totalStamps} stamps</strong> on your loyalty card.</p>
             <p>${totalStamps - currentStamps} more visit${totalStamps - currentStamps === 1 ? '' : 's'} until your free nail set!</p>`
      }
      </div>
      <p style="text-align:center">Thank you for your loyalty! 💖<br><strong class="pink">JoJany ✨</strong></p>
    `),
  });
}

export async function sendGuestStampWaiting(bookingId: string, to: string, name: string, expiryDate: string) {
  return sendAndLog({
    bookingId, event: 'stamp_earned', to,
    subject: `Your stamp is waiting, ${name} 🐱`,
    previewText: 'Sign in to claim your loyalty stamp before it expires.',
    html: baseHtml(`
      <div class="card">
        <h1>Your stamp is waiting! 🐱</h1>
        <p>Hey <strong class="pink">${esc(name)}</strong>,</p>
        <p>You visited the studio but haven't claimed your Kitty stamp yet.</p>
        <p>Sign in with Google to save it to your loyalty card.</p>
        <p style="color:#FF2D78;font-weight:600">⚠️ Expires: ${esc(expiryDate)}</p>
        <a class="btn" href="${process.env.NEXTAUTH_URL}/sign-in">Claim My Stamp →</a>
      </div>
      <p style="text-align:center">Don't let it expire! 💖<br><strong class="pink">JoJany ✨</strong></p>
    `),
  });
}

export async function sendVerificationEmail(bookingId: string, to: string, name: string, token: string) {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://glitzandglamours.com';
  const verifyUrl = `${siteUrl}/api/auth/verify-email?token=${token}`;
  return sendAndLog({
    bookingId, event: 'email_verification', to,
    subject: `Confirm your Glitz & Glamour account 💅`,
    previewText: 'One quick step — confirm your email to unlock your loyalty card.',
    html: baseHtml(`
      <div class="card">
        <h1>Almost there! 🌸</h1>
        <p>Hey <strong class="pink">${esc(name)}</strong>,</p>
        <p>Thanks for creating an account at Glitz & Glamour Studio! Just one quick step — confirm your email address to unlock your loyalty card and booking history.</p>
        <p style="text-align:center;margin:24px 0">
          <a class="btn" href="${verifyUrl}">Confirm My Email ✅</a>
        </p>
        <p class="muted" style="font-size:13px">This link expires in 48 hours. If you didn't sign up, you can safely ignore this email.</p>
      </div>
      <p style="text-align:center">Welcome to the studio! 💖<br><strong class="pink">JoJany ✨</strong></p>
    `),
  });
}

export async function sendReviewRequestEmail(
  bookingId: string,
  to: string,
  name: string,
  service: string,
  reviewUrl: string,
  isFirstVisit: boolean
) {
  const firstName = name.trim().split(' ')[0];
  const { emailBody } = await generateReviewMessage(firstName, service, isFirstVisit);

  const linkedBody = emailBody
    .replace('[REVIEW_LINK]', `<a href="${reviewUrl}" style="color:#FF2D78;font-weight:700;text-decoration:underline">tap here to leave your Google review ✨</a>`)
    .replace(/\n/g, '<br>');

  const discountBlock = isFirstVisit ? `
    <div style="background:linear-gradient(135deg,rgba(255,45,120,0.12),rgba(255,107,168,0.06));border:1px solid rgba(255,45,120,0.25);border-radius:14px;padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="color:#FF2D78;font-weight:700;font-size:15px;margin:0 0 6px">First Visit Reward 💗</p>
      <p style="color:#ddd;font-size:13px;margin:0">Leave a review and receive <strong style="color:#FF2D78">$10 OFF</strong> your next visit. Your personal code appears after you submit!</p>
    </div>` : '';

  return sendAndLog({
    bookingId, event: 'review_request', to,
    subject: `${firstName}, thank you for visiting! 💗`,
    previewText: isFirstVisit ? 'Leave a review and get $10 off your next visit!' : 'Your review means the world to us 🌸',
    html: baseHtml(`
      <div class="card">
        <h1>Thank you, ${esc(firstName)}! 💗</h1>
        <p>${linkedBody}</p>
        ${discountBlock}
        <p style="text-align:center;margin:24px 0">
          <a class="btn" href="${reviewUrl}">Leave a Google Review 🫶</a>
        </p>
        <p class="muted" style="font-size:12px;text-align:center">Thank you for supporting a small business.</p>
      </div>
      <p style="text-align:center;color:#555;font-size:13px">With love,<br><strong style="color:#FF2D78">JoJany ✨</strong></p>
    `),
  });
}
