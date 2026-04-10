import type { ContractSubmitBody, StoredContractFormData } from './types';

function isNonEmptyString(v: unknown): v is string {
    return typeof v === 'string' && v.trim().length > 0;
}

function parseInitials(v: unknown): Record<string, string> | null {
    if (!v || typeof v !== 'object') return null;
    const o = v as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const key of ['norefund', 'payment', 'cancel', 'allergy', 'photo', 'liability', 'entire', 'minors']) {
        const val = o[key];
        if (typeof val === 'string') out[key] = val.trim().toUpperCase();
    }
    return out;
}

/** Validates client POST body; returns normalized stored payload + raw base64 signature (no data URL prefix). */
export function validateContractSubmit(body: unknown):
    | { ok: true; stored: StoredContractFormData; signatureBase64: string }
    | { ok: false; message: string } {
    if (!body || typeof body !== 'object') {
        return { ok: false, message: 'Invalid JSON body' };
    }
    const b = body as Record<string, unknown>;

    if (b.confirmRead !== true) {
        return { ok: false, message: 'You must confirm you have read the contract summary.' };
    }
    if (b.finalAgree !== true) {
        return { ok: false, message: 'You must agree to the final terms.' };
    }

    if (!isNonEmptyString(b.allergies)) {
        return { ok: false, message: 'Allergies / sensitivities are required.' };
    }
    if (!isNonEmptyString(b.skinCond)) {
        return { ok: false, message: 'Skin conditions are required.' };
    }

    const photoConsent = b.photoConsent;
    if (photoConsent !== 'Yes' && photoConsent !== 'No') {
        return { ok: false, message: 'Photo consent selection is required.' };
    }
    let photoRestrict: string | null = null;
    if (photoConsent === 'No') {
        if (!isNonEmptyString(b.photoRestrict)) {
            return { ok: false, message: 'Please describe photo restrictions.' };
        }
        photoRestrict = (b.photoRestrict as string).trim();
    }

    const hasMinor = b.hasMinor === true;
    let minorNames: string | null = null;
    let guardianName: string | null = null;
    let guardianPhone: string | null = null;
    if (hasMinor) {
        if (!isNonEmptyString(b.minorNames)) {
            return { ok: false, message: 'Minor name(s) and age(s) are required.' };
        }
        if (!isNonEmptyString(b.guardianName)) {
            return { ok: false, message: 'Guardian name and relationship are required.' };
        }
        if (!isNonEmptyString(b.guardianPhone)) {
            return { ok: false, message: 'Guardian phone is required.' };
        }
        minorNames = (b.minorNames as string).trim();
        guardianName = (b.guardianName as string).trim();
        guardianPhone = (b.guardianPhone as string).trim();
    }

    const initialsRaw = parseInitials(b.initials);
    if (!initialsRaw) {
        return { ok: false, message: 'Initials are required.' };
    }

    const need = ['norefund', 'payment', 'cancel', 'allergy', 'photo', 'liability', 'entire'] as const;
    for (const k of need) {
        if (!initialsRaw[k] || initialsRaw[k].length < 1) {
            return { ok: false, message: `Initials for section (${k}) are required.` };
        }
    }
    if (hasMinor) {
        if (!initialsRaw.minors || initialsRaw.minors.length < 1) {
            return { ok: false, message: 'Guardian initials are required for minors.' };
        }
    }

    if (!isNonEmptyString(b.fullName)) {
        return { ok: false, message: 'Full legal name is required.' };
    }
    if (!isNonEmptyString(b.signDate)) {
        return { ok: false, message: 'Date is required.' };
    }

    const sig = b.signaturePngBase64;
    if (typeof sig !== 'string' || sig.length < 100) {
        return { ok: false, message: 'A drawn signature is required.' };
    }
    const signatureBase64 = sig.includes(',') ? sig.split(',').pop()!.trim() : sig.trim();
    if (signatureBase64.length < 80) {
        return { ok: false, message: 'Invalid signature data.' };
    }

    const medications =
        typeof b.medications === 'string' ? b.medications.trim() : '';

    const stored: StoredContractFormData = {
        confirmRead: true,
        allergies: (b.allergies as string).trim(),
        skinCond: (b.skinCond as string).trim(),
        medications,
        photoConsent,
        photoRestrict,
        hasMinor,
        minorNames,
        guardianName,
        guardianPhone,
        initials: {
            norefund: initialsRaw.norefund,
            payment: initialsRaw.payment,
            cancel: initialsRaw.cancel,
            allergy: initialsRaw.allergy,
            photo: initialsRaw.photo,
            liability: initialsRaw.liability,
            entire: initialsRaw.entire,
            ...(hasMinor && initialsRaw.minors ? { minors: initialsRaw.minors } : {}),
        },
        fullName: (b.fullName as string).trim(),
        signDate: (b.signDate as string).trim(),
        finalAgree: true,
    };

    return { ok: true, stored, signatureBase64 };
}
