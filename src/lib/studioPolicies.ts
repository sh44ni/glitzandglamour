/**
 * Studio policy facts for Kitty (chat prompt + tools).
 * Mirrors the Studio Policies page (src/app/policy/page.tsx), which is the source of truth and is never edited here.
 * tools/check-faq-policy.mjs verifies these numbers still match the policy page and the FAQs.
 */
export const POLICY_FACTS = [
  'Walk-ins are not available at this time; every service is by appointment.',
  'PAYMENT: Cash, Cash App, and Apple Pay accepted. No refunds once the service is completed. NEVER say we accept credit/debit cards, Venmo, Zelle, or checks.',
  'RETAINER: a retainer is required to secure an appointment. It is non-refundable but is applied toward the total service amount. Jojo confirms the amount when booking. Never quote a dollar amount for the retainer.',
  'NAIL SERVICES: cancellations/reschedules need 24-hour notice to transfer the retainer. No-shows forfeit the retainer and may have to prepay in full for future bookings. Late: 10-minute grace period, then a $10 late fee; beyond 15 minutes the appointment may be canceled. Fixes must be requested within 48 hours; fixes due to personal nail care or accidents have a fee.',
  'HAIRSTYLING & MAKEUP (use these terms for hair services and special-event glam; say they are the hair and makeup terms): non-refundable retainer; the remaining balance is due on the day of service. Cancellations must be made at least 48 hours in advance to transfer the retainer to a future appointment; last-minute cancellations or no-shows forfeit it. Late: 10-minute grace period, then a $15 late fee; beyond 20 minutes the appointment may be canceled. Prep: arrive with clean, dry hair and a makeup-free face; a prep fee may apply if additional work is needed. Mobile services are based in Oceanside; travel fees may apply outside the area.',
  'LASHES: arrive with completely clean lashes (no mascara, eyeliner, or oils); a $15 makeup removal fee applies if deep cleaning is needed. At least 40% of extensions must remain to count as a fill, otherwise it is charged as a new full set. 48-hour grace period for complimentary fixes of application issues (not poor aftercare); fixes after 48 hours have a fee. Do not wet lashes for 24 hours; avoid oil-based products near the eyes. Lashes are NOT on our online price menu: never quote lash prices or promise lash availability; send lash questions to Jojo.',
  'WAXING: hair must be at least 1/4 inch long (about a grain of rice); do not trim beforehand. We cannot wax clients using Accutane, Retin-A, or other thinning medications; ask them to tell us about prescription skincare. For 24 hours after waxing avoid sun, tight clothing, heavy exercise, saunas, and hot baths.',
  'FACIALS: arrive with a clean face if possible; stop retinoids, AHAs, and BHAs and avoid excessive sun 3-5 days before; certain peels are not possible on Accutane. For 24-48 hours after avoid direct sun, saunas, and strenuous exercise; wear SPF daily.',
  'GENERAL: no-shows may be charged and blocked from future bookings. We may refuse service for inappropriate behavior or safety concerns. Results may vary and are not guaranteed. Photo/video consent is optional and never affects services.',
  'NOT ON FILE: facials, waxing, and lashes have no separate cancellation, late-arrival, or payment terms in our policies. For those, say you do not have the exact terms and send the client to Jojo at (760) 290-5910.',
  'STUDIO: free on-site parking is available in front of the building. Jojo is a licensed professional.',
];

export function policyPromptBlock(): string {
  return ['• STUDIO POLICIES (quote exactly; if the client does not say which service, ask, then give only that service\'s terms):', ...POLICY_FACTS.map((f) => `  - ${f}`)].join('\n');
}

/** Compact version for the get_business_info tool result. */
export const POLICY_TOOL_SUMMARY = POLICY_FACTS.join(' ');
