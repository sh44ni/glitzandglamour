'use client';

import Link from 'next/link';
import { ChevronLeft, Briefcase, CheckCircle, CreditCard, AlertTriangle, Shield, Laptop, Copy, FileText, Scale, RefreshCw, BookOpen, Camera } from 'lucide-react';

const TERMS = [
    {
        icon: <Briefcase size={18} color="#FFD166" />,
        sym: '◫',
        title: 'Services Covered',
        text: 'These Terms apply to regular website bookings for salon and beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar appointments. Separate event inquiries, bridal/event services, and Beauty Events Agreements are handled outside this booking flow and are not governed by these website booking terms.',
    },
    {
        icon: <CheckCircle size={18} color="#06D6A0" />,
        sym: '✓',
        title: 'Appointments & Availability',
        text: 'Appointments must be booked through approved booking methods and are subject to availability, confirmation, service suitability, and studio policies. Glitz & Glamour Studio reserves the right to decline, reschedule, or refuse service where necessary for safety, scheduling, sanitation, policy enforcement, or service suitability reasons.',
    },
    {
        icon: <CreditCard size={18} color="#118AB2" />,
        sym: '▭',
        title: 'Payments & Retainers',
        text: 'A retainer or prepayment may be required to secure certain appointments. Unless otherwise stated, retainers are non-refundable but may be applied toward the total service amount. Remaining balances are due at the time of service using approved payment methods.',
    },
    {
        icon: <AlertTriangle size={18} color="#FF6B6B" />,
        sym: '⚠',
        title: 'Cancellations, Rescheduling & No-Shows',
        text: 'Cancellation, rescheduling, late-arrival, and no-show consequences are governed by the Studio Policies in effect at the time of booking. Missed appointments, last-minute cancellations, or repeated policy violations may result in forfeited retainers, prepaid-service requirements, booking restrictions, or refusal of future appointments.',
    },
    {
        icon: <Scale size={18} color="#FF6B6B" />,
        sym: '⚖',
        title: 'Results Disclaimer',
        text: 'Beauty service results vary by client and are not guaranteed. Final outcomes may differ based on hair condition, nail condition, skin type, aftercare, home maintenance, product compatibility, pre-existing damage, prior chemical history, medications, sensitivities, and third-party work.',
    },
    {
        icon: <AlertTriangle size={18} color="#FF2D78" />,
        sym: '△',
        title: 'Limitation of Liability',
        text: 'To the fullest extent permitted by law, Glitz & Glamour Studio is not responsible for inherent service-related risks, disclosed risks, allergic reactions despite reasonable precautions, irritation, sensitivity, poor retention, breakage, or outcomes affected in whole or in part by inaccurate client disclosures, prior services, pre-existing conditions, third-party work, or failure to follow aftercare instructions.',
    },
    {
        icon: <Shield size={18} color="#06D6A0" />,
        sym: '◔',
        title: 'Client Responsibilities',
        text: 'By booking or receiving services, you agree to provide accurate and complete information, including allergies, sensitivities, medications, relevant medical or skin conditions, prior chemical history, previous services, and any other facts that could affect safety, suitability, or results. You also agree to follow all pre-service and aftercare instructions provided to you.',
    },
    {
        icon: <Camera size={18} color="#9D4EDD" />,
        sym: '◉',
        title: 'Photo / Video Notice',
        text: 'Glitz & Glamour Studio may photograph or record services, service results, or limited behind-the-scenes content. Separate consent will be requested before any identifiable client photo or video is taken or used for portfolio, website, social media, marketing, educational, or promotional purposes. Declining photo or video consent will not affect your ability to receive services.',
    },
    {
        icon: <Laptop size={18} color="#9D4EDD" />,
        sym: '⌘',
        title: 'Website Use',
        text: 'You agree not to misuse this website, interfere with its operation, attempt unauthorized access, submit false or misleading information, impersonate another person, or upload content you do not have permission to share. Inspiration photos uploaded during booking are for reference only and do not guarantee identical results.',
    },
    {
        icon: <Shield size={18} color="#06D6A0" />,
        sym: '⬒',
        title: 'Booking Metadata (IP & Geolocation)',
        text: 'When you submit or finalize a booking, Glitz & Glamour Studio may collect limited technical information such as your IP address, approximate geolocation (city/region/country), and device/browser information for fraud prevention, abuse prevention, security, operational reporting, and platform integrity. This information is not used for targeted advertising.',
    },
    {
        icon: <Copy size={18} color="#118AB2" />,
        sym: '⧉',
        title: 'Intellectual Property',
        text: 'All website content, branding, graphics, text, logos, designs, and other materials belonging to Glitz & Glamour Studio remain its property and may not be copied, reproduced, republished, or used without permission.',
    },
    {
        icon: <RefreshCw size={18} color="#FFD166" />,
        sym: '↻',
        title: 'Policy Updates',
        text: 'These Terms may be updated from time to time. The effective version is the one posted on the website at the time of booking. Continued use of the website or booking system after updates are posted constitutes acceptance of those updated terms.',
    },
    {
        icon: <Scale size={18} color="#FFD166" />,
        sym: '⚖',
        title: 'Governing Law',
        text: 'These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles, unless applicable law requires otherwise.',
    },
    {
        icon: <BookOpen size={18} color="#FF6BA8" />,
        sym: '▣',
        title: 'Contact',
        text: 'For questions about these Terms & Conditions or website bookings, contact Glitz & Glamour Studio using the contact information listed on the website.',
    },
];

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(121,40,202,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Link href="/policy" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: '#aaa', textDecoration: 'none', fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif', marginBottom: '24px', transition: 'color 0.2s',
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                        <ChevronLeft size={16} /> Studio Policies
                    </Link>

                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1 }}>
                        Terms &amp; <span className="text-gradient">Conditions</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '640px' }}>
                        These Terms govern regular website bookings with Glitz &amp; Glamour Studio for non-event services. They are intended for appointments such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar services booked through the website.
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last Updated: April 2026 · Glitz &amp; Glamour Studio
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', marginTop: '12px', maxWidth: '620px', lineHeight: 1.6, borderLeft: '2px solid rgba(255,45,120,0.3)', paddingLeft: '12px' }}>
                        By checking the acknowledgment box at booking, you confirm you have read and agree to the Studio Policies, Liability Waiver, Terms &amp; Conditions, and Privacy Policy applicable to regular website service bookings.
                    </p>
                </div>

                {/* Scope notice */}
                <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '15px', fontWeight: 500 }}>
                        By accessing this website and booking non-event services with Glitz &amp; Glamour Studio (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you agree to the following terms.
                    </p>
                </div>

                {/* Policy cards */}
                <div style={{ display: 'grid', gap: '14px' }}>
                    {TERMS.map(({ icon, sym, title, text }) => (
                        <PolicyCard key={title} icon={icon} sym={sym} title={title}>
                            <p>{text}</p>
                        </PolicyCard>
                    ))}
                </div>

                {/* Image Usage — kept as a detailed section */}
                <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} color="#FF2D78" />
                        </div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff' }}>Image Usage &amp; Release Policy</h2>
                    </div>
                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', gap: '16px', flexDirection: 'column' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '14px', fontStyle: 'italic' }}>Applies to all bookings made through this website.</p>
                        <div style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.6, display: 'grid', gap: '16px' }}>
                            {[
                                { n: '1', h: 'Grant of rights', b: 'By completing a booking, you grant Glitz & Glamour Studio a non-exclusive, royalty-free, worldwide license to use, reproduce, publish, and display photographs and images captured during your session for social media platforms, website and online portfolio, marketing and promotional materials, blog posts and newsletters, and contest or award submissions.' },
                                { n: '2', h: 'Restrictions', b: 'Glitz & Glamour Studio will not sell your images directly to third parties for commercial resale, use your images in a defamatory, obscene, or unlawful manner, or alter images in a way that misrepresents you.' },
                                { n: '3', h: 'Ownership & copyright', b: 'Glitz & Glamour Studio retains full copyright and ownership of all images taken during your session. Agreeing to these terms grants a usage license only — it does not transfer copyright to the client.' },
                                { n: '4', h: 'Photo credit', b: 'When images are published digitally, we request credit where feasible (e.g., "Photo by JoJany or Glitz & Glamour Studio"). Credit is appreciated but not legally required under this agreement.' },
                                { n: '5', h: 'Minors', b: 'If any subject is under 18 years of age, the parent or legal guardian completing the booking confirms they have legal authority to grant the rights described in this policy on behalf of the minor.' },
                                { n: '6', h: 'Withdrawal of consent', b: 'You may withdraw consent for future use of your images by submitting a written request to info@glitzandglamours.com. Previously published images cannot be retroactively removed from all platforms, but we will make reasonable efforts to comply with future use going forward.' },
                                { n: '7', h: 'Governing law', b: 'This policy is governed by the laws of California, United States. Any disputes shall be resolved in the courts of that jurisdiction.' },
                            ].map(({ n, h, b }) => (
                                <div key={n}>
                                    <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>{n}. {h}</h4>
                                    <p>{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer links */}
                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>More Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Explore our other policies and guidelines below.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <Link href="/faq"     className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>FAQ</Link>
                        <Link href="/policy"  className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Studio Policies</Link>
                        <Link href="/waiver"  className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Liability Waiver</Link>
                        <Link href="/privacy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PolicyCard({ icon, sym, title, children }: { icon: React.ReactNode; sym: string; title: string; children: React.ReactNode }) {
    return (
        <div className="glass" style={{ padding: '22px 24px', borderRadius: '16px', display: 'flex', gap: '16px', transition: 'transform 0.2s', cursor: 'default' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#FF2D78', fontWeight: 700, flexShrink: 0 }}>{sym}</span>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff' }}>{title}</h3>
                </div>
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.65 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
