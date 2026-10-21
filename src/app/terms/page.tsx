import React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    Briefcase,
    CheckCircle,
    CreditCard,
    AlertTriangle,
    Shield,
    Laptop,
    Copy,
    FileText,
    Scale,
    RefreshCw,
    BookOpen,
    Camera,
    ShieldCheck,
    Cookie,
    Trash2,
    MailX,
    MapPin,
    Phone,
    Mail,
} from 'lucide-react';

const POLICY_PILLS = [
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/terms', label: 'Terms & Conditions', active: true },
    { href: '/cookies', label: 'Cookie Policy', active: false },
    { href: '/data-deletion', label: 'Data Deletion', active: false },
    { href: '/unsubscribe', label: 'Unsubscribe', active: false },
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: false },
];

const TERMS = [
    {
        num: '01',
        icon: <Briefcase size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Services Covered',
        text: 'These Terms apply to regular website bookings for salon and beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar appointments. Separate event inquiries, bridal/event services, and Beauty Events Agreements are handled outside this booking flow and are not governed by these website booking terms.',
    },
    {
        num: '02',
        icon: <CheckCircle size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Appointments & Availability',
        text: 'Appointments must be booked through approved booking methods and are subject to availability, confirmation, service suitability, and studio policies. Glitz & Glamour Studio reserves the right to decline, reschedule, or refuse service where necessary for safety, scheduling, sanitation, policy enforcement, or service suitability reasons.',
    },
    {
        num: '03',
        icon: <CreditCard size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Payments & Retainers',
        text: 'A retainer or prepayment may be required to secure certain appointments. Unless otherwise stated, retainers are non-refundable but may be applied toward the total service amount. Remaining balances are due at the time of service using approved payment methods.',
    },
    {
        num: '04',
        icon: <AlertTriangle size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Cancellations, Rescheduling & No-Shows',
        text: 'Cancellation, rescheduling, late-arrival, and no-show consequences are governed by the Studio Policies in effect at the time of booking. Missed appointments, last-minute cancellations, or repeated policy violations may result in forfeited retainers, prepaid-service requirements, booking restrictions, or refusal of future appointments.',
    },
    {
        num: '05',
        icon: <Scale size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Results Disclaimer',
        text: 'Beauty service results vary by client and are not guaranteed. Final outcomes may differ based on hair condition, nail condition, skin type, aftercare, home maintenance, product compatibility, pre-existing damage, prior chemical history, medications, sensitivities, and third-party work.',
    },
    {
        num: '06',
        icon: <AlertTriangle size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Limitation of Liability',
        text: 'To the fullest extent permitted by law, Glitz & Glamour Studio is not responsible for inherent service-related risks, disclosed risks, allergic reactions despite reasonable precautions, irritation, sensitivity, poor retention, breakage, or outcomes affected in whole or in part by inaccurate client disclosures, prior services, pre-existing conditions, third-party work, or failure to follow aftercare instructions.',
    },
    {
        num: '07',
        icon: <Shield size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Client Responsibilities',
        text: 'By booking or receiving services, you agree to provide accurate and complete information, including allergies, sensitivities, medications, relevant medical or skin conditions, prior chemical history, previous services, and any other facts that could affect safety, suitability, or results. You also agree to follow all pre-service and aftercare instructions provided to you.',
    },
    {
        num: '08',
        icon: <Camera size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Photo / Video Notice',
        text: 'Glitz & Glamour Studio may photograph or record services, service results, or limited behind-the-scenes content. Separate consent will be requested before any identifiable client photo or video is taken or used for portfolio, website, social media, marketing, educational, or promotional purposes. Declining photo or video consent will not affect your ability to receive services.',
    },
    {
        num: '09',
        icon: <Laptop size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Website Use',
        text: 'You agree not to misuse this website, interfere with its operation, attempt unauthorized access, submit false or misleading information, impersonate another person, or upload content you do not have permission to share. Inspiration photos uploaded during booking are for reference only and do not guarantee identical results.',
    },
    {
        num: '10',
        icon: <Shield size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Booking Metadata (IP & Geolocation)',
        text: 'When you submit or finalize a booking, Glitz & Glamour Studio may collect limited technical information such as your IP address, approximate geolocation (city/region/country), and device/browser information for fraud prevention, abuse prevention, security, operational reporting, and platform integrity. This information is not used for targeted advertising.',
    },
    {
        num: '11',
        icon: <Copy size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Intellectual Property',
        text: 'All website content, branding, graphics, text, logos, designs, and other materials belonging to Glitz & Glamour Studio remain its property and may not be copied, reproduced, republished, or used without permission.',
    },
    {
        num: '12',
        icon: <RefreshCw size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Policy Updates',
        text: 'These Terms may be updated from time to time. The effective version is the one posted on the website at the time of booking. Continued use of the website or booking system after updates are posted constitutes acceptance of those updated terms.',
    },
    {
        num: '13',
        icon: <Scale size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Governing Law',
        text: 'These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles, unless applicable law requires otherwise.',
    },
    {
        num: '14',
        icon: <BookOpen size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Contact',
        text: 'For questions about these Terms & Conditions or website bookings, contact Glitz & Glamour Studio using the contact information listed on the website: info@glitzandglamours.com, (760) 290-5910, or 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078.',
    },
];

