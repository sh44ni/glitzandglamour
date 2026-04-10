import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { StoredContractFormData } from './types';
import {
    DOCUMENT_INTRO,
    ESIGN_ATTESTATION,
    INITIAL_CERTIFICATIONS,
    STUDIO_BLOCK,
    SUMMARY_SECTIONS,
} from './pdfContent';

/** US Letter */
const PAGE_W = 612;
const PAGE_H = 792;

const MARGIN_OUT = 48;
const CONTENT_X = 62;
const RIGHT_X = PAGE_W - MARGIN_OUT;
const USABLE_W = RIGHT_X - CONTENT_X;

const MARGIN_TOP_NEXT = 52;
const FOOTER_RESERVED = 56;
const FOOTER_Y = 34;

/** Brand-aligned palette (print-safe) */
const ACCENT = rgb(0.78, 0.12, 0.35);
const ACCENT_DEEP = rgb(0.42, 0.06, 0.16);
const ACCENT_SOFT = rgb(0.98, 0.94, 0.96);
const ACCENT_MUTED = rgb(0.92, 0.82, 0.87);
const RAIL = rgb(0.88, 0.2, 0.42);

const TEXT = rgb(0.1, 0.1, 0.11);
const TEXT_MUTED = rgb(0.42, 0.42, 0.45);
const LINE = rgb(0.82, 0.82, 0.84);
const LINE_LIGHT = rgb(0.9, 0.9, 0.92);
const PANEL_BG = rgb(0.995, 0.993, 0.994);
const TABLE_HEADER = rgb(0.96, 0.9, 0.93);
const TABLE_STRIPE = rgb(0.992, 0.989, 0.991);

const RULE = 0.55;
const RAIL_W = 3.2;

