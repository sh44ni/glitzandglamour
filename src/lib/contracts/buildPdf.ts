import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { StoredContractFormData } from './types';
import {
    DOCUMENT_INTRO,
    ESIGN_ATTESTATION,
    INITIAL_CERTIFICATIONS,
    STUDIO_BLOCK,
    SUMMARY_SECTIONS,
} from './pdfContent';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 54;
const MARGIN_TOP_FIRST = 56;
const MARGIN_TOP_NEXT = 50;
const FOOTER_RESERVED = 52;
const LINE_COLOR = rgb(0.82, 0.82, 0.82);
const TEXT = rgb(0.11, 0.11, 0.11);
const TEXT_MUTED = rgb(0.38, 0.38, 0.38);
const ACCENT = rgb(0.52, 0.09, 0.22);
const RULE = 0.45;

function minContentY() {
    return MARGIN_X + FOOTER_RESERVED;
}

function wrapLineToWidth(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
        const trial = cur ? `${cur} ${w}` : w;
        if (font.widthOfTextAtSize(trial, size) <= maxW) {
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
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    const maxW = PAGE_W - MARGIN_X * 2;
    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN_TOP_FIRST;

    function hr() {
        needSpace(14);
        y -= 4;
        page.drawLine({
            start: { x: MARGIN_X, y },
            end: { x: PAGE_W - MARGIN_X, y },
            thickness: RULE,
            color: LINE_COLOR,
        });
        y -= 16;
    }

    function needSpace(px: number) {
        if (y - px < minContentY()) {
            newPage();
        }
    }

    function newPage() {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN_TOP_NEXT;
        page.drawLine({
            start: { x: MARGIN_X, y: PAGE_H - 36 },
            end: { x: PAGE_W - MARGIN_X, y: PAGE_H - 36 },
            thickness: RULE,
            color: LINE_COLOR,
        });
        page.drawText('Client acknowledgment — continued', {
            x: MARGIN_X,
            y: PAGE_H - 32,
            size: 8,
            font: fontOblique,
            color: TEXT_MUTED,
        });
        y = PAGE_H - 58;
    }

    function writeParagraph(text: string, size: number, f: PDFFont = font, color = TEXT, lineGap = 3.5) {
        for (const block of text.split('\n')) {
            const wrapped = wrapLineToWidth(block, f, size, maxW);
            for (const line of wrapped) {
                needSpace(size + lineGap + 2);
                page.drawText(line, { x: MARGIN_X, y, size, font: f, color });
                y -= size + lineGap;
            }
        }
    }

    function writeHeading(title: string, size = 11.5) {
        needSpace(size + 22);
        y -= 6;
        page.drawText(title.toUpperCase(), {
            x: MARGIN_X,
            y,
            size,
            font: fontBold,
            color: ACCENT,
        });
        y -= size + 10;
    }

    function writeSubheading(t: string, size = 10) {
        needSpace(size + 14);
        y -= 2;
        page.drawText(t, { x: MARGIN_X, y, size, font: fontBold, color: TEXT });
        y -= size + 8;
    }

    // ── Cover / title block ─────────────────────────────────────────────
    page.drawText('CLIENT ACKNOWLEDGMENT', {
        x: MARGIN_X,
        y,
        size: 9,
        font: fontBold,
        color: TEXT_MUTED,
    });
    y -= 18;

    page.drawText('Beauty & Event Services Agreement', {
        x: MARGIN_X,
        y,
        size: 16,
        font: fontBold,
        color: ACCENT,
    });
    y -= 22;
    page.drawText('Electronic signature record', {
        x: MARGIN_X,
        y,
        size: 11,
        font: fontOblique,
        color: TEXT_MUTED,
    });
    y -= 28;

    hr();

    for (const line of STUDIO_BLOCK) {
        writeParagraph(line, 9, font, TEXT_MUTED, 2);
    }
    y -= 6;
    hr();

    writeSubheading('Document control');
    writeParagraph(`Reference number: ${meta.referenceCode}`, 10, fontBold);
    writeParagraph(`Generated (UTC): ${meta.generatedAtIso}`, 9, font, TEXT_MUTED, 2);
    y -= 8;

    writeSubheading('Signer');
    writeParagraph(`Full legal name: ${data.fullName}`, 10, fontBold);
    writeParagraph(`Date as entered by signer: ${data.signDate}`, 10);
    y -= 6;

    for (const p of DOCUMENT_INTRO) {
        writeParagraph(p, 9.5, font, TEXT, 4);
        y -= 4;
    }

    y -= 4;
    writeHeading('Contract summary reviewed at signing');
    writeParagraph(
        'The following summarizes material terms the Client confirmed at signing. The complete Agreement contains twenty-four (24) sections; this summary is not a substitute for the full Agreement.',
        9,
        fontOblique,
        TEXT_MUTED,
        3
    );
    y -= 6;

    for (const sec of SUMMARY_SECTIONS) {
        writeSubheading(`Section ${sec.id} — ${sec.title}`);
        let n = 1;
        for (const clause of sec.clauses) {
            const prefix = `${n}. `;
            const wrapped = wrapLineToWidth(prefix + clause, font, 9.5, maxW);
            for (let i = 0; i < wrapped.length; i++) {
                const line = wrapped[i];
                needSpace(11);
                page.drawText(line, { x: MARGIN_X, y, size: 9.5, font, color: TEXT });
                y -= 11;
            }
            n += 1;
        }
        y -= 6;
    }

    writeHeading('Health & media disclosures');
    writeSubheading('Section 11 — Allergy & skin disclosure');
    writeParagraph(
        `Known allergies or sensitivities: ${data.allergies}\nSkin conditions: ${data.skinCond}\nCurrent medications (if any): ${data.medications || 'None reported'}`,
        9.5
    );
    y -= 4;

    writeSubheading('Section 12 — Photo & social media release');
    writeParagraph(`Photo / video consent: ${data.photoConsent}`, 9.5, fontBold);
    if (data.photoRestrict) {
        writeParagraph(`Restrictions specified: ${data.photoRestrict}`, 9.5);
    }
    y -= 4;

    writeSubheading('Section 17 — Minors');
    if (data.hasMinor) {
        writeParagraph(
            `Minor(s) receiving services: ${data.minorNames}\nGuardian name & relationship: ${data.guardianName}\nGuardian phone: ${data.guardianPhone}`,
            9.5
        );
    } else {
        writeParagraph('Not applicable — all persons receiving services are eighteen (18) years of age or older.', 9.5, fontOblique, TEXT_MUTED);
    }
    y -= 8;

    writeHeading('Section-by-section initials');
    writeParagraph(
        'The Client placed the following initials next to each summarized section to confirm read, understood, and agreement.',
        9,
        fontOblique,
        TEXT_MUTED,
        3
    );
    y -= 6;

    const ini = data.initials;
    const initialBySection: Record<string, string> = {
        '04': ini.norefund,
        '05': ini.payment,
        '08': ini.cancel,
        '11': ini.allergy,
        '12': ini.photo,
        '17': data.hasMinor ? ini.minors || '—' : 'N/A',
        '20': ini.liability,
        '22': ini.entire,
    };

    needSpace(22);
    page.drawText('Sec.', { x: MARGIN_X, y, size: 8, font: fontBold, color: TEXT_MUTED });
    page.drawText('Topic', { x: MARGIN_X + 34, y, size: 8, font: fontBold, color: TEXT_MUTED });
    page.drawText('Client initials', { x: PAGE_W - MARGIN_X - 78, y, size: 8, font: fontBold, color: TEXT_MUTED });
    y -= 12;
    page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_W - MARGIN_X, y },
        thickness: RULE,
        color: LINE_COLOR,
    });
    y -= 10;

    for (const row of INITIAL_CERTIFICATIONS) {
        const initialsVal = initialBySection[row.section] ?? '—';
        const sumWrapped = wrapLineToWidth(row.summary, fontOblique, 8, maxW - 100);
        const blockH = 11 + sumWrapped.length * 9 + 8;
        needSpace(blockH);
        const rowTopY = y;
        page.drawText(row.section, { x: MARGIN_X, y, size: 9, font: fontBold, color: ACCENT });
        page.drawText(row.label, { x: MARGIN_X + 34, y, size: 9, font: fontBold, color: TEXT });
        page.drawText(initialsVal, {
            x: PAGE_W - MARGIN_X - 78,
            y: rowTopY,
            size: 11,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        y -= 11;
        for (const sl of sumWrapped) {
            page.drawText(sl, { x: MARGIN_X + 34, y, size: 8, font: fontOblique, color: TEXT_MUTED });
            y -= 9;
        }
        y -= 8;
    }

    y -= 8;
    writeHeading('Electronic signature');
    for (const p of ESIGN_ATTESTATION) {
        writeParagraph(p, 9, font, TEXT, 3.5);
        y -= 2;
    }
    y -= 4;

    writeParagraph(
        'Captured signature image (as drawn by the Client in the signing application at time of submission):',
        9,
        fontOblique,
        TEXT_MUTED,
        3
    );
    y -= 6;

    let png;
    try {
        png = await doc.embedPng(signaturePngBytes);
    } catch {
        throw new Error('Invalid signature image');
    }

    const boxW = Math.min(340, maxW);
    const boxH = 100;
    needSpace(boxH + 36);
    page.drawRectangle({
        x: MARGIN_X,
        y: y - boxH,
        width: boxW,
        height: boxH,
        borderColor: LINE_COLOR,
        borderWidth: 1,
        color: rgb(0.97, 0.97, 0.97),
    });

    const scale = Math.min((boxW - 24) / png.width, (boxH - 24) / png.height);
    const imgW = png.width * scale;
    const imgH = png.height * scale;
    const imgX = MARGIN_X + (boxW - imgW) / 2;
    const imgY = y - boxH + (boxH - imgH) / 2;
    page.drawImage(png, { x: imgX, y: imgY, width: imgW, height: imgH });
    y -= boxH + 14;

    writeSubheading('Printed name & date (mirrors signer entries)');
    writeParagraph(`Printed name: ${data.fullName}`, 10, fontBold);
    writeParagraph(`Date: ${data.signDate}`, 10, fontBold);
    y -= 12;

    writeParagraph(
        'By submitting the signing form, the Client confirmed they read the online contract summary, including cancellation (Section 08), no refunds (Section 04), late arrival (Section 10), preparation (Section 09), allergy disclosure (Section 11), photo release (Section 12), minors policy where applicable (Section 17), limitation of liability (Section 20), and entire agreement (Section 22), and agreed to be bound by all sections of the Glitz & Glamour Studio Beauty & Event Services Agreement.',
        8.5,
        font,
        TEXT_MUTED,
        3
    );

    // ── Footers on every page ────────────────────────────────────────────
    const pages = doc.getPages();
    const total = pages.length;
    const footerText = 'Glitz & Glamour Studio · Client acknowledgment · Confidential';
    pages.forEach((p, i) => {
        const footerY = 36;
        p.drawLine({
            start: { x: MARGIN_X, y: footerY + 14 },
            end: { x: PAGE_W - MARGIN_X, y: footerY + 14 },
            thickness: RULE,
            color: LINE_COLOR,
        });
        const pageLabel = `Page ${i + 1} of ${total}`;
        const tw = font.widthOfTextAtSize(footerText, 7.5);
        const pw = font.widthOfTextAtSize(pageLabel, 7.5);
        p.drawText(footerText, {
            x: MARGIN_X,
            y: footerY,
            size: 7.5,
            font,
            color: TEXT_MUTED,
        });
        p.drawText(pageLabel, {
            x: PAGE_W - MARGIN_X - pw,
            y: footerY,
            size: 7.5,
            font,
            color: TEXT_MUTED,
        });
    });

    return doc.save();
}
