import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = `Glitz & Glamour <${process.env.RESEND_FROM || 'info@glitzandglamours.com'}>`;

function baseHtml(content: string): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
body{margin:0;background:#0A0A0A;font-family:Poppins,system-ui,sans-serif;color:#eee;line-height:1.65;}
.wrap{max-width:560px;margin:0 auto;padding:32px 20px;}
.card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,45,120,0.22);border-radius:18px;padding:28px;margin:20px 0;}
.pink{color:#FF2D78;font-weight:700;}
.btn{display:inline-block;background:#FF2D78;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;margin:16px 0;}
.muted{color:#888;font-size:13px;}
</style></head><body><div class="wrap">${content}
<p class="muted" style="text-align:center;margin-top:28px">Glitz &amp; Glamour Studio · Vista, CA</p>
</div></body></html>`;
}

async function send(
    to: string,
    subject: string,
    html: string,
    attachments?: { filename: string; content: Buffer }[]
): Promise<boolean> {
    if (!resend || !to) return false;
    try {
        await resend.emails.send({ from: FROM, to, subject, html, attachments });
        return true;
    } catch (e) {
        console.error('[contract-email]', subject, e);
        return false;
    }
}

export async function emailContractInviteToClient(opts: {
    to: string;
    clientName: string;
    contractNumber: string;
    eventDateLabel: string;
    signUrl: string;
}): Promise<boolean> {
    const { to, clientName, contractNumber, eventDateLabel, signUrl } = opts;
    return send(
        to,
        `Action required: Review & sign your agreement (${contractNumber})`,
        baseHtml(`
  <div class="card">
    <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
    <h1 style="margin:0 0 14px;font-size:22px;color:#fff">Hi ${clientName || 'there'},</h1>
    <p style="color:#ccc;margin:0 0 12px">Your Beauty &amp; Event Services agreement is ready. Please review the full contract and complete your disclosures, initials, and signature.</p>
    <p style="color:#aaa;font-size:14px;margin:0 0 8px"><strong style="color:#fff">Contract</strong> ${contractNumber}</p>
    <p style="color:#aaa;font-size:14px;margin:0 0 20px"><strong style="color:#fff">Event date</strong> ${eventDateLabel}</p>
    <a class="btn" href="${signUrl}">Review &amp; sign contract</a>
    <p class="muted" style="margin-top:20px">If the button does not work, copy and paste this link into your browser:<br/><span style="word-break:break-all;color:#aaa">${signUrl}</span></p>
  </div>`)
    );
}

export async function emailAdminContractSent(opts: { to: string; contractNumber: string; clientEmail: string }): Promise<boolean> {
    return send(
        opts.to,
        `Contract sent: ${opts.contractNumber}`,
        baseHtml(
            `<div class="card"><p>The special-events contract <span class="pink">${opts.contractNumber}</span> was emailed to <strong>${opts.clientEmail}</strong>.</p></div>`
        )
    );
}

export async function emailAdminClientSigned(opts: {
    to: string;
    contractNumber: string;
    clientName: string;
    referenceCode: string;
}): Promise<boolean> {
    return send(
        opts.to,
        `Signed by client: ${opts.contractNumber}`,
        baseHtml(
            `<div class="card"><p><strong>${opts.clientName}</strong> submitted <span class="pink">${opts.contractNumber}</span>.</p><p class="muted">Open Admin → Contracts to record retainer and add your countersignature.</p></div>`
        )
    );
}

export async function emailClientContractReceived(opts: { to: string; contractNumber: string }): Promise<boolean> {
    const cn = opts.contractNumber || 'GGS Contract';
    return send(
        opts.to,
        `We Received Your Signed Agreement — ${cn}`,
        baseHtml(
            `<div class="card">
  <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
  <h1 style="margin:0 0 14px;font-size:20px;color:#fff">We received your signed agreement — <span class="pink">${cn}</span></h1>
  <p style="color:#ccc;margin:0 0 12px">
    Thank you for submitting your signed agreement <span class="pink">${cn}</span> with Glitz &amp; Glamour Studio! We have successfully received your contract and wanted to make sure you know what happens next.
  </p>

  <p style="color:#ddd;margin:16px 0 10px"><strong style="color:#fff">Please note that your booking is NOT yet confirmed.</strong> Your date will be officially secured and this Agreement will be in full effect only after all three of the following conditions have been met:</p>

  <div style="margin:10px 0 14px;padding:14px 14px;border-radius:14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06)">
    <p style="margin:0 0 6px;color:#cfcfcf">✓ Your signed Agreement has been received — <strong style="color:#fff">Completed</strong></p>
    <p style="margin:0 0 6px;color:#cfcfcf">○ Your non-refundable retainer payment has been received — <strong style="color:#fff">Pending</strong></p>
    <p style="margin:0;color:#cfcfcf">○ Written acceptance has been issued by the Artist — <strong style="color:#fff">Pending</strong></p>
  </div>

  <p style="color:#ccc;margin:0 0 12px">
    If you have already submitted your retainer payment, you are one step away! All that is left is for us to review everything and issue your official written acceptance. You will hear from us within 48 hours.
  </p>

  <p style="color:#ccc;margin:0 0 8px">
    If you have not yet submitted your retainer payment, please do so as soon as possible to avoid losing your preferred date. Payment can be submitted via:
  </p>
  <p style="color:#ccc;margin:0 0 2px">- Zelle: (760) 290-5910 or jojanylavalle@icloud.com</p>
  <p style="color:#ccc;margin:0 0 2px">- Venmo: @jojanylavalle</p>
  <p style="color:#ccc;margin:0 0 12px">- Cash App: $glamaddictbyjojo</p>

  <p style="color:#ccc;margin:0 0 12px">
    Once all three conditions are satisfied, you will receive a separate confirmation email from us along with a full copy of your executed agreement.
  </p>

  <p style="color:#ccc;margin:0 0 12px">
    <strong style="color:#fff">IMPORTANT:</strong> Please do not consider your date held or your booking confirmed until you receive your official confirmation email from Glitz &amp; Glamour Studio. We kindly ask that you avoid making any arrangements based on an assumed confirmation.
  </p>

  <p style="color:#ccc;margin:0 0 8px">If you have any questions in the meantime please reach us via:</p>
  <p style="color:#ccc;margin:0 0 2px">- Text: (760) 290-5910</p>
  <p style="color:#ccc;margin:0 0 2px">- Email: info@glitzandglamours.com</p>
  <p style="color:#ccc;margin:0 0 12px">- Instagram: @GlitzandGlamourStudio (general inquiries only)</p>

  <p style="color:#ddd;margin:0 0 18px">We appreciate you choosing Glitz &amp; Glamour Studio and look forward to being a part of your special day!</p>

  <p style="color:#ccc;margin:0">
    With love,<br/>
    Jojany Lavalle<br/>
    Glitz &amp; Glamour Studio<br/>
    (760) 290-5910<br/>
    info@glitzandglamours.com<br/>
    @GlitzandGlamourStudio<br/>
    <span style="color:#aaa">glitzandglamours.com</span>
  </p>
</div>`
        )
    );
}

export async function emailClientBookingConfirmed(opts: {
    to: string;
    clientName: string;
    contractNumber: string;
    dateConfirmedLabel: string;
    pdf: Buffer;
}): Promise<boolean> {
    const cn = opts.contractNumber || 'GGS Contract';
    const safeName = opts.clientName || 'there';
    const filename = `Glitz-Glamour-Agreement-${(cn || 'agreement').replace(/[^a-zA-Z0-9-_]/g, '')}.pdf`;
    return send(
        opts.to,
        `Your Booking is Officially Confirmed — Glitz & Glamour Studio`,
        baseHtml(`
  <div class="card">
    <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
    <h1 style="margin:0 0 14px;font-size:20px;color:#fff">Your Booking is Officially Confirmed — Glitz &amp; Glamour Studio</h1>
    <p style="color:#ccc;margin:0 0 12px">Hi ${safeName},</p>
    <p style="color:#ccc;margin:0 0 14px">
      This is your official booking confirmation from Glitz &amp; Glamour Studio. All conditions required to secure your booking have been satisfied and this Agreement is now in full effect as of ${opts.dateConfirmedLabel}.
    </p>

    <div style="margin:10px 0 14px;padding:14px 14px;border-radius:14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06)">
      <p style="margin:0 0 6px;color:#cfcfcf">✓ Signed Agreement received</p>
      <p style="margin:0 0 6px;color:#cfcfcf">✓ Non-refundable retainer received</p>
      <p style="margin:0;color:#cfcfcf">✓ Written acceptance issued by the Artist</p>
    </div>

    <p style="color:#ccc;margin:0 0 12px">
      A copy of your signed agreement is attached to this email for your records. Please save this for future reference as it contains all terms, policies, and conditions governing your booking.
    </p>

    <p style="color:#ddd;margin:16px 0 8px"><strong style="color:#fff">A few important reminders:</strong></p>
    <p style="color:#ccc;margin:0 0 2px">- All participants receiving hair services must arrive with clean, completely dry hair free of all styling products. (Unless otherwise specified)</p>
    <p style="color:#ccc;margin:0 0 2px">- All participants receiving makeup services must arrive with a thoroughly cleansed, makeup-free face and moisturized skin. (Unless otherwise specified)</p>
    <p style="color:#ccc;margin:0 0 2px">- The remaining balance is due on the day of the event before the Artist's departure.</p>
    <p style="color:#ccc;margin:0 0 12px">- All communications regarding your booking — including any changes, cancellations, or modifications — must be submitted in writing via text or email only. Instagram DMs are not accepted for legally binding communications.</p>

    <p style="color:#ccc;margin:0 0 16px">
      If you have any questions between now and your event date, don’t hesitate to reach out. We are so excited to be a part of your special day and cannot wait to make you and your party look and feel absolutely beautiful!
    </p>

    <p style="color:#ccc;margin:0">
      With love,<br/>
      Jojany Lavalle<br/>
      Glitz &amp; Glamour Studio<br/>
      (760) 290-5910<br/>
      info@glitzandglamours.com<br/>
      @GlitzandGlamourStudio<br/>
      <span style="color:#aaa">glitzandglamours.com</span>
    </p>
  </div>
`),
        [{ filename, content: opts.pdf }]
    );
}
