/**
 * Initials required by the special-events HTML template (must match special-events-v1.html INIT_IDS).
 * Order is preserved for UX parity with the printed contract.
 */
export const SPECIAL_EVENT_INIT_IDS = [
    'init_refunds',
    'init_pp',
    'init_travel',
    'init_headcount',
    'init_sameday',
    'init_cancel',
    'init_reschedule',
    'init_prep',
    'init_late',
    'init_overtime',
    'init_allergy',
    'init_photo',
    'init_artistrights',
    'init_comms',
    'init_subartist',
    'init_trial',
    'init_minor',
    'init_forcemajeure',
    'init_dispute',
    'init_liability',
    'init_entire',
    'init_expiration',
] as const;

export type SpecialEventInitId = (typeof SPECIAL_EVENT_INIT_IDS)[number];

/** Initials tied to optional admin features (waived when feature off). */
export const INIT_ID_PAYMENT_PLAN = 'init_pp' as const satisfies SpecialEventInitId;
export const INIT_ID_TRAVEL = 'init_travel' as const satisfies SpecialEventInitId;
export const INIT_ID_TRIAL = 'init_trial' as const satisfies SpecialEventInitId;
