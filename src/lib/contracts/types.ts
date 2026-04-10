/** Stored on the invite after completion (no signature bytes). */
export type StoredContractFormData = {
    confirmRead: boolean;
    allergies: string;
    skinCond: string;
    medications: string;
    photoConsent: 'Yes' | 'No';
    photoRestrict: string | null;
    hasMinor: boolean;
    minorNames: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    initials: {
        norefund: string;
        payment: string;
        cancel: string;
        allergy: string;
        photo: string;
        liability: string;
        entire: string;
        minors?: string;
    };
    fullName: string;
    signDate: string;
    finalAgree: boolean;
};

export type ContractSubmitBody = StoredContractFormData & {
    signaturePngBase64: string;
};
