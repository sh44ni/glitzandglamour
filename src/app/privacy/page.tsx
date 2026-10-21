import React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    ShieldCheck,
    Shield,
    Database,
    Eye,
    Share2,
    Lock,
    UserCheck,
    RefreshCw,
    FileText,
    Smartphone,
    CheckSquare,
    MessageSquare,
    AlertCircle,
    PhoneOff,
    HelpCircle,
    Server,
    Archive,
    BookOpen,
    Cookie,
    Trash2,
    MailX,
    MapPin,
    Phone,
    Mail,
} from 'lucide-react';

const POLICY_PILLS = [
    { href: '/privacy', label: 'Privacy Policy', active: true },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/cookies', label: 'Cookie Policy', active: false },
    { href: '/data-deletion', label: 'Data Deletion', active: false },
    { href: '/unsubscribe', label: 'Unsubscribe', active: false },
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: false },
];

export default function PrivacyPolicyPage() {
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
                    margin-bottom: 36px;
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
                .legal-section-header {
                    margin: 40px 0 20px;
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
                        Privacy Policy
                    </span>
                </nav>

                {/* ── Hero Header Card ── */}
                <header className="legal-hero-card">
                    <div className="legal-eyebrow">
                        <ShieldCheck size={15} aria-hidden="true" />
                        <span>Legal &amp; Studio Compliance</span>
                    </div>

                    <h1 className="legal-h1">
                        Privacy <span className="legal-h1-accent">Policy</span>
                    </h1>

                    <p className="legal-lead">
                        Your privacy matters to us. This Privacy Policy explains what information Glitz &amp; Glamour Studio collects for regular website service bookings, how that information is used, when it may be shared with service providers, and what rights you have regarding your personal information.
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
                        This Privacy Policy applies to regular website bookings for salon and beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar appointments. It does not govern separate event inquiries, bridal/event services, or Beauty Events Agreements handled outside the website booking flow.
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

                {/* ── Privacy Policy Sections ── */}
                <section aria-labelledby="privacy-clauses-heading">
                    <div className="legal-section-header">
                        <h2 id="privacy-clauses-heading" className="legal-h2">
                            Core Privacy <span className="legal-h1-accent">Disclosures</span>
                        </h2>
                        <p className="legal-section-sub">
                            How Glitz &amp; Glamour Studio collects, safeguards, and processes client booking data.
                        </p>
                    </div>

                    <div className="legal-grid">
                        <PolicyCard num="01" icon={<Database size={18} color="#E2C286" aria-hidden="true" />} title="Information We Collect">
                            <p>When you book an appointment or create an account with Glitz &amp; Glamour Studio, we may collect your name, email address, phone number, appointment details, booking notes, inspiration photos you choose to upload, service history, loyalty activity, and limited technical information associated with your booking. Payment card details are not stored by the booking form when payment is handled separately or through third-party payment methods.</p>
                        </PolicyCard>

                        <PolicyCard num="02" icon={<Eye size={18} color="#ff8ab8" aria-hidden="true" />} title="How We Use Your Information">
                            <p>We use your information to manage bookings, send appointment confirmations and reminders, support SMS or email communications you requested, maintain service history and loyalty records, review notes and inspiration photos submitted for appointments, improve operational workflows, prevent fraud or abuse, and maintain the security and integrity of the platform.</p>
                        </PolicyCard>

                        <PolicyCard num="03" icon={<Share2 size={18} color="#E2C286" aria-hidden="true" />} title="Information Sharing">
                            <p>We do not sell, rent, or share your personal information with third parties for their own advertising or marketing purposes. We may share limited information with trusted service providers that help operate the studio or booking system, such as email-delivery providers, SMS-delivery providers, hosting providers, or security/infrastructure vendors, but only to the extent reasonably necessary for them to provide services on our behalf.</p>
                        </PolicyCard>

                        <PolicyCard num="04" icon={<Shield size={18} color="#ff8ab8" aria-hidden="true" />} title="Data Security">
                            <p>We take reasonable administrative, technical, and organizational measures to protect personal information from unauthorized access, misuse, alteration, loss, or disclosure. However, no storage system, website, or transmission method can be guaranteed to be completely secure.</p>
                        </PolicyCard>

                        <PolicyCard num="05" icon={<Archive size={18} color="#E2C286" aria-hidden="true" />} title="How Long We Keep Data">
                            <p>We retain personal information for as long as reasonably necessary to operate the studio, maintain booking and account records, comply with legal or tax obligations, resolve disputes, enforce policies, preserve fraud-prevention records, and document communications or consent records associated with bookings.</p>
                        </PolicyCard>

                        <PolicyCard num="06" icon={<Lock size={18} color="#ff8ab8" aria-hidden="true" />} title="Cookies & Sessions">
                            <p>
                                Our website may use session-based tools, cookies, or similar technologies to keep the booking flow functional, maintain security, prevent abuse, and improve reliability. These tools are used for operational purposes and not to provide unrelated third-party behavioral advertising through the booking process. For full details, review our{' '}
                                <Link href="/cookies" className="legal-inline-link">Cookie Policy</Link>.
                            </p>
                        </PolicyCard>

                        <PolicyCard num="07" icon={<Server size={18} color="#E2C286" aria-hidden="true" />} title="IP Address & Approximate Geolocation">
                            <p>When you submit or finalize a booking, we may log limited technical information such as your IP address, approximate location (for example city, region, or country), and device/browser information. We use this information for fraud prevention, abuse prevention, security monitoring, operational reporting, and to help protect the studio, platform, and clients. This information is not used for targeted advertising.</p>
                        </PolicyCard>

                        <PolicyCard num="08" icon={<UserCheck size={18} color="#ff8ab8" aria-hidden="true" />} title="Your Rights">
                            <p>
                                You may contact Glitz &amp; Glamour Studio to request access to, correction of, or deletion of the personal information we hold about you, subject to legal obligations, record-retention needs, fraud-prevention needs, and other lawful exceptions. You may also request that we update account contact details or remove information where appropriate via our{' '}
                                <Link href="/data-deletion" className="legal-inline-link">Data Deletion Request page</Link>{' '}
                                or manage communication preferences on our{' '}
                                <Link href="/unsubscribe" className="legal-inline-link">Unsubscribe page</Link>.
                            </p>
                        </PolicyCard>

                        <PolicyCard num="09" icon={<RefreshCw size={18} color="#E2C286" aria-hidden="true" />} title="Policy Updates">
                            <p>We may update this Privacy Policy from time to time. The effective version is the one posted on the website at the time of booking or website use. Continued use of the booking system after updates are posted constitutes acknowledgment of those updates.</p>
                        </PolicyCard>

                        <PolicyCard num="10" icon={<BookOpen size={18} color="#ff8ab8" aria-hidden="true" />} title="Contact">
                            <p>
                                If you have questions about this Privacy Policy or how your information is handled, contact Glitz &amp; Glamour Studio using the contact information listed on the website:{' '}
                                <a href="mailto:info@glitzandglamours.com" className="legal-inline-link">info@glitzandglamours.com</a>,{' '}
                                <a href="tel:+17602905910" className="legal-inline-link">(760) 290-5910</a>, or visit us at{' '}
                                <strong style={{ color: '#ffffff' }}>935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078</strong>.
                            </p>
                        </PolicyCard>
                    </div>
                </section>

                {/* ── SMS Terms Header & Sections ── */}
                <section aria-labelledby="sms-terms-heading">
                    <div className="legal-section-header" style={{ marginTop: '56px' }}>
                        <h2 id="sms-terms-heading" className="legal-h2">
                            SMS / Text Messaging <span className="legal-h1-accent">Terms of Service</span>
                        </h2>
                        <p className="legal-section-sub">
                            Transactional text message disclosures, carrier terms, and opt-out instructions.
                        </p>
                    </div>

                    <div className="legal-grid">
                        <PolicyCard num="SMS 01" icon={<Smartphone size={18} color="#ff8ab8" aria-hidden="true" />} title="Program Description">
                            <p>Glitz &amp; Glamour Studio may offer transactional SMS text messaging for appointment confirmations, reminders, scheduling updates, or related service communications. These messages are intended for regular website bookings and related appointment activity rather than unrelated promotional campaigns.</p>
                        </PolicyCard>

                        <PolicyCard num="SMS 02" icon={<CheckSquare size={18} color="#E2C286" aria-hidden="true" />} title="Consent">
                            <p>By providing your phone number and opting into SMS communications through the booking flow or another approved method, you agree to receive transactional text messages related to your appointments. Consent to receive text messages is not required to book if another communication method is available.</p>
                        </PolicyCard>

                        <PolicyCard num="SMS 03" icon={<MessageSquare size={18} color="#ff8ab8" aria-hidden="true" />} title="Message Frequency">
                            <p>Message frequency varies based on your booking activity, appointment changes, and communication needs. You may receive recurring or one-time messages related to confirmation, reminders, follow-up, or scheduling updates.</p>
                        </PolicyCard>

                        <PolicyCard num="SMS 04" icon={<AlertCircle size={18} color="#E2C286" aria-hidden="true" />} title="Message and Data Rates">
                            <p>Message and data rates may apply depending on your wireless carrier or service plan. Glitz &amp; Glamour Studio is not responsible for carrier charges or limitations.</p>
                        </PolicyCard>

                        <PolicyCard num="SMS 05" icon={<PhoneOff size={18} color="#ff8ab8" aria-hidden="true" />} title="Opt-Out / How to Stop">
                            <p>You can opt out of SMS messages at any time by replying <strong style={{ color: '#ffffff' }}>STOP</strong> to a message you receive from us, subject to any final confirmation message required to process the opt-out.</p>
                        </PolicyCard>

                        <PolicyCard num="SMS 06" icon={<HelpCircle size={18} color="#E2C286" aria-hidden="true" />} title="Help">
                            <p>For help with the text messaging program, reply <strong style={{ color: '#ffffff' }}>HELP</strong> to a message you receive from us or contact Glitz &amp; Glamour Studio using the contact information listed on the website.</p>
                        </PolicyCard>

                        <PolicyCard num="SMS 07" icon={<Shield size={18} color="#ff8ab8" aria-hidden="true" />} title="SMS Privacy">
                            <p>Your phone number, SMS opt-in data, and related messaging records are used only to deliver the messages you requested and maintain communication records. They are not sold, rented, or shared for unrelated third-party marketing purposes.</p>
                        </PolicyCard>
                    </div>
                </section>

                {/* ── Footer links ── */}
                <section aria-labelledby="more-policies-heading" className="legal-footer-card">
                    <h2 id="more-policies-heading" className="legal-h2" style={{ fontSize: '22px', textAlign: 'center', marginBottom: '8px' }}>
                        More Studio Policies
                    </h2>
                    <p style={{ color: '#dfd2d9', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                        Explore our other legal disclosures, data tools, and studio guidelines below.
                    </p>
                    <div className="legal-footer-links">
                        <Link href="/terms" className="legal-footer-btn">
                            <FileText size={15} color="#ff8ab8" aria-hidden="true" /> Terms &amp; Conditions
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
                            Studio FAQ
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
