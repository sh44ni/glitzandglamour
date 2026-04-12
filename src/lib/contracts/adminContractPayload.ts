import {
    INIT_ID_PAYMENT_PLAN,
    INIT_ID_TRAVEL,
    INIT_ID_TRIAL,
    SPECIAL_EVENT_INIT_IDS,
    type SpecialEventInitId,
} from './specialEventConstants';

/** One line in the services table (matches builder + contract preview). */
export type AdminServiceLine = {
    description: string;
    price: string;
    notes: string;
};

/**
 * Studio/admin-controlled fields for the special-events agreement.
 * Values are stored as strings matching HTML <input> / <select> values (ISO dates for type=date, etc.).
 */
export type AdminContractPayload = {
    contractDate: string;
    contractNumber: string;
    clientLegalName: string;
    phone: string;
    email: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    venue: string;
    headcount: string;
    services: AdminServiceLine[];
    travelRequired: string;
    travelFee: string;
    travelDest: string;
    miles: string;
    retainer: string;
    balance: string;
    ppActive: string;
    pp2Amt: string;
    pp2Date: string;
    pp3Amt: string;
    pp3Date: string;
    ppFinal: string;
    minSvc: string;
    lockDays: string;
    addonFee: string;
    prepFee: string;
    overtimeRate: string;
    trialFee: string;
    minors: string;
    guardian: string;
    guardianPhone: string;
    paymentPlanEnabled: boolean;
    travelEnabled: boolean;
    trialFeeEnabled: boolean;
    /** Studio-only; not rendered on the client-facing contract */
    internalNotes?: string;
};

export const SIGNATURE_TYPEFACE_IDS = ['dancing', 'greatVibes', 'parisienne', 'allura', 'cinzel', 'caveat'] as const;
export type SignatureTypefaceId = (typeof SIGNATURE_TYPEFACE_IDS)[number];

/** Labels + CSS font stacks for canvas (matches Google Fonts link on sign page). */
export const SIGNATURE_TYPEFACE_OPTIONS: readonly { id: SignatureTypefaceId; label: string; family: string }[] = [
    { id: 'dancing', label: 'Dancing Script', family: '"Dancing Script", cursive' },
    { id: 'greatVibes', label: 'Great Vibes', family: '"Great Vibes", cursive' },
    { id: 'parisienne', label: 'Parisienne', family: '"Parisienne", cursive' },
    { id: 'allura', label: 'Allura', family: '"Allura", cursive' },
    { id: 'cinzel', label: 'Cinzel (formal)', family: '"Cinzel", serif' },
    { id: 'caveat', label: 'Caveat', family: '"Caveat", cursive' },
];

export type ClientSpecialEventPayload = {
    allergySelect: string;
    allergyDetail: string;
    skinSelect: string;
    skinDetail: string;
    photoValue: string;
    photoRestrict: string;
    geoConsent: true;
    initials: Record<SpecialEventInitId, string>;
    printedName: string;
    clientSignDateDisplay: string;
    signatureMethod: 'draw' | 'type';
    /** Set when signatureMethod is 'type' (audit / support). */
    signatureTypefaceId?: SignatureTypefaceId;
    /** Raw base64 without data URL prefix */
    signaturePngBase64: string;
};

export type AdminFinalizePayload = {
    retainerReceived: true;
    adminPrintedName: string;
    adminSignDateDisplay: string;
    signaturePngBase64: string;
};

function nonEmpty(s: unknown): s is string {
    return typeof s === 'string' && s.trim().length > 0;
}

function isServiceLine(x: unknown): x is AdminServiceLine {
    if (!x || typeof x !== 'object') return false;
    const o = x as Record<string, unknown>;
    return typeof o.description === 'string' && typeof o.price === 'string' && typeof o.notes === 'string';
}

function inferPaymentPlanEnabled(b: Record<string, unknown>): boolean {
    if (typeof b.paymentPlanEnabled === 'boolean') return b.paymentPlanEnabled;
    return String(b.ppActive ?? '').trim() === 'Yes';
}

function inferTravelEnabled(b: Record<string, unknown>): boolean {
    if (typeof b.travelEnabled === 'boolean') return b.travelEnabled;
    const tr = String(b.travelRequired ?? '').trim();
    if (tr === 'Yes') return true;
    const fee = parseFloat(String(b.travelFee ?? ''));
    return !Number.isNaN(fee) && fee > 0;
}

function inferTrialFeeEnabled(b: Record<string, unknown>): boolean {
    if (typeof b.trialFeeEnabled === 'boolean') return b.trialFeeEnabled;
    const t = String(b.trialFee ?? '').trim();
    if (!t) return false;
    const n = parseFloat(t);
    return !Number.isNaN(n) && n > 0;
}

