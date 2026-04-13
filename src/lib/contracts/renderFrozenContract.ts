/**
 * Builds an immutable HTML snapshot of the special-events contract from the legal fragment.
 * Only element contents / classes are changed — clause text stays in special-events-v1-contract-only.html.
 */
import fs from 'fs';
import path from 'path';
import { load, type CheerioAPI } from 'cheerio';
import type { AdminContractPayload, AdminFinalizePayload, ClientSpecialEventPayload } from './adminContractPayload';
import { formatAllergyDisplay, formatSkinDisplay } from './adminContractPayload';
import { SPECIAL_EVENT_INIT_IDS } from './specialEventConstants';
import { readSpecialEventsContractFragmentHtml } from './contractFragment';

const TEMPLATE_REL = path.join('src', 'contracts', 'templates', 'special-events-v1.html');

export function getSpecialEventsTemplatePath(): string {
    return path.join(process.cwd(), TEMPLATE_REL);
}

/** Full legacy HTML (builder + contract). Prefer contract fragment for PDF. */
export function readSpecialEventsTemplateHtml(): string {
    const p = getSpecialEventsTemplatePath();
    return fs.readFileSync(p, 'utf8');
}

function fmtDateVal(v: string): string {
    if (!v?.trim()) return '—';
    const d = new Date(`${v.trim()}T00:00:00`);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtTimeVal(v: string): string {
    if (!v?.trim()) return '—';
    const [h, m] = v.split(':');
    const hh = parseInt(h, 10);
    if (Number.isNaN(hh)) return '—';
    const mm = m || '00';
    return `${hh % 12 || 12}:${mm} ${hh >= 12 ? 'PM' : 'AM'}`;
}

function fmtMoneyVal(v: string): string {
    if (!v?.trim()) return '—';
    const n = parseFloat(v);
    if (Number.isNaN(n)) return '—';
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function escAttr(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function buildServicesTable(admin: AdminContractPayload): { html: string; subtotal: number; anyRow: boolean } {
    let html = '';
    let subtotal = 0;
    let anyRow = false;
    for (const row of admin.services) {
        const desc = row.description.trim();
        if (!desc) continue;
        anyRow = true;
        const n = parseFloat(row.price) || 0;
        subtotal += n;
        const p = row.price.trim()
            ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '—';
        const notes = row.notes.trim() || '—';
        html += `<tr><td>${escAttr(desc)}</td><td class="price-col">${escAttr(p)}</td><td>${escAttr(notes)}</td></tr>`;
    }
    if (!anyRow) {
        html =
            '<tr><td colspan="3" style="color:var(--muted);font-size:.8rem;padding:12px 10px;font-style:italic">No services added yet.</td></tr>';
    }
    return { html, subtotal, anyRow };
}

type RenderPhase = 'client_signed' | 'final';

export type ContractSnapshotAudit = {
    clientSignedAtIso: string;
    clientIp: string;
    clientUa: string;
};

/**
 * Apply studio/admin fields only (client allergy/skin/photo left as — for wizard preview).
 */
export function applyAdminFieldsToContract($: CheerioAPI, admin: AdminContractPayload): void {
    $('#c_date').text(fmtDateVal(admin.contractDate));
    $('#c_num').text(admin.contractNumber || '—');
    const fr = $('#c_footer_ref');
    if (fr.length) fr.text(admin.contractNumber ? `Contract No. ${admin.contractNumber}` : '');

    $('#c_client').text(admin.clientLegalName || '—');
    $('#c_phone').text(admin.phone || '—');
    $('#c_email').text(admin.email || '—');
    $('#c_event_type').text(admin.eventType || '—');
    $('#c_event_date').text(fmtDateVal(admin.eventDate));
    $('#c_start_time').text(fmtTimeVal(admin.startTime));
    $('#c_venue').text(admin.venue || '—');
    $('#c_headcount').text(admin.headcount || '—');

    const { html: svcHtml, subtotal, anyRow } = buildServicesTable(admin);
    $('#c_svc_body').html(svcHtml);
    const stEl = $('#c_svc_subtotal');
    if (stEl.length) {
        stEl.text(
            anyRow
                ? `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '—'
        );
    }

    const travelRaw = parseFloat(admin.travelFee) || 0;
    $('#c_travel_total').text(
        travelRaw > 0
            ? `$${travelRaw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '—'
    );
    const grand = subtotal + travelRaw;
    $('#c_grand_total').text(
        grand > 0 ? `$${grand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
    );

    $('#c_travel').text(admin.travelRequired || '—');
    $('#c_travel_fee').text(fmtMoneyVal(admin.travelFee));
    $('#c_travel_dest').text(admin.travelDest || '—');
    $('#c_miles').text(admin.miles ? `${admin.miles} miles` : '—');

    const ret = fmtMoneyVal(admin.retainer);
    const bal = fmtMoneyVal(admin.balance);
    $('#c_retainer').text(ret === '—' ? '__________' : ret);
    $('#c_balance').text(bal === '—' ? '__________' : bal);

    const pp = admin.ppActive?.trim() || '—';
    $('#c_pp_active').text(pp);
    if (pp === 'Yes') {
        $('#c_pp_ret').text(ret);
        $('#c_pp2_amt').text(fmtMoneyVal(admin.pp2Amt));
        $('#c_pp2_date').text(fmtDateVal(admin.pp2Date));
        $('#c_pp3_amt').text(fmtMoneyVal(admin.pp3Amt));
        $('#c_pp3_date').text(fmtDateVal(admin.pp3Date));
        $('#c_pp_final').text(fmtMoneyVal(admin.ppFinal));
    } else {
        // Keep Section 05 visible even when no plan is selected; show N/A/— fields instead of $0.00 rows.
        $('#c_pp_ret').text('—');
        $('#c_pp2_amt').text('—');
        $('#c_pp2_date').text('—');
        $('#c_pp3_amt').text('—');
        $('#c_pp3_date').text('—');
        $('#c_pp_final').text('—');
    }

    const ms = admin.minSvc.trim();
    $('#c_min_svc').text(ms || 'N/A');
    const ld = admin.lockDays.trim();
    $('#c_lock_days').text(ld || 'N/A');

    const pf = admin.prepFee.trim() || '25.00';
    $('#c_prep_fee').text(pf);
    $('#c_prep_fee_init').text(pf);

    const ot = admin.overtimeRate.trim() || '75.00';
    $('#c_overtime_rate').text(ot);
    const otHalf = admin.overtimeRate.trim() ? (parseFloat(admin.overtimeRate) / 2).toFixed(2) : '37.50';
    $('#c_overtime_rate_half').text(otHalf);

    $('#c_allergies').text('—');
    $('#c_skin').text('—');
    $('#c_photo').text('—');
    $('#c_photo_restrict').text('—');

    $('#c_trial_fee').text(admin.trialFeeEnabled ? fmtMoneyVal(admin.trialFee) : 'N/A');

    $('#c_minors').text(admin.minors.trim() || 'N/A');
    $('#c_guardian').text(admin.guardian.trim() || 'N/A');
    $('#c_guardian_phone').text(admin.guardianPhone.trim() || 'N/A');
}

function removeCSecBeforeHr($: CheerioAPI, initRowId: string): void {
    const row = $(`#${initRowId}`);
    if (!row.length) return;
    const sec = row.closest('.c-sec');
    if (!sec.length) return;
    const prev = sec.prev();
    if (prev.length && prev.is('hr')) prev.remove();
    sec.remove();
}

/** Remove Section 05 / 19 when those options are off (wizard + frozen PDF use the same DOM). */
export function stripOptionalContractSectionsFromContractDom($: CheerioAPI, admin: AdminContractPayload): void {
}

/** PDF: remove legacy draw/type signature UI; keep final image and printed name text only. */
function stripInteractiveSignatureChrome($: CheerioAPI, printedName: string): void {
    $('.sig-tabs').remove();
    $('#drawArea').remove();
    $('#typeArea').remove();
    $('#sigResult .sig-result-label').remove();
    $('#sigResult .sig-change').remove();
    $('#printedNameInput').remove();
    $('#printedNameResult .sig-result-label').remove();
    $('#printedNameResult .sig-change').remove();
    $('#printedNameDisplay').text(printedName);
    $('#printedNameResult').addClass('show');
}

/**
 * Apply admin + client (+ optional studio finalize) data to the contract fragment DOM.
 */
export function renderFrozenContractHtml(
    admin: AdminContractPayload,
    client: ClientSpecialEventPayload,
    phase: RenderPhase,
    finalize:
        | (Pick<AdminFinalizePayload, 'retainerReceived' | 'adminPrintedName' | 'adminSignDateDisplay'> & {
              signaturePngBase64?: string;
          })
        | null
        | undefined,
    audit: ContractSnapshotAudit
): string {
    const raw = readSpecialEventsContractFragmentHtml();
    const $ = load(raw);

    applyAdminFieldsToContract($, admin);
    stripOptionalContractSectionsFromContractDom($, admin);

    const allergyText = formatAllergyDisplay(client.allergySelect, client.allergyDetail);
    const skinText = formatSkinDisplay(client.skinSelect, client.skinDetail);

    $('#c_allergies').text(allergyText);
    $('#c_skin').text(skinText);

    $('#c_photo').text(client.photoValue || '—');
    const pr =
        client.photoValue === 'No — consent denied'
            ? client.photoRestrict.trim() || 'No restrictions specified'
            : '—';
    $('#c_photo_restrict').text(pr);

    for (const id of SPECIAL_EVENT_INIT_IDS) {
        const row = $(`#${id}`);
        const box = $(`#ibox_${id.replace('init_', '')}`);
        const ini = client.initials[id];
        if (row.length) row.addClass('done');
        if (box.length) {
            box.html(`<span style="font-family:'Dancing Script',cursive;font-size:1.25rem;color:var(--deep)">${escAttr(ini)}</span>`);
        }
    }

    $('.geo-consent-row').addClass('done');
    $('.geo-consent-box').text('✓');

    const dataUrl = `data:image/png;base64,${client.signaturePngBase64}`;
    $('#sigResultDisplay').html(`<img src="${dataUrl}" alt="Signature" style="max-height:120px"/>`);
    $('#sigResult').addClass('show');
    $('#clientSigLine').html(`<img src="${dataUrl}" alt="Signature" style="max-height:44px"/>`);
    $('#sig_client_date').text(client.clientSignDateDisplay);
    $('#c_client_print').text(client.printedName);

    $('#contract_status').text(phase === 'final' ? '✦ Fully Executed' : 'Client executed — pending studio acceptance');
    if (phase === 'final') {
        $('#contract_status').attr('style', 'color:#b8972a;font-weight:700;letter-spacing:0.03em');
    }

    if (phase === 'final' && finalize) {
        const blocks = $('.sig-line-row .sig-line-block');
        const studioBlock = blocks.eq(1);
        const img = studioBlock.find('.sig-line img');
        const sigBase64 = finalize.signaturePngBase64?.trim();
        if (sigBase64 && img.length) {
            const adminData = `data:image/png;base64,${sigBase64}`;
            img.attr('src', adminData);
        }
        $('#sig_artist_date_display').text(finalize.adminSignDateDisplay);
        const meta = studioBlock.find('.sig-line-meta');
        if (meta.length) {
            meta.html(
                `Printed Name: ${escAttr(finalize.adminPrintedName)}<br>Date: <span style="font-weight:500;color:var(--ink)">${escAttr(finalize.adminSignDateDisplay)}</span><br>Retainer received: Yes`
            );
        }
    }

    $('.exec-record').addClass('show');
    $('#er_name').text(client.printedName);
    $('#er_contract').text(admin.contractNumber || '—');
    const signedAt = new Date(audit.clientSignedAtIso);
    $('#er_time').text(
        Number.isNaN(signedAt.getTime())
            ? audit.clientSignedAtIso
            : signedAt.toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short',
              })
    );
    $('#er_ip').text(audit.clientIp || '—');
    $('#er_ua').text(audit.clientUa || '—');
    $('#er_loc').text('—');
    $('#er_gps').text('—');
    $('#er_method').text('Server-submitted execution');

    stripInteractiveSignatureChrome($, client.printedName);

    return $.html();
}