function minContentY() {
    return MARGIN_OUT + FOOTER_RESERVED;
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

    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - 42;

    function needSpace(px: number) {
        if (y - px < minContentY()) {
            newPage();
        }
    }

    function newPage() {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN_TOP_NEXT;
        drawContinuationHeader(page);
        y = PAGE_H - 72;
    }

    function drawContinuationHeader(p: PDFPage) {
        p.drawRectangle({
            x: 0,
            y: PAGE_H - 4,
            width: PAGE_W * 0.42,
            height: 4,
            color: ACCENT,
        });
        p.drawLine({
            start: { x: MARGIN_OUT, y: PAGE_H - 28 },
            end: { x: RIGHT_X, y: PAGE_H - 28 },
            thickness: RULE,
            color: LINE_LIGHT,
        });
        p.drawText('Glitz & Glamour Studio', {
            x: CONTENT_X,
            y: PAGE_H - 24,
            size: 8,
            font: fontBold,
            color: ACCENT_DEEP,
        });
        p.drawText('Client acknowledgment â€” continued', {
            x: RIGHT_X - font.widthOfTextAtSize('Client acknowledgment â€” continued', 8),
            y: PAGE_H - 24,
            size: 8,
            font: fontOblique,
            color: TEXT_MUTED,
        });
    }

    function hr(strong = false) {
        needSpace(18);
        y -= 4;
        page.drawLine({
            start: { x: CONTENT_X, y },
            end: { x: RIGHT_X, y },
            thickness: strong ? 1 : RULE,
            color: strong ? ACCENT_MUTED : LINE,
        });
        y -= strong ? 18 : 14;
    }

    function writeParagraph(text: string, size: number, f: PDFFont = font, color = TEXT, lineGap = 3.8) {
        for (const block of text.split('\n')) {
            const wrapped = wrapLineToWidth(block, f, size, USABLE_W);
            for (const line of wrapped) {
                needSpace(size + lineGap + 2);
                page.drawText(line, { x: CONTENT_X, y, size, font: f, color });
                y -= size + lineGap;
            }
        }
    }

    /** Major section (roman numeral style label + title) */
    function writeMajorSection(roman: string, title: string) {
        needSpace(36);
        y -= 8;
        page.drawRectangle({
            x: CONTENT_X - 2,
            y: y - 4,
            width: 4,
            height: 22,
            color: ACCENT,
        });
        page.drawText(roman, {
            x: CONTENT_X + 10,
            y,
            size: 9,
            font: fontBold,
            color: ACCENT,
        });
        const rw = fontBold.widthOfTextAtSize(roman, 9);
        page.drawText(title.toUpperCase(), {
            x: CONTENT_X + 10 + rw + 8,
            y,
            size: 10,
            font: fontBold,
            color: ACCENT_DEEP,
        });
        y -= 22;
        page.drawLine({
            start: { x: CONTENT_X, y },
            end: { x: RIGHT_X, y },
            thickness: 0.35,
            color: ACCENT_MUTED,
        });
        y -= 14;
    }

    function writeSubheading(t: string, size = 10.2) {
        needSpace(size + 16);
        y -= 4;
        const dotR = 1.8;
        page.drawCircle({
            x: CONTENT_X + dotR,
            y: y - size * 0.32,
            size: dotR,
            color: ACCENT,
        });
        page.drawText(t, { x: CONTENT_X + 12, y, size, font: fontBold, color: TEXT });
        y -= size + 10;
    }

    function drawClauseNumbered(index: number, clause: string) {
        const prefix = `${index}.  `;
        const prefixW = font.widthOfTextAtSize(prefix, 9.4);
        const wrapped = wrapLineToWidth(prefix + clause, font, 9.4, USABLE_W);
        for (let i = 0; i < wrapped.length; i++) {
            const line = wrapped[i];
            needSpace(11);
            const xPos = i === 0 ? CONTENT_X : CONTENT_X + prefixW;
            page.drawText(line, { x: xPos, y, size: 9.4, font, color: TEXT });
            y -= 11;
        }
    }

    // â”€â”€ Page 1 hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    page.drawRectangle({
        x: 0,
        y: PAGE_H - 132,
        width: PAGE_W,
        height: 132,
        color: ACCENT_SOFT,
    });
    page.drawLine({
        start: { x: 0, y: PAGE_H - 132 },
        end: { x: PAGE_W, y: PAGE_H - 132 },
        thickness: 1.2,
        color: ACCENT_MUTED,
    });

    page.drawText('CLIENT ACKNOWLEDGMENT', {
        x: CONTENT_X,
        y: PAGE_H - 46,
        size: 8.5,
        font: fontBold,
        color: ACCENT,
    });
    page.drawText('Beauty & Event Services Agreement', {
        x: CONTENT_X,
        y: PAGE_H - 68,
        size: 17,
        font: fontBold,
        color: ACCENT_DEEP,
    });
    page.drawText('Electronic signature record & certificate of acknowledgment', {
        x: CONTENT_X,
        y: PAGE_H - 90,
        size: 10,
        font: fontOblique,
        color: TEXT_MUTED,
    });

    y = PAGE_H - 152;

    writeParagraph(
        'This PDF was generated when the Client submitted the secure signing form. It is suitable for retention with the master service agreement on file.',
        8.8,
        fontOblique,
        TEXT_MUTED,
        3
    );
    y -= 6;
    hr(true);

    for (const line of STUDIO_BLOCK) {
        writeParagraph(line, 9.2, font, TEXT_MUTED, 2.5);
    }
    y -= 8;
    hr();

    // Document control card
    const cardH = 108;
    const cardTopY = y;
    needSpace(cardH + 16);
    y -= 6;
    const cardBottomY = y - cardH;
    page.drawRectangle({
        x: CONTENT_X - 6,
        y: cardBottomY,
        width: RIGHT_X - CONTENT_X + 12,
        height: cardH,
        color: PANEL_BG,
        borderColor: LINE,
        borderWidth: 0.8,
    });
    page.drawRectangle({
        x: CONTENT_X - 6,
        y: cardBottomY,
        width: RAIL_W + 2,
        height: cardH,
        color: ACCENT,
    });
    page.drawText('DOCUMENT CONTROL', {
        x: CONTENT_X + 8,
        y: cardTopY - 18,
        size: 8,
        font: fontBold,
        color: ACCENT_DEEP,
    });
    let cy = cardTopY - 36;
    const label = (a: string, b: string, boldVal = false) => {
        page.drawText(a, {
            x: CONTENT_X + 8,
            y: cy,
            size: 8,
            font: fontBold,
            color: TEXT_MUTED,
        });
        page.drawText(b, {
            x: CONTENT_X + 118,
            y: cy,
            size: boldVal ? 10 : 9.5,
            font: boldVal ? fontBold : font,
            color: TEXT,
        });
        cy -= 16;
    };
    label('Reference', meta.referenceCode, true);
    label('Generated (UTC)', meta.generatedAtIso);
    label('Signer legal name', data.fullName, true);
    label('Date (as entered)', data.signDate);
    y = cardBottomY - 20;

    for (const p of DOCUMENT_INTRO) {
        writeParagraph(p, 9.5, font, TEXT, 4);
        y -= 4;
    }

    y -= 6;
    writeMajorSection('I', 'Contract summary reviewed at signing');
    writeParagraph(
        'The following summarizes material terms the Client confirmed at signing. The full Agreement contains twenty-four (24) sections; this summary does not replace the complete Agreement on file with the Studio.',
        9,
        fontOblique,
        TEXT_MUTED,
        3.5
    );
    y -= 8;

    for (const sec of SUMMARY_SECTIONS) {
        needSpace(28);
        page.drawRectangle({
            x: CONTENT_X,
            y: y - 6,
            width: USABLE_W,
            height: 6,
            color: ACCENT_SOFT,
        });
        y -= 14;
        writeSubheading(`Section ${sec.id} â€” ${sec.title}`);
        let n = 1;
        for (const clause of sec.clauses) {
            drawClauseNumbered(n, clause);
            n += 1;
        }
        y -= 8;
    }

    writeMajorSection('II', 'Health & media disclosures');

    writeSubheading('Section 11 â€” Allergy & skin disclosure');
    writeParagraph(
        `Known allergies or sensitivities: ${data.allergies}\nSkin conditions: ${data.skinCond}\nCurrent medications (if any): ${data.medications || 'None reported'}`,
        9.5
    );
    y -= 6;

    writeSubheading('Section 12 â€” Photo & social media release');
    writeParagraph(`Photo / video consent: ${data.photoConsent}`, 9.5, fontBold);
    if (data.photoRestrict) {
        writeParagraph(`Restrictions specified: ${data.photoRestrict}`, 9.5);
    }
    y -= 6;

    writeSubheading('Section 17 â€” Minors');
    if (data.hasMinor) {
        writeParagraph(
            `Minor(s) receiving services: ${data.minorNames}\nGuardian name & relationship: ${data.guardianName}\nGuardian phone: ${data.guardianPhone}`,
            9.5
        );
    } else {
        writeParagraph(
            'Not applicable â€” all persons receiving services are eighteen (18) years of age or older.',
            9.5,
            fontOblique,
            TEXT_MUTED
        );
    }
    y -= 10;

    writeMajorSection('III', 'Section-by-section initials');
    writeParagraph(
        'The Client placed the following initials to confirm read, understood, and agreement with each corresponding portion of the Agreement.',
        9,
        fontOblique,
        TEXT_MUTED,
        3.5
    );
    y -= 8;

    const ini = data.initials;
    const initialBySection: Record<string, string> = {
        '04': ini.norefund,
        '05': ini.payment,
        '08': ini.cancel,
        '11': ini.allergy,
        '12': ini.photo,
        '17': data.hasMinor ? ini.minors || 'â€”' : 'N/A',
        '20': ini.liability,
        '22': ini.entire,
    };

    const colSec = CONTENT_X + 4;
    const colTopic = CONTENT_X + 36;
    const colInit = RIGHT_X - 52;
    const tableW = RIGHT_X - CONTENT_X;

    function initialsRowHeight(row: (typeof INITIAL_CERTIFICATIONS)[0]): number {
        const sumWrapped = wrapLineToWidth(row.summary, fontOblique, 8, USABLE_W - 120);
        return 12 + sumWrapped.length * 9 + 6;
    }

    const headerH = 24;
    let tableTotalH = headerH;
    for (const row of INITIAL_CERTIFICATIONS) {
        tableTotalH += initialsRowHeight(row);
    }
    needSpace(tableTotalH + 12);

    page.drawRectangle({
        x: CONTENT_X,
        y: y - headerH,
        width: tableW,
        height: headerH,
        color: TABLE_HEADER,
        borderColor: LINE,
        borderWidth: 0.6,
    });
    page.drawText('Sec.', { x: colSec, y: y - 16, size: 8.5, font: fontBold, color: ACCENT_DEEP });
    page.drawText('Topic & scope', { x: colTopic, y: y - 16, size: 8.5, font: fontBold, color: ACCENT_DEEP });
    page.drawText('Initials', { x: colInit, y: y - 16, size: 8.5, font: fontBold, color: ACCENT_DEEP });
    y -= headerH;

    INITIAL_CERTIFICATIONS.forEach((row, idx) => {
        const initialsVal = initialBySection[row.section] ?? 'â€”';
        const sumWrapped = wrapLineToWidth(row.summary, fontOblique, 8, USABLE_W - 120);
        const rowH = 12 + sumWrapped.length * 9 + 6;
        needSpace(rowH);
        const stripe = idx % 2 === 1;
        if (stripe) {
            page.drawRectangle({
                x: CONTENT_X,
                y: y - rowH + 2,
                width: tableW,
                height: rowH,
                color: TABLE_STRIPE,
            });
        }
        const rowTopY = y;
        page.drawText(row.section, { x: colSec, y, size: 10, font: fontBold, color: ACCENT });
        page.drawText(row.label, { x: colTopic, y, size: 9.5, font: fontBold, color: TEXT });
        page.drawText(initialsVal, {
            x: colInit,
            y: rowTopY,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        y -= 12;
        for (const sl of sumWrapped) {
            page.drawText(sl, { x: colTopic, y, size: 8, font: fontOblique, color: TEXT_MUTED });
            y -= 9;
        }
        y -= 6;
        page.drawLine({
            start: { x: CONTENT_X, y },
            end: { x: RIGHT_X, y },
            thickness: 0.35,
            color: LINE_LIGHT,
        });
        y -= 4;
    });

    y -= 10;
    writeMajorSection('IV', 'Electronic signature & attestation');
    for (const p of ESIGN_ATTESTATION) {
        writeParagraph(p, 9.2, font, TEXT, 3.8);
        y -= 2;
    }
    y -= 6;

    page.drawRectangle({
        x: CONTENT_X - 4,
        y: y - 26,
        width: USABLE_W + 8,
        height: 26,
        color: ACCENT_SOFT,
        borderColor: ACCENT_MUTED,
        borderWidth: 0.5,
    });
    page.drawText('Captured signature (as submitted)', {
        x: CONTENT_X + 4,
        y: y - 16,
        size: 8.5,
        font: fontBold,
        color: ACCENT_DEEP,
    });
    y -= 34;

    let png;
    try {
        png = await doc.embedPng(signaturePngBytes);
    } catch {
        throw new Error('Invalid signature image');
    }

    const boxW = Math.min(380, USABLE_W);
    const boxH = 112;
    needSpace(boxH + 48);
    page.drawRectangle({
        x: CONTENT_X,
        y: y - boxH,
        width: boxW,
        height: boxH,
        borderColor: ACCENT,
        borderWidth: 1.5,
        color: rgb(1, 1, 1),
    });
    page.drawRectangle({
        x: CONTENT_X + 5,
        y: y - boxH + 5,
        width: boxW - 10,
        height: boxH - 10,
        borderColor: LINE_LIGHT,
        borderWidth: 0.5,
        color: rgb(0.99, 0.99, 0.99),
    });

    const innerW = boxW - 28;
    const innerH = boxH - 28;
    const scale = Math.min(innerW / png.width, innerH / png.height);
    const imgW = png.width * scale;
    const imgH = png.height * scale;
    const imgX = CONTENT_X + (boxW - imgW) / 2;
    const imgY = y - boxH + (boxH - imgH) / 2;
    page.drawImage(png, { x: imgX, y: imgY, width: imgW, height: imgH });
    y -= boxH + 18;

    writeSubheading('Printed name & date');
    page.drawRectangle({
        x: CONTENT_X - 4,
        y: y - 52,
        width: USABLE_W + 8,
        height: 52,
        color: PANEL_BG,
        borderColor: LINE,
        borderWidth: 0.6,
    });
    page.drawText(`Printed name: ${data.fullName}`, {
        x: CONTENT_X + 6,
        y: y - 18,
        size: 10.5,
        font: fontBold,
        color: TEXT,
    });
    page.drawText(`Date: ${data.signDate}`, {
        x: CONTENT_X + 6,
        y: y - 38,
        size: 10,
        font: fontBold,
        color: TEXT,
    });
    y -= 62;

    writeParagraph(
        'By submitting the signing form, the Client confirmed they read the online contract summary, including cancellation (Section 08), no refunds (Section 04), late arrival (Section 10), preparation (Section 09), allergy disclosure (Section 11), photo release (Section 12), minors policy where applicable (Section 17), limitation of liability (Section 20), and entire agreement (Section 22), and agreed to be bound by all sections of the Glitz & Glamour Studio Beauty & Event Services Agreement.',
        8.4,
        font,
        TEXT_MUTED,
        3.2
    );

    // â”€â”€ Global page decoration: accent hairline, rail, footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const pages = doc.getPages();
    const total = pages.length;
    const footerRuleY = FOOTER_Y + 20;

    pages.forEach((p, i) => {
        if (i === 0) {
            p.drawRectangle({
                x: 0,
                y: PAGE_H - 3,
                width: PAGE_W,
                height: 3,
                color: ACCENT,
            });
        }

        const railTop = i === 0 ? PAGE_H - 126 : PAGE_H - 56;
        const railBottom = footerRuleY + 4;
        const railH = railTop - railBottom;
        if (railH > 28) {
            p.drawRectangle({
                x: MARGIN_OUT - 2,
                y: railBottom,
                width: RAIL_W,
                height: railH,
                color: RAIL,
            });
        }

        p.drawLine({
            start: { x: MARGIN_OUT, y: footerRuleY },
            end: { x: RIGHT_X, y: footerRuleY },
            thickness: RULE,
            color: LINE,
        });

        const footerLeft = 'Glitz & Glamour Studio  Â·  Client acknowledgment  Â·  Confidential';
        p.drawText(footerLeft, {
            x: CONTENT_X,
            y: FOOTER_Y,
            size: 7.5,
            font,
            color: TEXT_MUTED,
        });

        const pageBadge = `${i + 1} / ${total}`;
        const badgePadX = 8;
        const badgeW = fontBold.widthOfTextAtSize(pageBadge, 8) + badgePadX * 2;
        const badgeH = 16;
        const badgeX = RIGHT_X - badgeW;
        const badgeY = FOOTER_Y - 3;
        p.drawRectangle({
            x: badgeX,
            y: badgeY,
            width: badgeW,
            height: badgeH,
            color: ACCENT_SOFT,
            borderColor: ACCENT_MUTED,
            borderWidth: 0.55,
        });
        p.drawText(pageBadge, {
            x: badgeX + badgePadX,
            y: badgeY + 5,
            size: 8,
            font: fontBold,
            color: ACCENT_DEEP,
        });
    });

    return doc.save();
}