/** Which client initials are required for PDF, based on studio toggles. */
export function getRequiredSpecialEventInitialIds(admin: AdminContractPayload): SpecialEventInitId[] {
    return SPECIAL_EVENT_INIT_IDS.filter((id) => {
        if (id === INIT_ID_PAYMENT_PLAN && !admin.paymentPlanEnabled) return false;
        if (id === INIT_ID_TRAVEL && !admin.travelEnabled) return false;
        if (id === INIT_ID_TRIAL && !admin.trialFeeEnabled) return false;
        return true;
    });
}

/** Expand partial client initials with N/A for waived sections (PDF + storage). */
export function mergeClientInitialsForPdf(
    partial: Partial<Record<SpecialEventInitId, string>>,
    requiredIds: readonly SpecialEventInitId[]
): Record<SpecialEventInitId, string> {
    const out = {} as Record<SpecialEventInitId, string>;
    for (const id of SPECIAL_EVENT_INIT_IDS) {
        if (!requiredIds.includes(id)) {
            out[id] = 'N/A';
            continue;
        }
        const v = partial[id];
        out[id] = typeof v === 'string' && v.trim() ? v.trim().toUpperCase() : '';
    }
    return out;
}

export function validateAdminContractPayload(body: unknown): { ok: true; data: AdminContractPayload } | { ok: false; message: string } {
    if (!body || typeof body !== 'object') return { ok: false, message: 'Invalid payload' };
    const b = body as Record<string, unknown>;
    const services = b.services;
    if (!Array.isArray(services) || !services.every(isServiceLine)) {
        return { ok: false, message: 'Services must be an array of { description, price, notes }' };
    }

    const coreKeys = [
        'contractDate',
        'contractNumber',
        'clientLegalName',
        'phone',
        'email',
        'eventType',
        'eventDate',
        'startTime',
        'venue',
        'headcount',
        'retainer',
        'balance',
        'minSvc',
        'lockDays',
        'addonFee',
        'prepFee',
        'overtimeRate',
        'minors',
        'guardian',
        'guardianPhone',
    ] as const;
    for (const k of coreKeys) {
        if (!nonEmpty(b[k])) return { ok: false, message: `Missing or empty field: ${k}` };
    }

    const paymentPlanEnabled = inferPaymentPlanEnabled(b);
    const travelEnabled = inferTravelEnabled(b);
    const trialFeeEnabled = inferTrialFeeEnabled(b);

    let travelRequired = String(b.travelRequired ?? '').trim();
    let travelFee = String(b.travelFee ?? '').trim();
    let travelDest = String(b.travelDest ?? '').trim();
    let miles = String(b.miles ?? '').trim();

    if (travelEnabled) {
        if (!nonEmpty(b.travelRequired)) return { ok: false, message: 'Travel: indicate whether travel is required' };
        if (!nonEmpty(b.travelFee)) return { ok: false, message: 'Travel: fee is required (use 0 if none)' };
        if (!nonEmpty(b.travelDest)) return { ok: false, message: 'Travel: destination is required' };
        if (!nonEmpty(b.miles)) return { ok: false, message: 'Travel: miles from Vista is required' };
    } else {
        travelRequired = 'No';
        travelFee = '0';
        travelDest = '';
        miles = '0';
    }

    let ppActive = String(b.ppActive ?? '').trim();
    let pp2Amt = String(b.pp2Amt ?? '').trim();
    let pp2Date = String(b.pp2Date ?? '').trim();
    let pp3Amt = String(b.pp3Amt ?? '').trim();
    let pp3Date = String(b.pp3Date ?? '').trim();
    let ppFinal = String(b.ppFinal ?? '').trim();

    if (paymentPlanEnabled) {
        if (!nonEmpty(b.pp2Amt)) return { ok: false, message: 'Payment plan: 2nd payment amount is required' };
        if (!nonEmpty(b.pp2Date)) return { ok: false, message: 'Payment plan: 2nd payment due date is required' };
        if (!nonEmpty(b.pp3Amt)) return { ok: false, message: 'Payment plan: 3rd payment amount is required' };
        if (!nonEmpty(b.pp3Date)) return { ok: false, message: 'Payment plan: 3rd payment due date is required' };
        if (!nonEmpty(b.ppFinal)) return { ok: false, message: 'Payment plan: final payment amount is required' };
        ppActive = 'Yes';
    } else {
        ppActive = 'No';
        pp2Amt = '0';
        pp2Date = '';
        pp3Amt = '0';
        pp3Date = '';
        ppFinal = '0';
    }

    let trialFee = String(b.trialFee ?? '').trim();
    if (trialFeeEnabled) {
        const n = parseFloat(trialFee);
        if (!trialFee || Number.isNaN(n) || n <= 0) {
            return { ok: false, message: 'Trial fee: enter a positive amount' };
        }
    } else {
        trialFee = '0';
    }

    const data: AdminContractPayload = {
        contractDate: String(b.contractDate).trim(),
        contractNumber: String(b.contractNumber).trim(),
        clientLegalName: String(b.clientLegalName).trim(),
        phone: String(b.phone).trim(),
        email: String(b.email).trim(),
        eventType: String(b.eventType).trim(),
        eventDate: String(b.eventDate).trim(),
        startTime: String(b.startTime).trim(),
        venue: String(b.venue).trim(),
        headcount: String(b.headcount).trim(),
        services: services as AdminServiceLine[],
        travelRequired,
        travelFee,
        travelDest,
        miles,
        retainer: String(b.retainer).trim(),
        balance: String(b.balance).trim(),
        ppActive,
        pp2Amt,
        pp2Date,
        pp3Amt,
        pp3Date,
        ppFinal,
        minSvc: String(b.minSvc).trim(),
        lockDays: String(b.lockDays).trim(),
        addonFee: String(b.addonFee).trim(),
        prepFee: String(b.prepFee).trim(),
        overtimeRate: String(b.overtimeRate).trim(),
        trialFee,
        minors: String(b.minors).trim(),
        guardian: String(b.guardian).trim(),
        guardianPhone: String(b.guardianPhone).trim(),
        paymentPlanEnabled,
        travelEnabled,
        trialFeeEnabled,
        internalNotes: typeof b.internalNotes === 'string' ? b.internalNotes : undefined,
    };
    return { ok: true, data };
}

