import { readSpecialEventsTemplateHtml } from './renderFrozenContract';

let cachedContractStyles: string | null = null;

/** First <style> block from the legacy monolith (contract + PDF typography). */
function getMonolithContractStyles(): string {
    if (cachedContractStyles !== null) return cachedContractStyles;
    const full = readSpecialEventsTemplateHtml();
    const m = full.match(/<style>([\s\S]*?)<\/style>/);
    cachedContractStyles = m?.[1] ?? '';
    return cachedContractStyles;
}

const FONTS_LINK = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=Pinyon+Script&display=swap"/>`;

/** Wrap cheerio-serialized contract markup as a full document for headless PDF. */
export function wrapSpecialEventContractForPdf(contractMarkup: string): string {
    const css = getMonolithContractStyles();
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>${FONTS_LINK}<style>${css}</style></head><body><div class="wrap" style="max-width:920px;margin:0 auto;padding:14px">${contractMarkup}</div></body></html>`;
}
