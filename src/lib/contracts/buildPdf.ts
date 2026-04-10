import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { StoredContractFormData } from './types';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const MAX_TEXT_W = PAGE_W - MARGIN * 2;
const BOTTOM_RESERVE = 140;

function wrapLineToWidth(text: string, font: PDFFont, size: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
        const trial = cur ? `${cur} ${w}` : w;
        if (font.widthOfTextAtSize(trial, size) <= MAX_TEXT_W) {
            cur = trial;
        } else {
            if (cur) lines.push(cur);
            cur = w;
        }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
}

export async function buildSignedContractPdf(
    data: StoredContractFormData,
    signaturePngBytes: Uint8Array,
    meta: { referenceCode: string; generatedAtIso: string }
): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const ctx = {
        page: doc.addPage([PAGE_W, PAGE_H]) as PDFPage,
        y: PAGE_H - MARGIN,
    };

    function newPage() {
        ctx.page = doc.addPage([PAGE_W, PAGE_H]);
        ctx.y = PAGE_H - MARGIN;
    }

    function needSpace(px: number) {
        if (ctx.y < MARGIN + BOTTOM_RESERVE + px) {
            newPage();
        }
    }

    function writeLines(text: string, size: number, f: PDFFont = font) {
        const blocks = text.split('\n');
        for (const block of blocks) {
            const wrapped = wrapLineToWidth(block, f, size);
            for (const line of wrapped) {
                needSpace(size + 6);
                ctx.page.drawText(line, {
                    x: MARGIN,
                    y: ctx.y,
                    size,
                    font: f,
                    color: rgb(0.08, 0.08, 0.08),
                });
                ctx.y -= size + 4;
            }
        }
    }

    function heading(t: string) {
        needSpace(28);
        ctx.y -= 4;
        ctx.page.drawText(t, {
            x: MARGIN,
            y: ctx.y,
            size: 12,
            font: fontBold,
            color: rgb(0.55, 0.08, 0.22),
        });
        ctx.y -= 20;
    }

    ctx.page.drawText('Glitz & Glamour Studio', {
        x: MARGIN,
        y: ctx.y,
        size: 18,
        font: fontBold,
        color: rgb(0.55, 0.08, 0.22),
    });
    ctx.y -= 26;
    ctx.page.drawText('Beauty & Event Services Agreement — Client Acknowledgment', {
        x: MARGIN,
        y: ctx.y,
        size: 11,
        font: fontBold,
        color: rgb(0.15, 0.15, 0.15),
    });
    ctx.y -= 22;
    writeLines(`Reference: ${meta.referenceCode}  ·  Generated: ${meta.generatedAtIso}`, 9);
    ctx.y -= 6;

    heading('Signer');
    writeLines(`Full legal name: ${data.fullName}\nDate signed (as entered): ${data.signDate}`, 10);

    heading('Section 11 — Allergy & skin disclosure');
    writeLines(
        `Known allergies/sensitivities: ${data.allergies}\nSkin conditions: ${data.skinCond}\nMedications (optional): ${data.medications || '—'}`,
        10
    );

    heading('Section 12 — Photo & social media');
    writeLines(
        `Consent: ${data.photoConsent}${data.photoRestrict ? `\nRestrictions: ${data.photoRestrict}` : ''}`,
        10
    );

    heading('Section 17 — Minors');
    if (data.hasMinor) {
        writeLines(
            `Minor(s): ${data.minorNames}\nGuardian: ${data.guardianName}\nGuardian phone: ${data.guardianPhone}`,
            10
        );
    } else {
        writeLines('N/A — all clients are 18 or older.', 10);
    }

    heading('Initials (acknowledged sections)');
    const ini = data.initials;
    writeLines(
        [
            `Section 04 No refunds: ${ini.norefund}`,
            `Section 05 Payment plan: ${ini.payment}`,
            `Section 08 Cancellation: ${ini.cancel}`,
            `Section 11 Allergy: ${ini.allergy}`,
            `Section 12 Photo release: ${ini.photo}`,
            `Section 17 Minors: ${ini.minors ?? 'N/A'}`,
            `Section 20 Liability: ${ini.liability}`,
            `Section 22 Entire agreement: ${ini.entire}`,
        ].join('\n'),
        10
    );

    heading('Electronic signature');
    writeLines(
        'The image below was captured from the client signing canvas at submission time.',
        9
    );

    let png;
    try {
        png = await doc.embedPng(signaturePngBytes);
    } catch {
        throw new Error('Invalid signature image');
    }
    const scale = Math.min(320 / png.width, 110 / png.height);
    const w = png.width * scale;
    const h = png.height * scale;
    needSpace(h + 24);
    ctx.y -= 6;
    ctx.page.drawImage(png, { x: MARGIN, y: ctx.y - h, width: w, height: h });
    ctx.y -= h + 14;

    writeLines(
        'By signing, the client confirmed they read the contract summary on the website, including cancellation (Section 08), no refunds (Section 04), late arrival (Section 10), preparation (Section 09), limitation of liability (Section 20), and entire agreement (Section 22), and agreed to be bound by all 24 sections of the Glitz & Glamour Studio Beauty & Event Services Agreement.',
        9
    );

    return doc.save();
}
