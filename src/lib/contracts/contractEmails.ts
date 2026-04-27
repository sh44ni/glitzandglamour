import { dispatchEmail } from '@/lib/notify';
import type { ContractType } from '@/lib/contracts/specialEventConstants';

const FROM_NAME = process.env.PINGRAM_FROM_NAME || 'Glitz & Glamour';

function isSpanish(ct?: ContractType): boolean {
    return !!ct && ct.endsWith('-es');
}

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

/* ─────────────────────────────────────────────────────────
   1) CONTRACT INVITE — sent when admin releases the contract
   ───────────────────────────────────────────────────────── */

export async function emailContractInviteToClient(opts: {
    to: string;
    clientName: string;
    contractNumber: string;
    eventDateLabel: string;
    signUrl: string;
    contractType?: ContractType;
}): Promise<boolean> {
    const { to, clientName, contractNumber, eventDateLabel, signUrl } = opts;
    const es = isSpanish(opts.contractType);
    const name = clientName || (es ? 'estimado/a cliente' : 'there');

    const subject = es
        ? `Acción requerida: Revise y firme su contrato (${contractNumber})`
        : `Action required: Review & sign your agreement (${contractNumber})`;

    const previewText = es
        ? `Hola ${name}, su contrato de servicios de belleza y eventos está listo para firmar.`
        : `Hi ${name}, your beauty & event services agreement is ready to sign.`;

    const body = es
        ? `
  <div class="card">
    <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
    <h1 style="margin:0 0 14px;font-size:22px;color:#fff">Hola ${name},</h1>
    <p style="color:#ccc;margin:0 0 12px">Su Contrato de Servicios de Belleza y Eventos está listo. Por favor revise el contrato completo y complete sus divulgaciones, iniciales y firma.</p>
    <p style="color:#aaa;font-size:14px;margin:0 0 8px"><strong style="color:#fff">Contrato</strong> ${contractNumber}</p>
    <p style="color:#aaa;font-size:14px;margin:0 0 20px"><strong style="color:#fff">Fecha del evento</strong> ${eventDateLabel}</p>
    <a class="btn" href="${signUrl}">Revisar y firmar contrato</a>
    <p class="muted" style="margin-top:20px">Si el botón no funciona, copie y pegue este enlace en su navegador:<br/><span style="word-break:break-all;color:#aaa">${signUrl}</span></p>
  </div>`
        : `
  <div class="card">
    <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
    <h1 style="margin:0 0 14px;font-size:22px;color:#fff">Hi ${name},</h1>
    <p style="color:#ccc;margin:0 0 12px">Your Beauty &amp; Event Services agreement is ready. Please review the full contract and complete your disclosures, initials, and signature.</p>
    <p style="color:#aaa;font-size:14px;margin:0 0 8px"><strong style="color:#fff">Contract</strong> ${contractNumber}</p>
    <p style="color:#aaa;font-size:14px;margin:0 0 20px"><strong style="color:#fff">Event date</strong> ${eventDateLabel}</p>
    <a class="btn" href="${signUrl}">Review &amp; sign contract</a>
    <p class="muted" style="margin-top:20px">If the button does not work, copy and paste this link into your browser:<br/><span style="word-break:break-all;color:#aaa">${signUrl}</span></p>
  </div>`;

    const result = await dispatchEmail({
        bookingId: contractNumber,
        event: 'contract_invite',
        to,
        subject,
        previewText,
        html: baseHtml(body),
    });
    return result.success;
}

/* ─────────────────────────────────────────────────────────
   Admin-only: contract sent notification (stays in English)
   ───────────────────────────────────────────────────────── */

export async function emailAdminContractSent(opts: { to: string; contractNumber: string; clientEmail: string }): Promise<boolean> {
    const result = await dispatchEmail({
        bookingId: opts.contractNumber,
        event: 'contract_admin_sent',
        to: opts.to,
        subject: `Contract sent: ${opts.contractNumber}`,
        html: baseHtml(
            `<div class="card"><p>The special-events contract <span class="pink">${opts.contractNumber}</span> was emailed to <strong>${opts.clientEmail}</strong>.</p></div>`
        ),
    });
    return result.success;
}

