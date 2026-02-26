import { Metadata } from 'next';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
    title: 'Policies',
    description: 'View our nail services, hairstyling, makeup, waxing, facial, and privacy policies at Glitz & Glamour Studio.',
};

const servicePolicies = [
    {
        title: 'Nail Services Policy',
        effectiveDate: 'March 9, 2025',
        sections: [
            {
                heading: 'Appointments',
                content: 'A deposit is required to secure your spot. Walk-ins are not available at this time.',
            },
            {
                heading: 'Cancellations & Rescheduling',
                content: '48-hour notice is required to transfer your deposit. No-shows forfeit the deposit and may be required to prepay in full for future bookings.',
            },
            {
                heading: 'Late Policy',
                content: 'A 10-minute grace period is allowed. After that, a $10 late fee applies. Beyond 15 minutes, your appointment may be canceled.',
            },
            {
                heading: 'Payment',
                content: 'Cash, Cash App, Venmo, and Zelle accepted. All services are non-refundable once completed. If you\'re not fully satisfied, I\'m happy to offer a fix, but refunds will not be issued.',
            },
            {
                heading: 'Fixes',
                content: 'Must be requested within 48 hours. Fixes due to personal nail care or accidents will have a fee.',
            },
        ],
    },
    {
        title: 'Hairstyling & Makeup Services Policy',
        effectiveDate: 'March 9, 2025',
        sections: [
            {
                heading: 'Location',
                content: 'Mobile services based in Oceanside. Travel fees may apply outside the area.',
            },
            {
                heading: 'Booking',
                content: 'A non-refundable deposit is required to secure your appointment. The remaining balance is due on the day of service.',
            },
            {
                heading: 'Cancellations',
                content: 'Must be made at least 48 hours in advance to transfer your deposit to a future appointment. Last-minute cancellations or no-shows will forfeit the deposit.',
            },
            {
                heading: 'Late Policy',
                content: 'A 10-minute grace period is allowed. After that, a $15 late fee applies. Beyond 20 minutes, your appointment may be canceled.',
            },
            {
                heading: 'Prep',
                content: 'Please arrive with clean, dry hair and a makeup-free face. A prep fee may apply if additional work is needed.',
            },
            {
                heading: 'Payment',
                content: 'Cash, Cash App, Venmo, and Zelle accepted. All services are non-refundable once completed. If you\'re not fully satisfied, I\'m happy to offer a fix, but refunds will not be issued.',
            },
        ],
    },
    {
        title: 'Wax & Facial Services Policy',
        effectiveDate: 'November 4, 2025',
        sections: [
            {
                heading: 'Standard Policies',
                content: 'Standard service policies apply. Please refer to the Nail Services Policy above for appointment, cancellation, late, and payment guidelines.',
            },
        ],
    },
];

const privacyPolicy = {
    title: 'Privacy Policy',
    effectiveDate: 'January 1, 2025',
    sections: [
        {
            heading: 'Information We Collect',
            content: 'When you book an appointment or contact us, we collect personal information including your name, email address, phone number, and any special requests or notes you provide.',
        },
        {
            heading: 'How We Use Information',
            content: 'We use your information to schedule and confirm appointments, communicate with you about your bookings, send appointment reminders, and respond to your inquiries. We do not sell or share your personal information with third parties for marketing purposes.',
        },
        {
            heading: 'Data Security',
            content: 'We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. All communication is handled securely, and we limit access to your information to only those who need it to provide our services.',
        },
        {
            heading: 'Your Rights',
            content: 'You have the right to request access to, correction of, or deletion of your personal information. To exercise these rights, please contact us using the information below.',
        },
        {
            heading: 'Contact for Privacy Questions',
            content: 'If you have any questions about our privacy practices, please contact us at glitzandglamour12@gmail.com or call (760) 290-5910.',
        },
    ],
};