const IMAGE_CLAUSES = [
    {
        n: '1',
        h: 'Grant of rights',
        b: 'By completing a booking, you grant Glitz & Glamour Studio a non-exclusive, royalty-free, worldwide license to use, reproduce, publish, and display photographs and images captured during your session for social media platforms, website and online portfolio, marketing and promotional materials, blog posts and newsletters, and contest or award submissions.',
    },
    {
        n: '2',
        h: 'Restrictions',
        b: 'Glitz & Glamour Studio will not sell your images directly to third parties for commercial resale, use your images in a defamatory, obscene, or unlawful manner, or alter images in a way that misrepresents you.',
    },
    {
        n: '3',
        h: 'Ownership & copyright',
        b: 'Glitz & Glamour Studio retains full copyright and ownership of all images taken during your session. Agreeing to these terms grants a usage license only — it does not transfer copyright to the client.',
    },
    {
        n: '4',
        h: 'Photo credit',
        b: 'When images are published digitally, we request credit where feasible (e.g., "Photo by JoJany or Glitz & Glamour Studio"). Credit is appreciated but not legally required under this agreement.',
    },
    {
        n: '5',
        h: 'Minors',
        b: 'If any subject is under 18 years of age, the parent or legal guardian completing the booking confirms they have legal authority to grant the rights described in this policy on behalf of the minor.',
    },
    {
        n: '6',
        h: 'Withdrawal of consent',
        b: 'You may withdraw consent for future use of your images by submitting a written request to info@glitzandglamours.com. Previously published images cannot be retroactively removed from all platforms, but we will make reasonable efforts to comply with future use going forward.',
    },
    {
        n: '7',
        h: 'Governing law',
        b: 'This policy is governed by the laws of California, United States. Any disputes shall be resolved in the courts of that jurisdiction.',
    },
];

