import { NextResponse } from 'next/server';

/**
 * GET /api/legal
 *
 * Returns the app's full Terms & Conditions, Privacy Policy,
 * Liability Waiver and general legal document set as structured JSON.
 *
 * To update any content: edit the LEGAL_DOCUMENT constant below,
 * commit, and deploy. The mobile app fetches this on every page open
 * so changes are reflected immediately without an app update.
 */

export const runtime = 'nodejs';
// Cache for 5 minutes on CDN, revalidate in background (stale-while-revalidate)
export const revalidate = 300;

// ── Document metadata ──────────────────────────────────────────────────────────
const LEGAL_DOCUMENT = {
  version: '1.3',
  effectiveDate: '2025-01-01',
  lastUpdated: '2026-06-26',
  businessName: 'Glitz & Glamour Beauty Salon',
  contactEmail: 'hello@glitzandglamours.com',
  jurisdiction: 'Ontario, Canada',

  // ── Sections ─────────────────────────────────────────────────────────────────
  // Each section has: id, title, icon (Ionicons name), and an array of clauses.
  // A clause has: id, heading (optional), body (plain text or markdown-lite).
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: 'checkmark-circle-outline',
      clauses: [
        {
          id: 'acceptance-1',
          heading: 'Agreement',
          body: 'By booking an appointment, using our mobile application, or accessing any of our services, you ("Client") agree to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.',
        },
        {
          id: 'acceptance-2',
          heading: 'Age Requirement',
          body: 'You must be at least 16 years of age to use our services. Clients under 18 must have written or in-person consent from a parent or legal guardian for certain services.',
        },
        {
          id: 'acceptance-3',
          heading: 'Updates to Terms',
          body: 'Glitz & Glamour reserves the right to update these Terms at any time. Continued use of our services after changes are posted constitutes your acceptance of the revised Terms.',
        },
      ],
    },
    {
      id: 'services',
      title: 'Services & Bookings',
      icon: 'calendar-outline',
      clauses: [
        {
          id: 'services-1',
          heading: 'Service Descriptions',
          body: 'Service descriptions, pricing, and durations are provided as a guide and are subject to change. Final pricing may vary based on the complexity of the service, hair length, or additional products required.',
        },
        {
          id: 'services-2',
          heading: 'Appointments',
          body: 'All appointments are subject to availability. Bookings made through the app are confirmed only upon receiving a confirmation notification. We reserve the right to reschedule or cancel appointments due to unforeseen circumstances.',
        },
        {
          id: 'services-3',
          heading: 'Cancellations & No-Shows',
          body: 'Cancellations made with less than 24 hours notice or failure to attend a booked appointment (no-show) may result in a cancellation fee or loss of deposit. Repeated no-shows may result in restricted booking privileges.',
        },
        {
          id: 'services-4',
          heading: 'Patch Tests',
          body: 'Certain chemical services (e.g. hair colour, perms, lash tints) require a patch test performed at least 48 hours prior to the appointment. Failure to complete a patch test when requested may result in refusal of service.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability & Waiver',
      icon: 'shield-outline',
      clauses: [
        {
          id: 'liability-1',
          heading: 'Limitation of Liability',
          body: 'To the maximum extent permitted by applicable law, Glitz & Glamour, its owners, employees, and contractors shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services, including but not limited to adverse reactions, allergic responses, or dissatisfaction with results.',
        },
        {
          id: 'liability-2',
          heading: 'Health Disclosures',
          body: 'You agree to disclose all relevant health conditions, allergies, medications, or sensitivities prior to receiving any service. Failure to disclose such information releases Glitz & Glamour from any responsibility for adverse reactions or outcomes.',
        },
        {
          id: 'liability-3',
          heading: 'Service Risk Acknowledgement',
          body: 'You acknowledge that certain beauty services carry inherent risks, including but not limited to skin irritation, hair breakage, or allergic reactions. You voluntarily assume these risks when booking and receiving services.',
        },
        {
          id: 'liability-4',
          heading: 'Personal Belongings',
          body: 'Glitz & Glamour is not responsible for loss, theft, or damage to personal belongings brought onto the premises.',
        },
        {
          id: 'liability-5',
          heading: 'Maximum Liability Cap',
          body: 'In the event that liability is established, Glitz & Glamour\'s total liability to you shall not exceed the amount paid for the specific service that gave rise to the claim.',
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      clauses: [
        {
          id: 'privacy-1',
          heading: 'Data We Collect',
          body: 'We collect personal information including your name, email address, phone number, date of birth, and booking history. This information is used to manage your account, process bookings, and communicate with you about your appointments and promotions.',
        },
        {
          id: 'privacy-2',
          heading: 'How We Use Your Data',
          body: 'Your data is used to: process and confirm appointments; operate the loyalty and rewards program; send appointment reminders and promotional offers (with your consent); and improve our app and services.',
        },
        {
          id: 'privacy-3',
          heading: 'Data Sharing',
          body: 'We do not sell or rent your personal information to third parties. We may share data with trusted service providers (e.g. payment processors, notification services) solely to operate our business, under strict confidentiality agreements.',
        },
        {
          id: 'privacy-4',
          heading: 'Push Notifications',
          body: 'With your consent, we may send push notifications for appointment reminders, offers, and loyalty rewards. You can withdraw consent at any time through your device notification settings.',
        },
        {
          id: 'privacy-5',
          heading: 'Data Retention',
          body: 'We retain your personal information for as long as your account is active or as required to provide services. You may request deletion of your account and associated data by contacting us.',
        },
        {
          id: 'privacy-6',
          heading: 'Your Rights',
          body: 'Under applicable privacy laws, you have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at hello@glitzandglamours.com.',
        },
        {
          id: 'privacy-7',
          heading: 'Cookies & Analytics',
          body: 'Our website and app may use analytics tools to understand usage patterns. No personally identifiable information is shared with analytics providers beyond anonymised usage data.',
        },
      ],
    },
    {
      id: 'loyalty',
      title: 'Loyalty & Rewards Program',
      icon: 'star-outline',
      clauses: [
        {
          id: 'loyalty-1',
          heading: 'Stamp Rewards',
          body: 'Stamps are awarded at the discretion of Glitz & Glamour staff. Stamps have no cash value and cannot be transferred or sold. Glitz & Glamour reserves the right to modify, suspend, or terminate the loyalty program at any time.',
        },
        {
          id: 'loyalty-2',
          heading: 'Birthday Spin',
          body: 'Eligible clients may receive a birthday spin reward during their birthday month. The reward is subject to availability and must be redeemed in-salon. The reward has no cash value and is non-transferable.',
        },
        {
          id: 'loyalty-3',
          heading: 'Reward Redemption',
          body: 'Rewards must be redeemed in-salon and cannot be combined with other offers unless explicitly stated. Glitz & Glamour reserves the right to adjust reward values and redemption conditions.',
        },
      ],
    },
    {
      id: 'conduct',
      title: 'Client Conduct',
      icon: 'people-outline',
      clauses: [
        {
          id: 'conduct-1',
          heading: 'Respect Policy',
          body: 'Clients are expected to treat all Glitz & Glamour staff with respect. We reserve the right to refuse or terminate service to any client who behaves in an abusive, threatening, or discriminatory manner.',
        },
        {
          id: 'conduct-2',
          heading: 'Photography',
          body: 'Glitz & Glamour may photograph finished services for marketing purposes. You may opt out by informing your stylist before the service. Client photography within the salon is permitted for personal use.',
        },
      ],
    },
    {
      id: 'governing',
      title: 'Governing Law',
      icon: 'business-outline',
      clauses: [
        {
          id: 'governing-1',
          heading: 'Jurisdiction',
          body: 'These Terms and Conditions are governed by and construed in accordance with the laws of Ontario, Canada. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Ontario.',
        },
        {
          id: 'governing-2',
          heading: 'Severability',
          body: 'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
        },
        {
          id: 'governing-3',
          heading: 'Contact',
          body: 'For questions about these Terms, please contact us at hello@glitzandglamours.com or visit us in-salon.',
        },
      ],
    },
  ],
};

export async function GET() {
  return NextResponse.json(LEGAL_DOCUMENT, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  });
}
