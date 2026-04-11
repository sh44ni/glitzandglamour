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

async function send(to: string, subject: string, html: string): Promise<boolean> {
    if (!resend || !to) return false;
    try {
        await resend.emails.send({ from: FROM, to, subject, html });
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
            `<div class="card"><p><strong>${opts.clientName}</strong> submitted <span class="pink">${opts.contractNumber}</span>.</p><p class="muted">Reference: ${opts.referenceCode}. Open Admin → Contracts to record retainer and add your countersignature.</p></div>`
        )
    );
}

export async function emailClientContractReceived(opts: { to: string; contractNumber: string }): Promise<boolean> {
    return send(
        opts.to,
        `We received your signed agreement (${opts.contractNumber})`,
        baseHtml(
            `<div class="card"><p>Thank you! We received your signed agreement <span class="pink">${opts.contractNumber}</span>. The studio will follow up if anything else is needed.</p></div>`
        )
    );
}
