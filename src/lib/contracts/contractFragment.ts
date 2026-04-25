import fs from 'fs';
import path from 'path';
import { load, type CheerioAPI } from 'cheerio';
import { isTag, type Element } from 'domhandler';
import type { NativeContentBlock } from '@/lib/contracts/nativeContentBlocks';
import { SPECIAL_EVENT_INIT_IDS, type ContractType, type SpecialEventInitId } from '@/lib/contracts/specialEventConstants';

const CONTRACT_FRAGMENT_PATHS: Record<ContractType, string> = {
    'in-studio': path.join('src', 'contracts', 'templates', 'in-studio-v1-contract-only.html'),
    'on-location': path.join('src', 'contracts', 'templates', 'on-location-v1-contract-only.html'),
};

/** Backwards-compat: original single-template path for older data. */
const CONTRACT_FRAGMENT_LEGACY = path.join('src', 'contracts', 'templates', 'special-events-v1-contract-only.html');

export function getSpecialEventsContractFragmentPath(contractType?: ContractType): string {
    const rel = contractType ? CONTRACT_FRAGMENT_PATHS[contractType] : CONTRACT_FRAGMENT_LEGACY;
    return path.join(process.cwd(), rel);
}

/** Canonical contract markup (letterhead + body) for PDF and client wizard. */
export function readSpecialEventsContractFragmentHtml(contractType?: ContractType): string {
    return fs.readFileSync(getSpecialEventsContractFragmentPath(contractType), 'utf8');
}

/** Human-readable labels for each wizard slice (after admin-filled HTML is split). */
export const CONTRACT_WIZARD_STEP_LABELS: Record<ContractType, readonly string[]> = {
    'on-location': [
        'Sections 01–05: Client, services, travel, payment',
        'Sections 06–10: Minimum booking through rescheduling',
        'Sections 11–15: Timeline, liability, allergy, photo release',
        'Sections 16–20: Artist rights through minors',
        'Sections 21–25: Force majeure through severability',
        'Sections 26–29: Governing law, severability, entire agreement, formation',
        'Sections 30–31: Data collection & privacy, electronic consent & signatures',
    ],
    'in-studio': [
        'Sections 01–05: Client, services, studio policies, payment',
        'Sections 06–10: Minimum booking through rescheduling',
        'Sections 11–15: Timeline, liability, allergy, photo release',
        'Sections 16–20: Artist rights through minors',
        'Sections 21–25: Force majeure through severability',
        'Sections 26–29: Governing law, severability, entire agreement, formation',
        'Sections 30–31: Data collection & privacy, electronic consent & signatures',
    ],
};

/** Get step labels for a given contract type (defaults to on-location for legacy). */
export function getWizardStepLabels(contractType?: ContractType): readonly string[] {
    return CONTRACT_WIZARD_STEP_LABELS[contractType || 'on-location'];
}

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

const INIT_ID_SET = new Set<string>(SPECIAL_EVENT_INIT_IDS);

/** One contract section (`.c-sec`) plus any initials rows that belonged to it in markup order. */
export type WizardSectionClient = {
    blocks: NativeContentBlock[];
    initialIds: SpecialEventInitId[];
};

export type WizardChunkClient = {
    sections: WizardSectionClient[];
    /** All init ids in this chunk, in document order (same as concatenating each section’s `initialIds`). */
    initialIds: SpecialEventInitId[];
    /** Full init-label HTML extracted from the template, keyed by init ID. */
    initLabelHtml: Record<string, string>;
};

function normText(s: string): string {
    return s.replace(/\s+/g, ' ').trim();
}

/** Allowed inline tags for rich text rendering. */
const ALLOWED_INLINE_TAGS = new Set(['strong', 'b', 'em', 'i', 'u', 'a', 'br', 'span', 'sup', 'sub']);

/**
 * Extract inner HTML preserving only safe inline formatting tags.
 * Strips block-level elements and script/style but keeps <strong>, <em>, etc.
 */
function richHtml($: CheerioAPI, el: ReturnType<CheerioAPI>) : string {
    let html = el.html() ?? '';
    // Strip any tags that are NOT in the allowed set, and remove style attrs from allowed tags
    html = html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
        if (!ALLOWED_INLINE_TAGS.has(tag.toLowerCase())) return ''; // strip block/unknown tags
        // Remove inline style attributes (they carry PDF-only colors that break dark theme)
        return match.replace(/\s+style\s*=\s*"[^"]*"/gi, '').replace(/\s+style\s*=\s*'[^']*'/gi, '');
    });
    return html.replace(/\s+/g, ' ').trim();
}

