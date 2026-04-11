import { SPECIAL_EVENT_INIT_IDS, type SpecialEventInitId } from './specialEventConstants';

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
    /** Studio-only; not rendered on the client-facing contract */
    internalNotes?: string;
};

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

export function validateAdminContractPayload(body: unknown): { ok: true; data: AdminContractPayload } | { ok: false; message: string } {
    if (!body || typeof body !== 'object') return { ok: false, message: 'Invalid payload' };
    const b = body as Record<string, unknown>;
    const services = b.services;
    if (!Array.isArray(services) || !services.every(isServiceLine)) {
        return { ok: false, message: 'Services must be an array of { description, price, notes }' };
    }
    const need = [
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
        'travelRequired',
        'travelFee',
        'travelDest',
        'miles',
        'retainer',
        'balance',
        'ppActive',
        'pp2Amt',
        'pp2Date',
        'pp3Amt',
        'pp3Date',
        'ppFinal',
        'minSvc',
        'lockDays',
        'addonFee',
        'prepFee',
        'overtimeRate',
        'trialFee',
        'minors',
        'guardian',
        'guardianPhone',
    ] as const;
    for (const k of need) {
        if (!nonEmpty(b[k])) return { ok: false, message: `Missing or empty field: ${k}` };
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
        travelRequired: String(b.travelRequired).trim(),
        travelFee: String(b.travelFee).trim(),
        travelDest: String(b.travelDest).trim(),
        miles: String(b.miles).trim(),
        retainer: String(b.retainer).trim(),
        balance: String(b.balance).trim(),
        ppActive: String(b.ppActive).trim(),
        pp2Amt: String(b.pp2Amt).trim(),
        pp2Date: String(b.pp2Date).trim(),
        pp3Amt: String(b.pp3Amt).trim(),
        pp3Date: String(b.pp3Date).trim(),
        ppFinal: String(b.ppFinal).trim(),
        minSvc: String(b.minSvc).trim(),
        lockDays: String(b.lockDays).trim(),
        addonFee: String(b.addonFee).trim(),
        prepFee: String(b.prepFee).trim(),
        overtimeRate: String(b.overtimeRate).trim(),
        trialFee: String(b.trialFee).trim(),
        minors: String(b.minors).trim(),
        guardian: String(b.guardian).trim(),
        guardianPhone: String(b.guardianPhone).trim(),
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

export function validateClientSpecialEventPayload(body: unknown):
    | { ok: true; data: ClientSpecialEventPayload }
    | { ok: false; message: string } {
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
    const initials: Record<string, string> = {};
    for (const id of SPECIAL_EVENT_INIT_IDS) {
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
    const sig = typeof b.signaturePngBase64 === 'string' ? b.signaturePngBase64.trim() : '';
    const signatureBase64 = sig.includes(',') ? sig.split(',').pop()!.trim() : sig;
    if (signatureBase64.length < 80) return { ok: false, message: 'A valid signature image is required' };

    const data: ClientSpecialEventPayload = {
        allergySelect,
        allergyDetail,
        skinSelect,
        skinDetail,
        photoValue,
        photoRestrict: isDenied ? photoRestrict : '',
        geoConsent: true,
        initials: initials as ClientSpecialEventPayload['initials'],
        printedName,
        clientSignDateDisplay,
        signatureMethod,
        signaturePngBase64: signatureBase64,
    };
    return { ok: true, data };
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
