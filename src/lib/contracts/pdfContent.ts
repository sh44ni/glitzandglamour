/**
 * Static legal copy for the signed PDF (matches the client-facing summary / agreement scope).
 */

export const STUDIO_BLOCK = [
    'Glitz & Glamour Studio',
    'Beauty & Event Services — Vista, CA',
    'Web: glitzandglamours.com',
    'Instagram: @glitzandglamourstudio',
    'Phone: (760) 290-5910',
    'Email: info@glitzandglamours.com',
];

export const DOCUMENT_INTRO = [
    'This document is a Client Acknowledgment and Electronic Signature Certificate for the Glitz & Glamour Studio Beauty & Event Services Agreement (the "Agreement").',
    'By signing electronically, the Client confirms they have reviewed the contract summary presented at signing, completed all required disclosures and initials, and agree to be bound by all twenty-four (24) sections of the full Agreement on file with the Studio.',
    'A copy of this executed acknowledgment is retained by the Studio together with the data fields and signature image captured at submission. The Client should retain their reference number for their records.',
];

export const SUMMARY_SECTIONS: { id: string; title: string; clauses: string[] }[] = [
    {
        id: '08',
        title: 'Cancellation policy',
        clauses: [
            'All retainers are non-refundable.',
            'More than twenty-one (21) days prior to the scheduled service — loss of retainer only.',
            'Between fourteen (14) and twenty-one (21) days prior — loss of retainer plus fifty percent (50%) of the remaining balance.',
            'Less than fourteen (14) days prior — one hundred percent (100%) of the total service amount is owed.',
            'No-shows will be charged the full contract amount.',
            'Cancellation must be submitted in writing via text or email to (760) 290-5910 or info@glitzandglamours.com.',
        ],
    },
    {
        id: '04',
        title: 'No refunds policy',
        clauses: [
            'All services are final. No refunds will be issued once services have been completed. Any concerns must be addressed during the service so adjustments may be made at that time.',
        ],
    },
    {
        id: '10',
        title: 'Late arrival',
        clauses: [
            'Client lateness of thirty (30) or more minutes will result in cancellation of services. The full contract amount remains owed and no refund will be issued.',
        ],
    },
    {
        id: '09',
        title: 'Client preparation',
        clauses: [
            'Hair clients must arrive with clean, dry hair. Makeup clients must arrive with a clean, makeup-free face. Failure to arrive prepared may result in a preparation fee per person.',
        ],
    },
    {
        id: '20',
        title: 'Limitation of liability',
        clauses: [
            "The maximum liability of Glitz & Glamour Studio shall not exceed the total amount paid by the Client for the specific services at issue.",
            'Dissatisfaction with aesthetic results alone does not constitute grounds for a refund or legal claim beyond the amount paid for the applicable services.',
        ],
    },
    {
        id: '22',
        title: 'Entire agreement',
        clauses: [
            'This Agreement supersedes all prior conversations, promises, or understandings — written or verbal — made before signing. Instagram direct messages and verbal agreements are not binding unless incorporated in a signed writing.',
        ],
    },
];

export const INITIAL_CERTIFICATIONS: { section: string; label: string; summary: string }[] = [
    {
        section: '04',
        label: 'No refunds policy',
        summary: 'Services are final once completed; concerns during service.',
    },
    {
        section: '05',
        label: 'Payment plan terms',
        summary: 'Payments forfeited on cancellation or missed installments; $25 late fee after 3 days overdue.',
    },
    {
        section: '08',
        label: 'Cancellation policy',
        summary: 'Tiers (21+ / 14–21 / under 14 / no-show); retainers non-refundable; written cancellation.',
    },
    {
        section: '11',
        label: 'Allergy & skin disclosure',
        summary: 'Information accurate and complete; no liability for undisclosed conditions.',
    },
    {
        section: '12',
        label: 'Photo & social media release',
        summary: 'Consent decision made knowingly under California likeness rights.',
    },
    {
        section: '17',
        label: 'Minors policy',
        summary: 'Guardian authority and responsibility when minors receive services.',
    },
    {
        section: '20',
        label: 'Limitation of liability',
        summary: 'Liability cap; subjective outcomes.',
    },
    {
        section: '22',
        label: 'Entire agreement',
        summary: 'Supersedes prior communications.',
    },
];

export const ESIGN_ATTESTATION = [
    'The Client acknowledges that their electronic signature, initials, and checkbox confirmations submitted through the Studio’s secure signing link constitute the Client’s legal signature under the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and applicable California law.',
    'The Client confirms they are the individual named below (or the authorized guardian signing on behalf of a minor listed in this document) and that all information provided is true and complete to the best of their knowledge.',
];
