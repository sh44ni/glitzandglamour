import type { SpecialEventInitId } from './specialEventConstants';

/** One step in the client signing wizard. */
export type ContractStep = {
    stepTitle: string;
    sectionNumbers: string[];   // e.g. ['01','02']
    requiredInitialIds: SpecialEventInitId[];
    hasClientInput?: 'allergy' | 'photo';
};

/**
 * Client-side wizard step definitions.
 * Each step groups one or more contract sections with their required initials.
 * Steps without requiredInitialIds are read-only (no tap-to-initial needed).
 */
export const CONTRACT_STEPS: ContractStep[] = [
    // Step 0: Overview (handled specially by wizard)
    { stepTitle: 'Overview', sectionNumbers: [], requiredInitialIds: [] },
    // Step 1
    { stepTitle: 'Client & Services', sectionNumbers: ['01', '02'], requiredInitialIds: ['init_exclusions'] },
    // Step 2
    { stepTitle: 'In-Studio Arrival', sectionNumbers: ['03'], requiredInitialIds: ['init_travel'] },
    // Step 3
    { stepTitle: 'Payment Terms', sectionNumbers: ['04', '05'], requiredInitialIds: ['init_refunds', 'init_pp'] },
    // Step 4
    { stepTitle: 'Minimum Booking', sectionNumbers: ['06'], requiredInitialIds: ['init_headcount'] },
    // Step 5
    { stepTitle: 'Same-Day Add-Ons', sectionNumbers: ['07'], requiredInitialIds: ['init_sameday'] },
    // Step 6
    { stepTitle: 'Gratuity', sectionNumbers: ['08'], requiredInitialIds: [] },
    // Step 7
    { stepTitle: 'Cancellation', sectionNumbers: ['09'], requiredInitialIds: ['init_cancel'] },
    // Step 8
    { stepTitle: 'Rescheduling', sectionNumbers: ['10'], requiredInitialIds: ['init_reschedule'] },
    // Step 9
    { stepTitle: 'Service Timeline', sectionNumbers: ['11'], requiredInitialIds: ['init_prep'] },
    // Step 10
    { stepTitle: 'Late Arrival', sectionNumbers: ['12'], requiredInitialIds: ['init_late'] },
    // Step 11
    { stepTitle: 'Overtime & Delay', sectionNumbers: ['13'], requiredInitialIds: ['init_overtime'] },
    // Step 12
    { stepTitle: 'Allergy & Skin', sectionNumbers: ['14'], requiredInitialIds: ['init_allergy'], hasClientInput: 'allergy' },
    // Step 13
    { stepTitle: 'Photo Release', sectionNumbers: ['15'], requiredInitialIds: ['init_photo'], hasClientInput: 'photo' },
    // Step 14
    { stepTitle: 'Artist Rights', sectionNumbers: ['16'], requiredInitialIds: ['init_artistrights'] },
    // Step 15
    { stepTitle: 'Communication', sectionNumbers: ['17'], requiredInitialIds: ['init_comms'] },
    // Step 16
    { stepTitle: 'Additional Artist', sectionNumbers: ['18'], requiredInitialIds: ['init_subartist'] },
    // Step 17
    { stepTitle: 'Trial Run', sectionNumbers: ['19'], requiredInitialIds: ['init_trial'] },
    // Step 18
    { stepTitle: 'Minors Policy', sectionNumbers: ['20'], requiredInitialIds: ['init_minor'] },
    // Step 19
    { stepTitle: 'Force Majeure', sectionNumbers: ['21'], requiredInitialIds: ['init_forcemajeure'] },
    // Step 20
    { stepTitle: 'Contractor & Conduct', sectionNumbers: ['22', '23'], requiredInitialIds: [] },
    // Step 21
    { stepTitle: 'Dispute Resolution', sectionNumbers: ['24'], requiredInitialIds: ['init_dispute'] },
    // Step 22
    { stepTitle: 'Liability', sectionNumbers: ['25'], requiredInitialIds: ['init_liability'] },
    // Step 23
    { stepTitle: 'Law & Severability', sectionNumbers: ['26', '27'], requiredInitialIds: [] },
    // Step 24
    { stepTitle: 'Entire Agreement', sectionNumbers: ['28'], requiredInitialIds: ['init_entire'] },
    // Step 25
    { stepTitle: 'Contract Formation', sectionNumbers: ['29'], requiredInitialIds: ['init_expiration'] },
    // Step 26
    { stepTitle: 'Data & Privacy', sectionNumbers: ['30'], requiredInitialIds: [] },
    // Step 27: Signature (handled specially by wizard)
    { stepTitle: 'Sign Agreement', sectionNumbers: ['31'], requiredInitialIds: [] },
    // Step 28: Review & Submit (handled specially by wizard)
    { stepTitle: 'Review & Submit', sectionNumbers: [], requiredInitialIds: [] },
];