function needsAllergyDetail(sel: string): boolean {
    return (
        sel.includes('see details below') || sel.includes('Multiple') || sel.includes('Other')
    );
}

function needsSkinDetail(sel: string): boolean {
    return (
        sel.includes('see details below') ||
        sel.includes('Multiple') ||
        sel.includes('Other') ||
        sel.includes('Scalp condition')
    );
}

export function formatAllergyDisplay(sel: string, detail: string): string {
    const d = detail.trim();
    if (!sel) return 'None disclosed';
    if (sel === 'None') return 'None';
    if (needsAllergyDetail(sel)) {
        if (d) return `${sel.replace(' — see details below', '')}: ${d}`;
        return sel;
    }
    return sel;
}

export function formatSkinDisplay(sel: string, detail: string): string {
    const d = detail.trim();
    if (!sel) return 'None disclosed';
    if (sel === 'None') return 'None';
    if (needsSkinDetail(sel)) {
        if (d) return `${sel.replace(' — see details below', '')}: ${d}`;
        return sel;
    }
    return sel;
}

export function validateClientSpecialEventPayload(
    body: unknown,
    requiredInitialIds: readonly SpecialEventInitId[]
): { ok: true; data: ClientSpecialEventPayload } | { ok: false; message: string } {
    if (!body || typeof body !== 'object') return { ok: false, message: 'Invalid JSON body' };
    const b = body as Record<string, unknown>;
    if (b.mode !== 'special-events-v1') return { ok: false, message: 'Invalid submission mode' };
    if (b.geoConsent !== true) return { ok: false, message: 'Location/data consent is required' };

    const allergySelect = typeof b.allergySelect === 'string' ? b.allergySelect.trim() : '';
    const allergyDetail = typeof b.allergyDetail === 'string' ? b.allergyDetail.trim() : '';
    const skinSelect = typeof b.skinSelect === 'string' ? b.skinSelect.trim() : '';
    const skinDetail = typeof b.skinDetail === 'string' ? b.skinDetail.trim() : '';
    if (!allergySelect) return { ok: false, message: 'Allergy selection is required' };
    if (!skinSelect) return { ok: false, message: 'Skin condition selection is required' };
    if (needsAllergyDetail(allergySelect) && !allergyDetail) return { ok: false, message: 'Allergy details are required' };
    if (needsSkinDetail(skinSelect) && !skinDetail) return { ok: false, message: 'Skin details are required' };

    const photoValue = typeof b.photoValue === 'string' ? b.photoValue.trim() : '';
    if (!photoValue) return { ok: false, message: 'Photo consent selection is required' };
    const isDenied = photoValue === 'No — consent denied';
    const photoRestrict = typeof b.photoRestrict === 'string' ? b.photoRestrict.trim() : '';
    if (isDenied && !photoRestrict) return { ok: false, message: 'Photo restrictions are required when consent is denied' };

    const initialsRaw = b.initials;
    if (!initialsRaw || typeof initialsRaw !== 'object') return { ok: false, message: 'Initials are required' };
    const ini = initialsRaw as Record<string, unknown>;
    const initials: Partial<Record<SpecialEventInitId, string>> = {};
    for (const id of requiredInitialIds) {
        const v = ini[id];
        if (typeof v !== 'string' || !v.trim()) {
            return { ok: false, message: `Initial missing: ${id}` };
        }
        initials[id] = v.trim().toUpperCase();
    }

    const printedName = typeof b.printedName === 'string' ? b.printedName.trim() : '';
    const clientSignDateDisplay = typeof b.clientSignDateDisplay === 'string' ? b.clientSignDateDisplay.trim() : '';
    if (!printedName) return { ok: false, message: 'Printed legal name is required' };
    if (!clientSignDateDisplay) return { ok: false, message: 'Signing date is required' };

    const signatureMethod = b.signatureMethod === 'type' ? 'type' : 'draw';
    const rawFace = b.signatureTypefaceId;
    let signatureTypefaceId: SignatureTypefaceId | undefined;
    if (signatureMethod === 'type') {
        if (typeof rawFace !== 'string' || !SIGNATURE_TYPEFACE_IDS.includes(rawFace as SignatureTypefaceId)) {
            return { ok: false, message: 'Select a signature style for typed signatures' };
        }
        signatureTypefaceId = rawFace as SignatureTypefaceId;
    }

    const sig = typeof b.signaturePngBase64 === 'string' ? b.signaturePngBase64.trim() : '';
    const signatureBase64 = sig.includes(',') ? sig.split(',').pop()!.trim() : sig;
    if (signatureBase64.length < 80) return { ok: false, message: 'A valid signature image is required' };

    const mergedInitials = mergeClientInitialsForPdf(initials, requiredInitialIds);
    for (const id of requiredInitialIds) {
        if (!mergedInitials[id]) {
            return { ok: false, message: `Initial missing: ${id}` };
        }
    }

    const data: ClientSpecialEventPayload = {
        allergySelect,
        allergyDetail,
        skinSelect,
        skinDetail,
        photoValue,
        photoRestrict: isDenied ? photoRestrict : '',
        geoConsent: true,
        initials: mergedInitials,
        printedName,
        clientSignDateDisplay,
        signatureMethod,
        signatureTypefaceId,
        signaturePngBase64: signatureBase64,
    };
    return { ok: true, data };
}