/* ─────────────────────────────────────────────────────────
   Admin-only: client signed notification (stays in English)
   ───────────────────────────────────────────────────────── */

export async function emailAdminClientSigned(opts: {
    to: string;
    contractNumber: string;
    clientName: string;
    referenceCode: string;
}): Promise<boolean> {
    const result = await dispatchEmail({
        bookingId: opts.contractNumber,
        event: 'contract_admin_signed',
        to: opts.to,
        subject: `Signed by client: ${opts.contractNumber}`,
        html: baseHtml(
            `<div class="card"><p><strong>${opts.clientName}</strong> submitted <span class="pink">${opts.contractNumber}</span>.</p><p class="muted">Open Admin → Contracts to record retainer and add your countersignature.</p></div>`
        ),
    });
    return result.success;
}

/* ─────────────────────────────────────────────────────────
   2) CLIENT CONTRACT RECEIVED — sent after client submits
   ───────────────────────────────────────────────────────── */

export async function emailClientContractReceived(opts: {
    to: string;
    contractNumber: string;
    pdf?: Buffer;
    contractType?: ContractType;
}): Promise<boolean> {
    const cn = opts.contractNumber || 'GGS Contract';
    const filename = `Glitz-Glamour-Agreement-${(cn || 'agreement').replace(/[^a-zA-Z0-9-_]/g, '')}.pdf`;
    const es = isSpanish(opts.contractType);

    const subject = es
        ? `Recibimos su Contrato Firmado — ${cn}`
        : `We Received Your Signed Agreement — ${cn}`;

    const previewText = es
        ? 'Gracias por enviar su contrato firmado. Esto es lo que sigue.'
        : 'Thank you for submitting your signed agreement. Here is what happens next.';

    const pdfAttachedLine = opts.pdf
        ? (es
            ? '<p style="color:#ccc;margin:0 0 12px">Una copia de su contrato firmado está adjunta a este correo electrónico para sus registros.</p>'
            : '<p style="color:#ccc;margin:0 0 12px">A copy of your signed agreement is attached to this email for your records.</p>')
        : '';

    const body = es
        ? `<div class="card">
  <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
  <h1 style="margin:0 0 14px;font-size:20px;color:#fff">Recibimos su contrato firmado — <span class="pink">${cn}</span></h1>
  <p style="color:#ccc;margin:0 0 12px">
    ¡Gracias por enviar su contrato firmado <span class="pink">${cn}</span> con Glitz &amp; Glamour Studio! Hemos recibido exitosamente su contrato y queremos asegurarnos de que sepa lo que sigue.
  </p>

  ${pdfAttachedLine}

  <p style="color:#ddd;margin:16px 0 10px"><strong style="color:#fff">Por favor tenga en cuenta que su reservación NO está confirmada aún.</strong> Su fecha será oficialmente asegurada y este Contrato entrará en pleno efecto solo después de que se cumplan las tres condiciones siguientes:</p>

  <div style="margin:10px 0 14px;padding:14px 14px;border-radius:14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06)">
    <p style="margin:0 0 6px;color:#cfcfcf">✓ Su Contrato firmado ha sido recibido — <strong style="color:#fff">Completado</strong></p>
    <p style="margin:0 0 6px;color:#cfcfcf">○ Su pago de anticipo no reembolsable ha sido recibido — <strong style="color:#fff">Pendiente</strong></p>
    <p style="margin:0;color:#cfcfcf">○ La aceptación por escrito ha sido emitida por la Artista — <strong style="color:#fff">Pendiente</strong></p>
  </div>

  <p style="color:#ccc;margin:0 0 12px">
    Si ya envió su pago de anticipo, ¡está a un paso! Solo falta que revisemos todo y emitamos su aceptación oficial por escrito. Le contactaremos dentro de las próximas 48 horas.
  </p>

  <p style="color:#ccc;margin:0 0 8px">
    Si aún no ha enviado su pago de anticipo, por favor hágalo lo antes posible para evitar perder su fecha preferida. El pago puede ser enviado a través de:
  </p>
  <p style="color:#ccc;margin:0 0 2px">- Zelle: (760) 290-5910 o jojanylavalle@icloud.com</p>
  <p style="color:#ccc;margin:0 0 2px">- Venmo: @glitzandglamours</p>
  <p style="color:#ccc;margin:0 0 12px">- Cash App: $glitzandglamours</p>

  <p style="color:#ccc;margin:0 0 12px">
    Una vez que se cumplan las tres condiciones, recibirá un correo electrónico de confirmación por separado junto con una copia completa de su contrato ejecutado.
  </p>

  <p style="color:#ccc;margin:0 0 12px">
    <strong style="color:#fff">IMPORTANTE:</strong> Por favor no considere su fecha reservada ni su reservación confirmada hasta que reciba su correo electrónico oficial de confirmación de Glitz &amp; Glamour Studio. Le pedimos amablemente que evite hacer arreglos basándose en una confirmación supuesta.
  </p>

  <p style="color:#ccc;margin:0 0 8px">Si tiene alguna pregunta mientras tanto, puede contactarnos a través de:</p>
  <p style="color:#ccc;margin:0 0 2px">- Texto: (760) 290-5910</p>
  <p style="color:#ccc;margin:0 0 2px">- Email: info@glitzandglamours.com</p>
  <p style="color:#ccc;margin:0 0 12px">- Instagram: @GlitzandGlamourStudio (solo consultas generales)</p>

  <p style="color:#ddd;margin:0 0 18px">¡Agradecemos que haya elegido a Glitz &amp; Glamour Studio y esperamos con entusiasmo ser parte de su día especial!</p>

  <p style="color:#ccc;margin:0">
    Con cariño,<br/>
    Jojany Lavalle<br/>
    Glitz &amp; Glamour Studio<br/>
    (760) 290-5910<br/>
    info@glitzandglamours.com<br/>
    @GlitzandGlamourStudio<br/>
    <span style="color:#aaa">glitzandglamours.com</span>
  </p>
</div>`
        : `<div class="card">
  <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
  <h1 style="margin:0 0 14px;font-size:20px;color:#fff">We received your signed agreement — <span class="pink">${cn}</span></h1>
  <p style="color:#ccc;margin:0 0 12px">
    Thank you for submitting your signed agreement <span class="pink">${cn}</span> with Glitz &amp; Glamour Studio! We have successfully received your contract and wanted to make sure you know what happens next.
  </p>

  ${pdfAttachedLine}

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
  <p style="color:#ccc;margin:0 0 2px">- Venmo: @glitzandglamours</p>
  <p style="color:#ccc;margin:0 0 12px">- Cash App: $glitzandglamours</p>

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
</div>`;

    const result = await dispatchEmail({
        bookingId: cn,
        event: 'contract_received',
        to: opts.to,
        subject,
        previewText,
        html: baseHtml(body),
        ...(opts.pdf ? { attachments: [{ filename, content: opts.pdf }] } : {}),
    });
    return result.success;
}

