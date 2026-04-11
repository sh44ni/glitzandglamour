import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const CONTRACT_FRAGMENT_REL = path.join('src', 'contracts', 'templates', 'special-events-v1-contract-only.html');

export function getSpecialEventsContractFragmentPath(): string {
    return path.join(process.cwd(), CONTRACT_FRAGMENT_REL);
}

/** Canonical contract markup (letterhead + body) for PDF and client wizard. */
export function readSpecialEventsContractFragmentHtml(): string {
    return fs.readFileSync(getSpecialEventsContractFragmentPath(), 'utf8');
}

/** Human-readable labels for each wizard slice (after admin-filled HTML is split). */
export const CONTRACT_WIZARD_STEP_LABELS = [
    'Sections 01–05: Client, services, travel, payment',
    'Sections 06–10: Minimum booking through rescheduling',
    'Sections 11–15: Timeline, liability, allergy, photo release',
    'Sections 16–20: Artist rights through minors',
    'Sections 21–25: Force majeure through governing law',
    'Sections 26–29: Severability through privacy',
    'Section 30: Electronic consent & binding effect',
] as const;

/** Letterhead HTML + ordered wizard chunks (admin-filled contract markup). */
export function extractLetterheadAndWizardChunks(fullContractHtml: string): { letterheadHtml: string; chunks: string[] } {
    const $ = load(fullContractHtml);
    const lh = $('.c-lh').first();
    const letterheadHtml = lh.length ? $.html(lh) : '';
    const chunks = $('.ggs-wizard-chunk')
        .map((_, el) => $.html(el))
        .get()
        .map((s) => s.trim())
        .filter(Boolean);
    return { letterheadHtml, chunks };
}
