import { NextResponse } from 'next/server';

/**
 * GET /api/legal
 *
 * Returns the exact legal content from the website pages:
 *   /terms   → Terms & Conditions
 *   /waiver  → Liability Waiver
 *   /privacy → Privacy Policy + SMS Terms
 *
 * To update content: edit the source-of-truth pages on the website,
 * then mirror those changes here. The mobile app fetches this on
 * every Legal screen open so changes are reflected without an app update.
 */

export const runtime = 'nodejs';
export const revalidate = 300; // CDN cache 5 min

const LEGAL_DOCUMENT = {
  version: '2.0',
  effectiveDate: 'April 2026',
  lastUpdated: '2026-06-26',
  businessName: 'Glitz & Glamour Studio',
  contactEmail: 'info@glitzandglamours.com',
  jurisdiction: 'California, United States',

  sections: [
    // ─────────────────────────────────────────────────────────────────────────
    // TERMS & CONDITIONS  (source: /terms)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      intro: 'These Terms govern regular website bookings with Glitz & Glamour Studio for non-event services (nails, hair, waxing, lashes, brows, facials, pedicures, and similar appointments booked through the website). By accessing this website and booking services, you agree to the following terms.',
      clauses: [
        {
          id: 'terms-1',
          heading: 'Services Covered',
          body: 'These Terms apply to regular website bookings for salon and beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar appointments. Separate event inquiries, bridal/event services, and Beauty Events Agreements are handled outside this booking flow and are not governed by these website booking terms.',
        },
        {
          id: 'terms-2',
          heading: 'Appointments & Availability',
          body: 'Appointments must be booked through approved booking methods and are subject to availability, confirmation, service suitability, and studio policies. Glitz & Glamour Studio reserves the right to decline, reschedule, or refuse service where necessary for safety, scheduling, sanitation, policy enforcement, or service suitability reasons.',
        },
        {
          id: 'terms-3',
          heading: 'Payments & Retainers',
          body: 'A retainer or prepayment may be required to secure certain appointments. Unless otherwise stated, retainers are non-refundable but may be applied toward the total service amount. Remaining balances are due at the time of service using approved payment methods.',
        },
        {
          id: 'terms-4',
          heading: 'Cancellations, Rescheduling & No-Shows',
          body: 'Cancellation, rescheduling, late-arrival, and no-show consequences are governed by the Studio Policies in effect at the time of booking. Missed appointments, last-minute cancellations, or repeated policy violations may result in forfeited retainers, prepaid-service requirements, booking restrictions, or refusal of future appointments.',
        },
        {
          id: 'terms-5',
          heading: 'Results Disclaimer',
          body: 'Beauty service results vary by client and are not guaranteed. Final outcomes may differ based on hair condition, nail condition, skin type, aftercare, home maintenance, product compatibility, pre-existing damage, prior chemical history, medications, sensitivities, and third-party work.',
        },
        {
          id: 'terms-6',
          heading: 'Limitation of Liability',
          body: 'To the fullest extent permitted by law, Glitz & Glamour Studio is not responsible for inherent service-related risks, disclosed risks, allergic reactions despite reasonable precautions, irritation, sensitivity, poor retention, breakage, or outcomes affected in whole or in part by inaccurate client disclosures, prior services, pre-existing conditions, third-party work, or failure to follow aftercare instructions.',
        },
        {
          id: 'terms-7',
          heading: 'Client Responsibilities',
          body: 'By booking or receiving services, you agree to provide accurate and complete information, including allergies, sensitivities, medications, relevant medical or skin conditions, prior chemical history, previous services, and any other facts that could affect safety, suitability, or results. You also agree to follow all pre-service and aftercare instructions provided to you.',
        },
        {
          id: 'terms-8',
          heading: 'Photo / Video Notice',
          body: 'Glitz & Glamour Studio may photograph or record services, service results, or limited behind-the-scenes content. Separate consent will be requested before any identifiable client photo or video is taken or used for portfolio, website, social media, marketing, educational, or promotional purposes. Declining photo or video consent will not affect your ability to receive services.',
        },
        {
          id: 'terms-9',
          heading: 'Website Use',
          body: 'You agree not to misuse this website, interfere with its operation, attempt unauthorized access, submit false or misleading information, impersonate another person, or upload content you do not have permission to share. Inspiration photos uploaded during booking are for reference only and do not guarantee identical results.',
        },
        {
          id: 'terms-10',
          heading: 'Booking Metadata (IP & Geolocation)',
          body: 'When you submit or finalize a booking, Glitz & Glamour Studio may collect limited technical information such as your IP address, approximate geolocation (city/region/country), and device/browser information for fraud prevention, abuse prevention, security, operational reporting, and platform integrity. This information is not used for targeted advertising.',
        },
        {
          id: 'terms-11',
          heading: 'Intellectual Property',
          body: 'All website content, branding, graphics, text, logos, designs, and other materials belonging to Glitz & Glamour Studio remain its property and may not be copied, reproduced, republished, or used without permission.',
        },
        {
          id: 'terms-12',
          heading: 'Image Usage & Release Policy',
          body: 'By completing a booking, you grant Glitz & Glamour Studio a non-exclusive, royalty-free, worldwide license to use, reproduce, publish, and display photographs and images captured during your session for social media, website, marketing, and promotional materials. Glitz & Glamour Studio will not sell your images to third parties for commercial resale or use them in a defamatory manner. You may withdraw consent for future use by submitting a written request to info@glitzandglamours.com.',
        },
        {
          id: 'terms-13',
          heading: 'Policy Updates',
          body: 'These Terms may be updated from time to time. The effective version is the one posted on the website at the time of booking. Continued use of the website or booking system after updates are posted constitutes acceptance of those updated terms.',
        },
        {
          id: 'terms-14',
          heading: 'Governing Law',
          body: 'These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles, unless applicable law requires otherwise.',
        },
        {
          id: 'terms-15',
          heading: 'Contact',
          body: 'For questions about these Terms & Conditions or website bookings, contact Glitz & Glamour Studio using the contact information listed on the website.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LIABILITY WAIVER  (source: /waiver)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'waiver',
      title: 'Liability Waiver',
      icon: 'shield-outline',
      intro: 'This Liability Waiver applies to regular website bookings and in-studio or routine service appointments with Glitz & Glamour Studio for non-event beauty services. By proceeding with your appointment you acknowledge the inherent risks of beauty services, confirm your disclosure responsibilities, and agree to the following limitations.',
      clauses: [
        {
          id: 'waiver-1',
          heading: 'Inherent Risks',
          body: 'Beauty services involve inherent risks that may vary by service type and client condition. These risks can include irritation, redness, chemical exposure, allergic reaction, sensitivity, breakage, poor retention, lifting, staining, uneven processing, skin reaction, or unexpected service outcomes even when reasonable care is used.',
        },
        {
          id: 'waiver-2',
          heading: 'Client Disclosures',
          body: 'You agree to provide accurate and complete information before receiving services, including allergies, sensitivities, medications, prior chemical treatments, prior services, skin or scalp conditions, nail conditions, pregnancy-related concerns where relevant, lash or eye sensitivities, and any other information that could affect safety, suitability, or results.',
        },
        {
          id: 'waiver-3',
          heading: 'Client Confirmations',
          body: 'You confirm: (1) You have disclosed relevant allergies, sensitivities, medications, and conditions to the best of your knowledge. (2) You understand results vary and are not guaranteed. (3) You understand service longevity, retention, color result, lift, durability, or final outcome may vary based on individual factors. (4) You agree to follow all reasonable pre-service and aftercare instructions.',
        },
        {
          id: 'waiver-4',
          heading: 'No Guarantee of Results',
          body: 'Specific service results are not guaranteed. Outcomes may differ based on your natural hair, skin, lashes, nails, prior product use, prior chemical history, health factors, maintenance habits, aftercare compliance, product compatibility, and pre-existing conditions.',
        },
        {
          id: 'waiver-5',
          heading: 'Aftercare Responsibility',
          body: 'You are responsible for following the aftercare and maintenance instructions provided for your service. Glitz & Glamour Studio is not responsible for issues caused in whole or in part by failure to follow aftercare, product misuse, picking, moisture exposure, heat exposure, friction, improper home care, or outside work performed after your appointment.',
        },
        {
          id: 'waiver-6',
          heading: 'Pre-Existing Conditions & Prior Work',
          body: 'Glitz & Glamour Studio is not responsible for damage, breakage, irritation, retention problems, uneven results, lifting, shedding, peeling, or other complications caused in whole or in part by pre-existing weakness, prior services, prior chemical history, box dye, bleach history, third-party work, previous lash extensions, prior waxing sensitivity, damaged nails, or other pre-existing conditions.',
        },
        {
          id: 'waiver-7',
          heading: 'Release & Limitation of Liability',
          body: 'To the fullest extent permitted by law, you understand and accept the inherent risks associated with the services you request and release Glitz & Glamour Studio from claims arising from inherent service risks, disclosed service-related risks, allergic reactions despite reasonable precautions, pre-existing conditions, prior work, prior chemical history, inaccurate or incomplete client disclosures, or failure to follow aftercare or maintenance instructions.',
        },
        {
          id: 'waiver-8',
          heading: 'Photo / Video Notice',
          body: 'Glitz & Glamour Studio may photograph or record limited service-related content only when separate optional consent has been provided. Declining photo or video consent will not affect your ability to receive services.',
        },
        {
          id: 'waiver-9',
          heading: 'Voluntary Acceptance',
          body: 'By proceeding with your appointment, you voluntarily choose to receive services with knowledge that beauty services carry inherent and variable risks, and you accept responsibility for truthful disclosure, aftercare compliance, and service-related decisions made based on the information you provide.',
        },
        {
          id: 'waiver-10',
          heading: 'Contact',
          body: 'If you have questions about this Liability Waiver or whether a service is appropriate for you, contact Glitz & Glamour Studio before booking or before your appointment begins.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVACY POLICY  (source: /privacy)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      intro: 'Your privacy matters to us. This Privacy Policy explains what information Glitz & Glamour Studio collects for regular website service bookings, how that information is used, when it may be shared, and what rights you have regarding your personal information.',
      clauses: [
        {
          id: 'privacy-1',
          heading: 'Information We Collect',
          body: 'When you book an appointment or create an account with Glitz & Glamour Studio, we may collect your name, email address, phone number, appointment details, booking notes, inspiration photos you choose to upload, service history, loyalty activity, and limited technical information associated with your booking. Payment card details are not stored by the booking form when payment is handled separately or through third-party payment methods.',
        },
        {
          id: 'privacy-2',
          heading: 'How We Use Your Information',
          body: 'We use your information to manage bookings, send appointment confirmations and reminders, support SMS or email communications you requested, maintain service history and loyalty records, review notes and inspiration photos submitted for appointments, improve operational workflows, prevent fraud or abuse, and maintain the security and integrity of the platform.',
        },
        {
          id: 'privacy-3',
          heading: 'Information Sharing',
          body: 'We do not sell, rent, or share your personal information with third parties for their own advertising or marketing purposes. We may share limited information with trusted service providers that help operate the studio or booking system, such as email-delivery providers, SMS-delivery providers, hosting providers, or security/infrastructure vendors, but only to the extent reasonably necessary for them to provide services on our behalf.',
        },
        {
          id: 'privacy-4',
          heading: 'Data Security',
          body: 'We take reasonable administrative, technical, and organizational measures to protect personal information from unauthorized access, misuse, alteration, loss, or disclosure. However, no storage system, website, or transmission method can be guaranteed to be completely secure.',
        },
        {
          id: 'privacy-5',
          heading: 'How Long We Keep Data',
          body: 'We retain personal information for as long as reasonably necessary to operate the studio, maintain booking and account records, comply with legal or tax obligations, resolve disputes, enforce policies, preserve fraud-prevention records, and document communications or consent records associated with bookings.',
        },
        {
          id: 'privacy-6',
          heading: 'Cookies & Sessions',
          body: 'Our website may use session-based tools, cookies, or similar technologies to keep the booking flow functional, maintain security, prevent abuse, and improve reliability. These tools are used for operational purposes and not to provide unrelated third-party behavioral advertising through the booking process.',
        },
        {
          id: 'privacy-7',
          heading: 'IP Address & Approximate Geolocation',
          body: 'When you submit or finalize a booking, we may log limited technical information such as your IP address, approximate location (for example city, region, or country), and device/browser information. We use this information for fraud prevention, abuse prevention, security monitoring, operational reporting, and to help protect the studio, platform, and clients. This information is not used for targeted advertising.',
        },
        {
          id: 'privacy-8',
          heading: 'Your Rights',
          body: 'You may contact Glitz & Glamour Studio to request access to, correction of, or deletion of the personal information we hold about you, subject to legal obligations, record-retention needs, fraud-prevention needs, and other lawful exceptions. You may also request that we update account contact details or remove information where appropriate.',
        },
        {
          id: 'privacy-9',
          heading: 'Policy Updates',
          body: 'We may update this Privacy Policy from time to time. The effective version is the one posted on the website at the time of booking or website use. Continued use of the booking system after updates are posted constitutes acknowledgment of those updates.',
        },
        {
          id: 'privacy-10',
          heading: 'Contact',
          body: 'If you have questions about this Privacy Policy or how your information is handled, contact Glitz & Glamour Studio using the contact information listed on the website.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SMS TERMS  (source: /privacy — SMS section)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'sms',
      title: 'SMS / Text Messaging Terms',
      icon: 'chatbubble-outline',
      intro: 'Glitz & Glamour Studio may offer transactional SMS text messaging for appointment confirmations, reminders, scheduling updates, or related service communications.',
      clauses: [
        {
          id: 'sms-1',
          heading: 'Consent',
          body: 'By providing your phone number and opting into SMS communications through the booking flow or another approved method, you agree to receive transactional text messages related to your appointments. Consent to receive text messages is not required to book if another communication method is available.',
        },
        {
          id: 'sms-2',
          heading: 'Message Frequency',
          body: 'Message frequency varies based on your booking activity, appointment changes, and communication needs. You may receive recurring or one-time messages related to confirmation, reminders, follow-up, or scheduling updates.',
        },
        {
          id: 'sms-3',
          heading: 'Message and Data Rates',
          body: 'Message and data rates may apply depending on your wireless carrier or service plan. Glitz & Glamour Studio is not responsible for carrier charges or limitations.',
        },
        {
          id: 'sms-4',
          heading: 'How to Stop',
          body: 'You can opt out of SMS messages at any time by replying STOP to a message you receive from us, subject to any final confirmation message required to process the opt-out.',
        },
        {
          id: 'sms-5',
          heading: 'Help',
          body: 'For help with the text messaging program, reply HELP to a message you receive from us or contact Glitz & Glamour Studio using the contact information listed on the website.',
        },
        {
          id: 'sms-6',
          heading: 'SMS Privacy',
          body: 'Your phone number, SMS opt-in data, and related messaging records are used only to deliver the messages you requested and maintain communication records. They are not sold, rented, or shared for unrelated third-party marketing purposes.',
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