function parseTable($: CheerioAPI, tableEl: Element): NativeContentBlock {
    const $t = $(tableEl);
    const headers: string[] = [];
    $t.find('thead tr').first().find('th').each((_, th) => {
        headers.push(normText($(th).text()));
    });
    const rows: string[][] = [];
    $t.find('tbody tr, tfoot tr').each((_, tr) => {
        const row: string[] = [];
        $(tr).find('th, td').each((_, cell) => {
            row.push(normText($(cell).text()));
        });
        if (row.some((c) => c.length > 0)) rows.push(row);
    });
    return { type: 'table', headers, rows };
}

function parseBodyText($: CheerioAPI, el: Element): NativeContentBlock[] {
    const blocks: NativeContentBlock[] = [];
    $(el).children().each((_, child) => {
        const $c = $(child);
        const tag = child.tagName?.toLowerCase();
        if (tag === 'p') {
            const t = richHtml($, $c);
            if (t) blocks.push({ type: 'paragraph', text: t });
        } else if (tag === 'ul') {
            const items: string[] = [];
            $c.find('> li').each((_, li) => {
                const $li = $(li);
                // Check for styled inner div boxes (e.g. Payment Accounts box)
                const innerDivs = $li.find('> div[style]');
                if (innerDivs.length > 0) {
                    // Emit the text before the inner div(s) as a list item
                    const clone = $li.clone();
                    clone.find('> div[style]').remove();
                    const liText = richHtml($, clone);
                    if (liText) items.push(liText);
                    // Push pending list items, then emit divs as callouts
                    if (items.length) {
                        blocks.push({ type: 'list', ordered: false, items: [...items] });
                        items.length = 0;
                    }
                    innerDivs.each((_, dv) => {
                        const dt = richHtml($, $(dv));
                        if (dt) blocks.push({ type: 'callout', variant: 'info', text: dt });
                    });
                } else {
                    items.push(richHtml($, $li));
                }
            });
            if (items.length) blocks.push({ type: 'list', ordered: false, items });
        } else if (tag === 'ol') {
            const items: string[] = [];
            $c.find('> li').each((_, li) => {
                items.push(richHtml($, $(li)));
            });
            if (items.length) blocks.push({ type: 'list', ordered: true, items });
        } else if (tag === 'div' && $c.hasClass('info-row')) {
            const label = normText($c.find('.info-key').first().text());
            const value = normText($c.find('.info-val').first().text());
            if (label || value) blocks.push({ type: 'keyValue', label, value });
        } else if (tag === 'div' && $c.hasClass('warn-box')) {
            const t = richHtml($, $c);
            if (t) blocks.push({ type: 'callout', variant: 'warning', text: t });
        } else if (tag === 'div' && $c.hasClass('info-grid')) {
            // Parse info-grid the same way parseCSec does — each .info-row becomes a keyValue block
            $c.find('.info-row').each((_, row) => {
                const $r = $(row);
                const label = normText($r.find('.info-key').first().text());
                const value = normText($r.find('.info-val').first().text());
                if (label || value) blocks.push({ type: 'keyValue', label, value });
            });
        } else if (tag === 'div' && $c.hasClass('client-field-group')) {
            // Extract any info-grid key-value rows from within the interactive group
            $c.find('.info-row').each((_, row) => {
                const $r = $(row);
                const label = normText($r.find('.info-key').first().text());
                const value = normText($r.find('.info-val').first().text());
                if (label || value) blocks.push({ type: 'keyValue', label, value });
            });
        } else if (tag === 'div') {
            // Catch styled info boxes (e.g. payment accounts) that don't match above patterns
            const t = richHtml($, $c);
            if (t) blocks.push({ type: 'callout', variant: 'info', text: t });
        }
    });
    return blocks;
}

function parseCSec($: CheerioAPI, secEl: Element): NativeContentBlock[] {
    const blocks: NativeContentBlock[] = [];
    $(secEl).children().each((_, child) => {
        const $c = $(child);
        const tag = child.tagName?.toLowerCase();
        if (tag === 'div' && $c.hasClass('c-sec-num')) {
            const t = normText($c.text());
            if (t) blocks.push({ type: 'heading', level: 4, text: t });
        } else if (tag === 'div' && $c.hasClass('c-sec-title')) {
            const t = normText($c.text());
            if (t) blocks.push({ type: 'heading', level: 3, text: t });
        } else if (tag === 'div' && $c.hasClass('info-grid')) {
            $c.find('.info-row').each((_, row) => {
                const $r = $(row);
                const label = normText($r.find('.info-key').first().text());
                const value = normText($r.find('.info-val').first().text());
                if (label || value) blocks.push({ type: 'keyValue', label, value });
            });
        } else if (tag === 'table') {
            blocks.push(parseTable($, child));
        } else if (tag === 'div' && $c.hasClass('body-text')) {
            blocks.push(...parseBodyText($, child));
        } else if (tag === 'div' && $c.hasClass('warn-box')) {
            const t = richHtml($, $c);
            if (t) blocks.push({ type: 'callout', variant: 'warning', text: t });
        } else if (tag === 'div' && $c.hasClass('client-field-group')) {
            // Skip interactive client field groups (handled by wizard form)
        } else if (tag === 'div') {
            // Fallback: catch any styled div content not matched above
            const t = richHtml($, $c);
            if (t && t.length > 20) blocks.push({ type: 'callout', variant: 'info', text: t });
        }
    });
    return blocks;
}

