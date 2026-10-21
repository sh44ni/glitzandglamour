import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
    ChevronRight,
    Cookie,
    Lock,
    Sliders,
    Activity,
    ShieldCheck,
    HelpCircle,
    BookOpen,
    FileText,
    Trash2,
    MailX,
    MapPin,
    Phone,
    Mail,
    Server,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Cookie Policy | Glitz & Glamour Studio',
    description:
        'Learn how Glitz & Glamour Studio uses strictly necessary session cookies, preference storage, and performance telemetry to keep online booking secure and reliable.',
    alternates: { canonical: 'https://www.glitzandglamours.com/cookies' },
    openGraph: {
        title: 'Cookie Policy | Glitz & Glamour Studio',
        description:
            'How Glitz & Glamour Studio uses cookies, sessions, and local storage for online appointment booking.',
        type: 'website',
        url: 'https://www.glitzandglamours.com/cookies',
    },
};

const POLICY_PILLS = [
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/cookies', label: 'Cookie Policy', active: true },
    { href: '/data-deletion', label: 'Data Deletion', active: false },
    { href: '/unsubscribe', label: 'Unsubscribe', active: false },
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: false },
];

const COOKIE_CLAUSES = [
    {
        num: '01',
        icon: <Cookie size={18} color="#E2C286" aria-hidden="true" />,
        title: 'What Are Cookies & Session Technologies',
        text: 'Cookies are small text files placed on your device when you visit a website. Alongside standard HTTP cookies, Glitz & Glamour Studio uses browser session storage and local storage to keep your appointment booking steps intact, remember your language preferences, and authenticate your client loyalty profile.',
    },
    {
        num: '02',
        icon: <Lock size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Strictly Necessary & Security Cookies',
        text: 'These cookies are essential for the website and booking platform to function properly. They include encrypted authentication session tokens (NextAuth session cookies), CSRF protection tokens, rate-limiting and fraud-prevention checks, and temporary state required to complete a service booking or sign a digital agreement.',
    },
    {
        num: '03',
        icon: <Sliders size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Functional & Client Preference Storage',
        text: 'Functional storage remembers choices you make on our website — such as your preferred display language (English or Spanish), dismissed promotional or progressive web app (PWA) banners, and selected services while navigating between the service catalog and the booking flow.',
    },
    {
        num: '04',
        icon: <Activity size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Performance & Analytics Telemetry',
        text: 'We use Google Analytics 4 (GA4) and first-party page-view logs to understand how visitors navigate our service menu, measure page load reliability, and diagnose technical errors. Analytics scripts are loaded deferred after initial page rendering so they never slow down your browsing experience.',
    },
    {
        num: '05',
        icon: <ShieldCheck size={18} color="#E2C286" aria-hidden="true" />,
        title: 'No Third-Party Behavioral Advertising',
        text: 'Glitz & Glamour Studio does not sell your personal data and does not use cookies to serve unrelated third-party behavioral advertising across external ad networks. Session and technical data collected during booking are used strictly for studio operations, security, and client care.',
    },
    {
        num: '06',
        icon: <Server size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Digital Wallet & Contract Signing Sessions',
        text: 'When you add your Glitz & Glamour loyalty card to Apple Wallet or Google Wallet, or when you open a unique bridal/special-event contract signing link, temporary cryptographic tokens are used to verify your identity and prevent unauthorized access.',
    },
    {
        num: '07',
        icon: <HelpCircle size={18} color="#E2C286" aria-hidden="true" />,
        title: 'How to Manage or Disable Cookies',
        text: 'Most web browsers allow you to view, manage, block, or delete cookies through your browser settings. Please note that blocking strictly necessary cookies or clearing browser storage during an active booking session may prevent you from signing in or completing an online appointment reservation.',
    },
    {
        num: '08',
        icon: <BookOpen size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Updates & Studio Contact',
        text: 'We may update this Cookie Policy from time to time to reflect operational or regulatory changes. For questions about our Cookie Policy or privacy practices, contact Glitz & Glamour Studio at info@glitzandglamours.com, call (760) 290-5910, or visit 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078.',
    },
];

