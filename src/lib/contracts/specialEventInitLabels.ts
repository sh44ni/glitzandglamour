import type { SpecialEventInitId } from './specialEventConstants';

/** Short labels for initials step (aligned with contract sections). */
export const SPECIAL_EVENT_INIT_LABELS: Record<SpecialEventInitId, string> = {
    init_refunds: 'No-refunds / liquidated damages (Sec. 04)',
    init_pp: 'Payment plan terms (Sec. 05)',
    init_travel: 'Travel, parking & access fees (Sec. 03)',
    init_headcount: 'Minimum booking & headcount lock-in (Sec. 06)',
    init_sameday: 'Same-day booking surcharge (Sec. 07)',
    init_cancel: 'Cancellation policy (Sec. 09)',
    init_reschedule: 'Rescheduling policy (Sec. 10)',
    init_prep: 'Client preparation requirements (Sec. 11)',
    init_late: 'Late arrival policy (Sec. 12)',
    init_overtime: 'Overtime & delay fees (Sec. 13)',
    init_allergy: 'Liability & allergy disclosure (Sec. 14)',
    init_photo: 'Photo & social media release (Sec. 15)',
    init_artistrights: 'Artist creative rights (Sec. 16)',
    init_comms: 'Communication policy (Sec. 17)',
    init_subartist: 'Additional licensed artist / assistant (Sec. 18)',
    init_trial: 'Trial run policy (Sec. 19)',
    init_minor: 'Minors & guardians (Sec. 20)',
    init_forcemajeure: 'Force majeure & emergencies (Sec. 21)',
    init_dispute: 'Dispute resolution (Sec. 23)',
    init_liability: 'Limitation of liability (Sec. 24)',
    init_entire: 'Entire agreement (Sec. 27)',
    init_expiration: 'Contract expiration (Sec. 28)',
};