function parseChunkRoot($: CheerioAPI, chunkEl: Element): NativeContentBlock[] {
    const blocks: NativeContentBlock[] = [];
    $(chunkEl).children().each((_, child) => {
        const tag = child.tagName?.toLowerCase();
        const $c = $(child);
        if (tag === 'hr') {
            blocks.push({ type: 'horizontalRule' });
        } else if (tag === 'div' && $c.hasClass('c-sec')) {
            blocks.push(...parseCSec($, child));
        }
    });
    return blocks;
}

/** Strip initials UI per section; emit native blocks so the client can show initials after each section. */
export function parseWizardChunkToNative(chunkHtml: string): WizardChunkClient {
    const $ = load(`<div id="_ggs_wchunk">${chunkHtml}</div>`);
    const root = $('#_ggs_wchunk').first();
    root.find('script').remove();
    root.find('[onclick]').removeAttr('onclick');

    const inner = root.children().first();
    const chunkEl =
        inner.length > 0 && inner.hasClass('ggs-wizard-chunk')
            ? inner.get(0)
            : root.find('.ggs-wizard-chunk').first().get(0);

    const sections: WizardSectionClient[] = [];
    const initialIds: SpecialEventInitId[] = [];
    const initLabelHtml: Record<string, string> = {};
    let pendingPrefix: NativeContentBlock[] = [];

    if (chunkEl && isTag(chunkEl)) {
        $(chunkEl)
            .children()
            .each((_, child) => {
                const $c = $(child);
                const tag = child.tagName?.toLowerCase();
                if (tag === 'hr') {
                    pendingPrefix.push({ type: 'horizontalRule' });
                    return;
                }
                if (tag === 'div' && $c.hasClass('c-sec')) {
                    const secIds: SpecialEventInitId[] = [];
                    $c.find('.init-row').each((_, el) => {
                        const id = $(el).attr('id');
                        if (id && INIT_ID_SET.has(id)) {
                            const sid = id as SpecialEventInitId;
                            secIds.push(sid);
                            initialIds.push(sid);
                            const labelEl = $(el).find('.init-label').first();
                            if (labelEl.length) {
                                initLabelHtml[sid] = labelEl.html()?.trim() || '';
                            }
                        }
                        $(el).remove();
                    });
                    const secBlocks = parseCSec($, child);
                    sections.push({
                        blocks: [...pendingPrefix, ...secBlocks],
                        initialIds: secIds,
                    });
                    pendingPrefix = [];
                }
            });

        if (pendingPrefix.length > 0) {
            if (sections.length > 0) {
                const last = sections[sections.length - 1]!;
                last.blocks = [...last.blocks, ...pendingPrefix];
            } else {
                sections.push({ blocks: [...pendingPrefix], initialIds: [] });
            }
            pendingPrefix = [];
        }
    }

    if (sections.length === 0 && chunkEl && isTag(chunkEl)) {
        $(chunkEl)
            .find('.init-row')
            .each((_, el) => {
                const id = $(el).attr('id');
                if (id && INIT_ID_SET.has(id)) {
                    const sid = id as SpecialEventInitId;
                    initialIds.push(sid);
                }
                $(el).remove();
            });
        let blocks = parseChunkRoot($, chunkEl);
        if (blocks.length === 0) {
            const fallback = normText(root.text());
            if (process.env.NODE_ENV === 'development') {
                console.warn('[parseWizardChunkToNative] empty blocks, using text fallback');
            }
            if (fallback) blocks = [{ type: 'paragraph', text: fallback }];
        }
        sections.push({ blocks, initialIds: [...initialIds] });
    }

    if (sections.length === 0) {
        const fallback = normText(root.text());
        if (process.env.NODE_ENV === 'development') {
            console.warn('[parseWizardChunkToNative] no chunk element, using text fallback');
        }
        const blocks: NativeContentBlock[] = fallback ? [{ type: 'paragraph', text: fallback }] : [];
        return { sections: [{ blocks, initialIds: [] }], initialIds: [], initLabelHtml: {} };
    }

    return { sections, initialIds, initLabelHtml };
}
