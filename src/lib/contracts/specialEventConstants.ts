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
    'init_trial',
    'init_minor',
    'init_forcemajeure',
    'init_dispute',
    'init_liability',
    'init_entire',
    'init_expiration',
] as const;

export type SpecialEventInitId = (typeof SPECIAL_EVENT_INIT_IDS)[number];