/* ─────────────────────────────────────────────────────────
   3) BOOKING CONFIRMED — sent after studio finalizes/executes
   ───────────────────────────────────────────────────────── */

export async function emailClientBookingConfirmed(opts: {
    to: string;
    clientName: string;
    contractNumber: string;
    dateConfirmedLabel: string;
    pdf: Buffer;
    contractType?: ContractType;
}): Promise<boolean> {
    const cn = opts.contractNumber || 'GGS Contract';
    const safeName = opts.clientName || (isSpanish(opts.contractType) ? 'estimado/a cliente' : 'there');
    const filename = `Glitz-Glamour-Agreement-${(cn || 'agreement').replace(/[^a-zA-Z0-9-_]/g, '')}.pdf`;
    const es = isSpanish(opts.contractType);

    const subject = es
        ? `Su Reservación está Oficialmente Confirmada — ${FROM_NAME}`
        : `Your Booking is Officially Confirmed — ${FROM_NAME}`;

    const previewText = es
        ? 'Todas las condiciones se han cumplido — su fecha está oficialmente asegurada. PDF adjunto.'
        : 'All conditions met — your date is officially secured. PDF attached.';

    const body = es
        ? `
  <div class="card">
    <p class="pink" style="letter-spacing:0.12em;font-size:11px;text-transform:uppercase;margin:0 0 12px">Glitz &amp; Glamour Studio</p>
    <h1 style="margin:0 0 14px;font-size:20px;color:#fff">Su Reservación está Oficialmente Confirmada — Glitz &amp; Glamour Studio</h1>
    <p style="color:#ccc;margin:0 0 12px">Hola ${safeName},</p>
    <p style="color:#ccc;margin:0 0 14px">
      Esta es su confirmación oficial de reservación de Glitz &amp; Glamour Studio. Todas las condiciones requeridas para asegurar su reservación se han cumplido y este Contrato está ahora en pleno efecto a partir del ${opts.dateConfirmedLabel}.
    </p>

    <div style="margin:10px 0 14px;padding:14px 14px;border-radius:14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06)">
      <p style="margin:0 0 6px;color:#cfcfcf">✓ Contrato firmado recibido</p>
      <p style="margin:0 0 6px;color:#cfcfcf">✓ Anticipo no reembolsable recibido</p>
      <p style="margin:0;color:#cfcfcf">✓ Aceptación por escrito emitida por la Artista</p>
    </div>

    <p style="color:#ccc;margin:0 0 12px">
      Una copia de su contrato firmado está adjunta a este correo electrónico para sus registros. Por favor guárdela para referencia futura ya que contiene todos los términos, políticas y condiciones que rigen su reservación.
    </p>

    <p style="color:#ddd;margin:16px 0 8px"><strong style="color:#fff">Algunos recordatorios importantes:</strong></p>
    <p style="color:#ccc;margin:0 0 2px">- Todas las participantes que reciban servicios de cabello deben llegar con el cabello limpio, completamente seco y libre de todos los productos de peinado. (A menos que se especifique lo contrario)</p>
    <p style="color:#ccc;margin:0 0 2px">- Todas las participantes que reciban servicios de maquillaje deben llegar con el rostro completamente limpio, sin maquillaje y con la piel humectada. (A menos que se especifique lo contrario)</p>
    <p style="color:#ccc;margin:0 0 2px">- El saldo restante debe pagarse el día del evento antes de la salida de la Artista.</p>
    <p style="color:#ccc;margin:0 0 12px">- Todas las comunicaciones relacionadas con su reservación — incluyendo cambios, cancelaciones o modificaciones — deben enviarse por escrito únicamente a través de texto o correo electrónico. Los mensajes directos de Instagram no se aceptan para comunicaciones legalmente vinculantes.</p>

    <p style="color:#ccc;margin:0 0 16px">
      Si tiene alguna pregunta entre ahora y la fecha de su evento, no dude en comunicarse. ¡Estamos muy emocionadas de ser parte de su día especial y no podemos esperar para hacerla lucir y sentirse absolutamente hermosa!
    </p>

    <p style="color:#ccc;margin:0">
      Con cariño,<br/>
      Jojany Lavalle<br/>
      Glitz &amp; Glamour Studio<br/>
      (760) 290-5910<br/>
      info@glitzandglamours.com<br/>
      @GlitzandGlamourStudio<br/>
      <span style="color:#aaa">glitzandglamours.com</span>
    </p>
  </div>
`
        : `
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
      If you have any questions between now and your event date, don't hesitate to reach out. We are so excited to be a part of your special day and cannot wait to make you and your party look and feel absolutely beautiful!
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
`;

    const result = await dispatchEmail({
        bookingId: cn,
        event: 'contract_confirmed',
        to: opts.to,
        subject,
        previewText,
        html: baseHtml(body),
        attachments: [{ filename, content: opts.pdf }],
    });
    return result.success;
}