/** Services + travel/grand totals for wizard intro (matches contract math). */
export function computeSpecialEventPricing(admin: AdminContractPayload): {
    serviceLines: { description: string; priceDisplay: string; notes: string }[];
    subtotal: number;
    travelAmount: number;
    travelDisplay: string;
    grandTotal: number;
} {
    const serviceLines: { description: string; priceDisplay: string; notes: string }[] = [];
    let subtotal = 0;
    for (const row of admin.services) {
        const desc = row.description.trim();
        if (!desc) continue;
        const n = parseFloat(row.price) || 0;
        subtotal += n;
        const p = row.price.trim()
            ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '—';
        serviceLines.push({
            description: desc,
            priceDisplay: p,
            notes: row.notes.trim() || '—',
        });
    }
    const travelAmount = admin.travelEnabled ? parseFloat(admin.travelFee) || 0 : 0;
    const travelDisplay =
        travelAmount > 0
            ? `$${travelAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '—';
    const grandTotal = subtotal + travelAmount;
    return {
        serviceLines,
        subtotal,
        travelAmount,
        travelDisplay,
        grandTotal,
    };
}

export function validateAdminFinalizePayload(body: unknown):
    | { ok: true; data: AdminFinalizePayload }
    | { ok: false; message: string } {
    if (!body || typeof body !== 'object') return { ok: false, message: 'Invalid JSON body' };
    const b = body as Record<string, unknown>;
    if (b.retainerReceived !== true) return { ok: false, message: 'Retainer received must be confirmed' };
    const adminPrintedName = typeof b.adminPrintedName === 'string' ? b.adminPrintedName.trim() : '';
    const adminSignDateDisplay = typeof b.adminSignDateDisplay === 'string' ? b.adminSignDateDisplay.trim() : '';
    if (!adminPrintedName) return { ok: false, message: 'Printed name is required' };
    if (!adminSignDateDisplay) return { ok: false, message: 'Date is required' };
    const sig = typeof b.signaturePngBase64 === 'string' ? b.signaturePngBase64.trim() : '';
    const signatureBase64 = sig.includes(',') ? sig.split(',').pop()!.trim() : sig;
    if (signatureBase64.length < 80) return { ok: false, message: 'Studio signature image is required' };
    return {
        ok: true,
        data: {
            retainerReceived: true,
            adminPrintedName,
            adminSignDateDisplay,
            signaturePngBase64: signatureBase64,
        },
    };
}