export default function TermsPage() {
    return (
        <div className="legal-editorial-page">
            <style>{`
                .legal-editorial-page {
                    min-height: 100vh;
                    padding: 36px 20px 120px;
                    position: relative;
                    z-index: 1;
                    font-family: 'Poppins', sans-serif;
                    color: #e2d6dc;
                    overflow-wrap: anywhere;
                }
                .legal-container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .legal-breadcrumb {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-size: 13px;
                    color: #dfd2d9;
                    margin-bottom: 24px;
                }
                .legal-breadcrumb a {
                    color: #dfd2d9;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .legal-breadcrumb a:hover {
                    color: #ff8ab8;
                }
                .legal-hero-card {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    padding: clamp(28px, 4vw, 44px);
                    margin-bottom: 28px;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.14);
                    overflow: hidden;
                }
                .legal-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #FF2D78 30%, #ff8ab8 50%, #E2C286 70%, transparent);
                    pointer-events: none;
                }
                .legal-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    color: #ff8ab8;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 18px;
                }
                .legal-h1 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(2.2rem, 4.8vw, 3.35rem);
                    letter-spacing: -0.03em;
                    line-height: 1.1;
                    color: #ffffff;
                    margin: 0 0 16px;
                }
                .legal-h1-accent {
                    background: linear-gradient(135deg, #ffffff 0%, #ff8ab8 55%, #E2C286 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .legal-lead {
                    color: #f4eef1;
                    font-size: 15.5px;
                    line-height: 1.7;
                    margin: 0 0 18px;
                    max-width: 740px;
                }
                .legal-meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 18px;
                }
                .legal-updated-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(226, 194, 134, 0.12);
                    border: 1px solid rgba(226, 194, 134, 0.35);
                    color: #E2C286;
                    font-size: 12.5px;
                    font-weight: 600;
                }
                .legal-address-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #dfd2d9;
                    font-size: 12.5px;
                    font-weight: 500;
                }
                .legal-scope-note {
                    color: #e2d6dc;
                    font-size: 13.5px;
                    line-height: 1.65;
                    border-left: 3px solid #ff8ab8;
                    background: rgba(255, 45, 120, 0.06);
                    padding: 12px 16px;
                    border-radius: 0 12px 12px 0;
                    margin: 0 0 22px;
                }
                .legal-nav-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding-top: 18px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .legal-nav-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 15px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    color: #e2d6dc;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    transition: all 0.2s ease;
                }
                .legal-nav-pill:hover {
                    color: #ffffff;
                    border-color: rgba(255, 138, 184, 0.5);
                    background: rgba(255, 45, 120, 0.14);
                }
                .legal-nav-pill.is-active {
                    color: #ffffff;
                    background: linear-gradient(135deg, #FF2D78 0%, #b81452 100%);
                    border-color: rgba(255, 255, 255, 0.28);
                    box-shadow: 0 6px 18px rgba(255, 45, 120, 0.32);
                }
                .legal-banner {
                    background: linear-gradient(155deg, rgba(42, 18, 34, 0.9), rgba(20, 9, 17, 0.95));
                    border: 1px solid rgba(255, 138, 184, 0.28);
                    border-radius: 18px;
                    padding: 18px 22px;
                    margin-bottom: 28px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .legal-section-header {
                    margin: 36px 0 20px;
                }
                .legal-h2 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(1.5rem, 3.2vw, 2.1rem);
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    margin: 0 0 6px;
                    line-height: 1.2;
                }
                .legal-section-sub {
                    color: #dfd2d9;
                    font-size: 14px;
                    margin: 0;
                    line-height: 1.6;
                }
                .legal-grid {
                    display: grid;
                    gap: 16px;
                }
                .legal-clause-card {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    gap: 16px;
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }
                .legal-clause-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 138, 184, 0.32);
                }
                .legal-clause-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    flex-shrink: 0;
                    background: rgba(255, 45, 120, 0.1);
                    border: 1px solid rgba(255, 138, 184, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .legal-clause-body {
                    flex: 1;
                    min-width: 0;
                }
                .legal-clause-title-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                }
                .legal-clause-num {
                    font-size: 11px;
                    font-weight: 700;
                    color: #E2C286;
                    background: rgba(226, 194, 134, 0.12);
                    border: 1px solid rgba(226, 194, 134, 0.3);
                    padding: 2px 8px;
                    border-radius: 999px;
                    letter-spacing: 0.06em;
                    flex-shrink: 0;
                }
                .legal-h3 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 17px;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.3;
                }
                .legal-clause-text {
                    color: #e2d6dc;
                    font-size: 14.5px;
                    line-height: 1.7;
                }
                .legal-clause-text p {
                    margin: 0;
                }
                .legal-inline-link {
                    color: #ff8ab8;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    font-weight: 600;
                }
                .legal-inline-link:hover {
                    color: #ffffff;
                }
                .legal-footer-card {
                    margin-top: 56px;
                    padding: 36px 28px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border-radius: 26px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
                .legal-footer-links {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
                    gap: 12px;
                    margin-top: 22px;
                }
                .legal-footer-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 13px 16px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    color: #f4eef1;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .legal-footer-btn:hover {
                    background: rgba(255, 45, 120, 0.15);
                    border-color: #ff8ab8;
                    color: #ffffff;
                    transform: translateY(-2px);
                }
                @media (max-width: 640px) {
                    .legal-clause-card {
                        flex-direction: column;
                        gap: 12px;
                        padding: 20px;
                    }
                }
            `}</style>

            <div className="legal-container">
                {/* ── Editorial Breadcrumb Bar ── */}
                <nav aria-label="Breadcrumb" className="legal-breadcrumb">
                    <Link href="/">Home</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <Link href="/policy">Studio Policies</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span style={{ color: '#ff8ab8', fontWeight: 600 }} aria-current="page">
                        Terms &amp; Conditions
                    </span>
                </nav>

                {/* ── Hero Header Card ── */}
                <header className="legal-hero-card">
                    <div className="legal-eyebrow">
                        <FileText size={15} aria-hidden="true" />
                        <span>Legal &amp; Studio Compliance</span>
                    </div>

                    <h1 className="legal-h1">
                        Terms &amp; <span className="legal-h1-accent">Conditions</span>
                    </h1>

                    <p className="legal-lead">
                        These Terms govern regular website bookings with Glitz &amp; Glamour Studio for non-event services. They are intended for appointments such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar services booked through the website.
                    </p>

                    <div className="legal-meta-row">
                        <span className="legal-updated-pill">
                            Last Updated: April 2026 · Glitz &amp; Glamour Studio
                        </span>
                        <span className="legal-address-pill">
                            <MapPin size={13} color="#ff8ab8" aria-hidden="true" />
                            935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                        </span>
                    </div>

                    <p className="legal-scope-note">
                        By checking the acknowledgment box at booking, you confirm you have read and agree to the{' '}
                        <Link href="/policy" className="legal-inline-link">Studio Policies</Link>,{' '}
                        <Link href="/waiver" className="legal-inline-link">Liability Waiver</Link>,{' '}
                        <Link href="/terms" className="legal-inline-link">Terms &amp; Conditions</Link>, and{' '}
                        <Link href="/privacy" className="legal-inline-link">Privacy Policy</Link>{' '}
                        applicable to regular website service bookings.
                    </p>

                    <nav aria-label="Policy quick navigation" className="legal-nav-pills">
                        {POLICY_PILLS.map((pill) => (
                            <Link
                                key={pill.href}
                                href={pill.href}
                                className={`legal-nav-pill${pill.active ? ' is-active' : ''}`}
                                aria-current={pill.active ? 'page' : undefined}
                            >
                                {pill.label}
                            </Link>
                        ))}
                    </nav>
                </header>

                {/* ── Scope notice ── */}
                <div className="legal-banner">
                    <ShieldCheck size={22} color="#ff8ab8" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <p style={{ color: '#f4eef1', fontSize: '15px', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                        By accessing this website and booking non-event services with Glitz &amp; Glamour Studio (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you agree to the following terms.
                    </p>
                </div>

                {/* ── Terms Clauses ── */}
                <section aria-labelledby="service-terms-heading">
                    <div className="legal-section-header">
                        <h2 id="service-terms-heading" className="legal-h2">
                            Website Booking <span className="legal-h1-accent">Terms</span>
                        </h2>
                        <p className="legal-section-sub">
                            Binding service terms, appointment governance, and liability standards for studio appointments.
                        </p>
                    </div>

                    <div className="legal-grid">
                        {TERMS.map(({ num, icon, title, text }) => (
                            <PolicyCard key={title} num={num} icon={icon} title={title}>
                                <p>{text}</p>
                            </PolicyCard>
                        ))}
                    </div>
                </section>

                {/* ── Image Usage & Release Policy Section ── */}
                <section aria-labelledby="image-usage-heading" style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '14px',
                                background: 'rgba(255, 45, 120, 0.12)',
                                border: '1px solid rgba(255, 138, 184, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Camera size={20} color="#ff8ab8" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="image-usage-heading" className="legal-h2" style={{ marginBottom: '2px' }}>
                                Image Usage &amp; <span className="legal-h1-accent">Release Policy</span>
                            </h2>
                            <p className="legal-section-sub">
                                Applies to all bookings made through this website where optional media consent is granted.
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: 'clamp(22px, 3.5vw, 32px)',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <p style={{ color: '#f4eef1', fontSize: '14.5px', fontStyle: 'italic', margin: '0 0 20px' }}>
                            Applies to all bookings made through this website. See also our dedicated{' '}
                            <Link href="/image-policy" className="legal-inline-link">Image Usage &amp; Release Policy</Link>.
                        </p>
                        <div style={{ display: 'grid', gap: '18px' }}>
                            {IMAGE_CLAUSES.map(({ n, h, b }) => (
                                <div
                                    key={n}
                                    style={{
                                        padding: '16px 18px',
                                        borderRadius: '14px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#ffffff',
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            margin: '0 0 6px',
                                        }}
                                    >
                                        <span style={{ color: '#E2C286', marginRight: '6px' }}>{n}.</span>
                                        {h}
                                    </h3>
                                    <p style={{ color: '#e2d6dc', fontSize: '14.5px', lineHeight: 1.68, margin: 0 }}>
                                        {b}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Footer links ── */}
                <section aria-labelledby="more-policies-heading" className="legal-footer-card">
                    <h2 id="more-policies-heading" className="legal-h2" style={{ fontSize: '22px', textAlign: 'center', marginBottom: '8px' }}>
                        More Studio Policies
                    </h2>
                    <p style={{ color: '#dfd2d9', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                        Explore our other policies and guidelines below.
                    </p>
                    <div className="legal-footer-links">
                        <Link href="/privacy" className="legal-footer-btn">
                            <ShieldCheck size={15} color="#ff8ab8" aria-hidden="true" /> Privacy Policy
                        </Link>
                        <Link href="/cookies" className="legal-footer-btn">
                            <Cookie size={15} color="#E2C286" aria-hidden="true" /> Cookie Policy
                        </Link>
                        <Link href="/data-deletion" className="legal-footer-btn">
                            <Trash2 size={15} color="#ff8ab8" aria-hidden="true" /> Data Deletion
                        </Link>
                        <Link href="/unsubscribe" className="legal-footer-btn">
                            <MailX size={15} color="#E2C286" aria-hidden="true" /> Unsubscribe
                        </Link>
                        <Link href="/policy" className="legal-footer-btn">
                            Studio Policies
                        </Link>
                        <Link href="/waiver" className="legal-footer-btn">
                            Liability Waiver
                        </Link>
                        <Link href="/image-policy" className="legal-footer-btn">
                            Image Release Policy
                        </Link>
                        <Link href="/faq" className="legal-footer-btn">
                            FAQ
                        </Link>
                    </div>
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px', fontSize: '13px', color: '#dfd2d9' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#ff8ab8" aria-hidden="true" />
                            935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                        </span>
                        <a href="tel:+17602905910" className="legal-inline-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} aria-hidden="true" /> (760) 290-5910
                        </a>
                        <a href="mailto:info@glitzandglamours.com" className="legal-inline-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={14} aria-hidden="true" /> info@glitzandglamours.com
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}

function PolicyCard({
    num,
    icon,
    title,
    children,
}: {
    num: string;
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <article className="legal-clause-card">
            <div className="legal-clause-icon">{icon}</div>
            <div className="legal-clause-body">
                <div className="legal-clause-title-row">
                    <span className="legal-clause-num">{num}</span>
                    <h3 className="legal-h3">{title}</h3>
                </div>
                <div className="legal-clause-text">{children}</div>
            </div>
        </article>
    );
}
