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

/** PDF shell avoids Google Fonts CDN — external CSS breaks headless PDF when networkidle/load stalls or egress is blocked. */
const PDF_FONT_FALLBACK = `<style>html,body{font-family:Georgia,'Times New Roman',serif}.contract,.contract *{font-family:inherit}</style>`;

/** Wrap cheerio-serialized contract markup as a full document for headless PDF. */
export function wrapSpecialEventContractForPdf(contractMarkup: string): string {
    const css = getMonolithContractStyles();
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>${PDF_FONT_FALLBACK}<style>${css}</style></head><body><div class="wrap" style="max-width:920px;margin:0 auto;padding:14px">${contractMarkup}</div></body></html>`;
}