const COOKIE_Inventory = [
    {
        name: 'next-auth.session-token',
        category: 'Strictly Necessary',
        duration: 'Session / 30 Days',
        purpose: 'Maintains authenticated client sign-in for loyalty card, profile, and booking history.',
    },
    {
        name: 'next-auth.csrf-token',
        category: 'Security',
        duration: 'Session',
        purpose: 'Prevents Cross-Site Request Forgery (CSRF) during authentication and form submissions.',
    },
    {
        name: 'gg_lang / localStorage',
        category: 'Functional',
        duration: 'Persistent',
        purpose: 'Remembers your selected interface language (English or Español) and UI preferences.',
    },
    {
        name: '_ga / _ga_*',
        category: 'Analytics (GA4)',
        duration: 'Up to 13 Months',
        purpose: 'Aggregated traffic and performance metrics to improve studio website speed and usability.',
    },
];

export default function CookiePolicyPage() {
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
                .cookie-matrix-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 14px;
                }
                .cookie-matrix-item {
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 18px;
                    padding: 20px;
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
                        Cookie Policy
                    </span>
                </nav>

                {/* ── Hero Header Card ── */}
                <header className="legal-hero-card">
                    <div className="legal-eyebrow">
                        <Cookie size={15} aria-hidden="true" />
                        <span>Legal &amp; Studio Compliance</span>
                    </div>

                    <h1 className="legal-h1">
                        Cookie <span className="legal-h1-accent">Policy</span>
                    </h1>

                    <p className="legal-lead">
                        This Cookie Policy explains how Glitz &amp; Glamour Studio uses session cookies, local browser storage, and security tokens to keep our appointment booking flow functional, protect client accounts, and maintain reliable platform performance.
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
                        Our website uses cookies and session-based storage strictly for operational, authentication, and performance purposes — never for third-party behavioral advertising resale. Read this policy alongside our{' '}
                        <Link href="/privacy" className="legal-inline-link">Privacy Policy</Link> and{' '}
                        <Link href="/terms" className="legal-inline-link">Terms &amp; Conditions</Link>.
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

                {/* ── Cookie Policy Clauses ── */}
                <section aria-labelledby="cookie-clauses-heading">
                    <div className="legal-section-header">
                        <h2 id="cookie-clauses-heading" className="legal-h2">
                            How We Use <span className="legal-h1-accent">Cookies &amp; Sessions</span>
                        </h2>
                        <p className="legal-section-sub">
                            Transparent breakdown of session technologies used across glitzandglamours.com.
                        </p>
                    </div>

                    <div className="legal-grid">
                        {COOKIE_CLAUSES.map(({ num, icon, title, text }) => (
                            <article key={title} className="legal-clause-card">
                                <div className="legal-clause-icon">{icon}</div>
                                <div className="legal-clause-body">
                                    <div className="legal-clause-title-row">
                                        <span className="legal-clause-num">{num}</span>
                                        <h3 className="legal-h3">{title}</h3>
                                    </div>
                                    <div className="legal-clause-text">
                                        <p>{text}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── Cookie & Storage Inventory ── */}
                <section aria-labelledby="cookie-inventory-heading" style={{ marginTop: '48px' }}>
                    <div className="legal-section-header">
                        <h2 id="cookie-inventory-heading" className="legal-h2">
                            Active Cookie &amp; Storage <span className="legal-h1-accent">Directory</span>
                        </h2>
                        <p className="legal-section-sub">
                            Summary of primary first-party cookies and storage keys used on our platform.
                        </p>
                    </div>

                    <div className="cookie-matrix-grid">
                        {COOKIE_Inventory.map((item) => (
                            <div key={item.name} className="cookie-matrix-item">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#E2C286', background: 'rgba(226, 194, 134, 0.12)', border: '1px solid rgba(226, 194, 134, 0.3)', padding: '3px 10px', borderRadius: '999px' }}>
                                        {item.category}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#dfd2d9', fontWeight: 600 }}>
                                        {item.duration}
                                    </span>
                                </div>
                                <h3 className="legal-h3" style={{ fontSize: '15.5px', marginBottom: '8px', color: '#ff8ab8' }}>
                                    <code>{item.name}</code>
                                </h3>
                                <p style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.65, margin: 0 }}>
                                    {item.purpose}
                                </p>
                            </div>
                        ))}
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
                        <Link href="/privacy" className="legal-footer-btn">
                            <ShieldCheck size={15} color="#ff8ab8" aria-hidden="true" /> Privacy Policy
                        </Link>
                        <Link href="/terms" className="legal-footer-btn">
                            <FileText size={15} color="#E2C286" aria-hidden="true" /> Terms &amp; Conditions
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