const termsOfService = {
    title: 'Terms of Service',
    effectiveDate: 'January 1, 2025',
    sections: [
        {
            heading: 'Service Agreement',
            content: 'By booking an appointment with Glitz & Glamour Studio, you agree to these terms and our service policies outlined above.',
        },
        {
            heading: 'Liability',
            content: 'Glitz & Glamour Studio is not liable for any allergic reactions or adverse effects. Please inform us of any allergies or sensitivities before your appointment.',
        },
        {
            heading: 'Photos & Social Media',
            content: 'We may take photos of our work for portfolio and social media purposes. Please let us know if you do not wish to be photographed.',
        },
        {
            heading: 'Changes to Terms',
            content: 'We reserve the right to update these terms at any time. Continued use of our services constitutes acceptance of any changes.',
        },
    ],
};

export default function PolicyPage() {
    return (
        <div className="animate-fade-in bg-[#0A0A0A] min-h-screen">
            {/* Hero Section */}
            <section className="py-16 relative overflow-hidden">
                {/* Decorative bow */}
                <div className="absolute top-10 right-10 opacity-10">
                    <svg width="60" height="36" viewBox="0 0 40 24" fill="#FF1493">
                        <ellipse cx="10" cy="12" rx="10" ry="8" />
                        <ellipse cx="30" cy="12" rx="10" ry="8" />
                        <circle cx="20" cy="12" r="5" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Our </span>
                        <span className="text-[#FF1493]">Policies</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Please review our policies before booking your appointment
                    </p>
                </div>
            </section>

            {/* Policies Content */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        {/* Service Policies */}
                        {servicePolicies.map((policy, index) => (
                            <Card key={index} hover={false} padding="lg">
                                <div className="border-b border-gray-700 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        {policy.title}
                                    </h2>
                                    <p className="text-[#FF1493] text-sm mt-1">
                                        Effective: {policy.effectiveDate}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {policy.sections.map((section, sectionIndex) => (
                                        <div key={sectionIndex}>
                                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#FF1493] rounded-full" />
                                                {section.heading}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed pl-4">
                                                {section.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}

                        {/* Privacy Policy */}
                        <div id="privacy">
                            <Card hover={false} padding="lg">
                                <div className="border-b border-gray-700 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        {privacyPolicy.title}
                                    </h2>
                                    <p className="text-[#FF1493] text-sm mt-1">
                                        Effective: {privacyPolicy.effectiveDate}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {privacyPolicy.sections.map((section, sectionIndex) => (
                                        <div key={sectionIndex}>
                                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#FF1493] rounded-full" />
                                                {section.heading}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed pl-4">
                                                {section.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Terms of Service */}
                        <div id="terms">
                            <Card hover={false} padding="lg">
                                <div className="border-b border-gray-700 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        {termsOfService.title}
                                    </h2>
                                    <p className="text-[#FF1493] text-sm mt-1">
                                        Effective: {termsOfService.effectiveDate}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {termsOfService.sections.map((section, sectionIndex) => (
                                        <div key={sectionIndex}>
                                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#FF1493] rounded-full" />
                                                {section.heading}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed pl-4">
                                                {section.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="mt-12 p-6 bg-[#1A1A1A] rounded-2xl border border-[#FF1493]/20">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#FF1493] rounded-full p-2 flex-shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    Questions About Our Policies?
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    If you have any questions or concerns about our policies, please don&apos;t hesitate to
                                    <a href="/contact" className="text-[#FF1493] hover:underline ml-1">contact us</a>.
                                    We&apos;re happy to clarify anything before your appointment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#1A1A1A]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Book?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Now that you&apos;ve reviewed our policies, schedule your appointment today
                    </p>
                    <a
                        href="/book"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#FF1493] text-white font-medium rounded-full hover:bg-[#C71185] transition-colors shadow-lg hover:shadow-xl"
                    >
                        Book Appointment
                    </a>
                </div>
            </section>
        </div>
    );
}
