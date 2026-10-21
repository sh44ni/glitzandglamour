'use client';

import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Shield,
    FileText,
    Info,
    RefreshCw,
    Camera,
    BookOpen,
    ShieldCheck,
    Scale,
    Lock,
    HelpCircle,
    Calendar,
} from 'lucide-react';

const CROSS_POLICY_LINKS = [
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: true },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/image-policy', label: 'Image Release Policy', active: false },
];

const SECTIONS = [
    {
        num: '01',
        icon: <AlertTriangle size={18} color="#E2C286" />,
        title: 'Inherent Risks',
        text: 'Beauty services involve inherent risks that may vary by service type and client condition. These risks can include irritation, redness, chemical exposure, allergic reaction, sensitivity, breakage, poor retention, lifting, staining, uneven processing, skin reaction, or unexpected service outcomes even when reasonable care is used.',
    },
    {
        num: '02',
        icon: <Info size={18} color="#6ef2b8" />,
        title: 'Client Disclosures',
        text: 'You agree to provide accurate and complete information before receiving services, including allergies, sensitivities, medications, prior chemical treatments, prior services, skin or scalp conditions, nail conditions, pregnancy-related concerns where relevant, lash or eye sensitivities, and any other information that could affect safety, suitability, or results.',
    },
    {
        num: '04',
        icon: <CheckCircle size={18} color="#ff8ab8" />,
        title: 'No Guarantee of Results',
        text: 'Specific service results are not guaranteed. Outcomes may differ based on your natural hair, skin, lashes, nails, prior product use, prior chemical history, health factors, maintenance habits, aftercare compliance, product compatibility, and pre-existing conditions.',
    },
    {
        num: '05',
        icon: <RefreshCw size={18} color="#E2C286" />,
        title: 'Aftercare Responsibility',
        text: 'You are responsible for following the aftercare and maintenance instructions provided for your service. Glitz & Glamour Studio is not responsible for issues caused in whole or in part by failure to follow aftercare, product misuse, picking, moisture exposure, heat exposure, friction, improper home care, or outside work performed after your appointment.',
    },
    {
        num: '06',
        icon: <AlertTriangle size={18} color="#ff8ab8" />,
        title: 'Pre-Existing Conditions & Prior Work',
        text: 'Glitz & Glamour Studio is not responsible for damage, breakage, irritation, retention problems, uneven results, lifting, shedding, peeling, or other complications caused in whole or in part by pre-existing weakness, prior services, prior chemical history, box dye, bleach history, third-party work, previous lash extensions, prior waxing sensitivity, damaged nails, or other pre-existing conditions.',
    },
    {
        num: '07',
        icon: <Shield size={18} color="#6ef2b8" />,
        title: 'Release & Limitation of Liability',
        text: 'To the fullest extent permitted by law, you understand and accept the inherent risks associated with the services you request and release Glitz & Glamour Studio from claims arising from inherent service risks, disclosed service-related risks, allergic reactions despite reasonable precautions, pre-existing conditions, prior work, prior chemical history, inaccurate or incomplete client disclosures, or failure to follow aftercare or maintenance instructions.',
    },
    {
        num: '08',
        icon: <Camera size={18} color="#E2C286" />,
        title: 'Photo / Video Notice',
        text: 'Glitz & Glamour Studio may photograph or record limited service-related, service-result, or behind-the-scenes content only when separate optional consent has been provided. Any identifiable client photo or video used for portfolio, website, social media, marketing, educational, or promotional purposes will be governed by the separate Image Usage & Release Policy. Declining photo or video consent will not affect your ability to receive services.',
    },
    {
        num: '09',
        icon: <FileText size={18} color="#ff8ab8" />,
        title: 'Voluntary Acceptance',
        text: 'By proceeding with your appointment, you voluntarily choose to receive services with knowledge that beauty services carry inherent and variable risks, and you accept responsibility for truthful disclosure, aftercare compliance, and service-related decisions made based on the information you provide.',
    },
    {
        num: '10',
        icon: <BookOpen size={18} color="#6ef2b8" />,
        title: 'Contact',
        text: 'If you have questions about this Liability Waiver or whether a service is appropriate for you, contact Glitz & Glamour Studio before booking or before your appointment begins.',
    },
];

export default function LiabilityWaiverPage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                padding: '32px 16px 120px',
                position: 'relative',
                zIndex: 1,
                overflowX: 'hidden',
            }}
        >
            <style>{`
                .waiver-shell {
                    max-width: 920px;
                    margin: 0 auto;
                }
                .waiver-pill-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .waiver-nav-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 999px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    min-height: 42px;
                }
                .waiver-clause-card {
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 24px 26px;
                    display: flex;
                    gap: 18px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }
                .waiver-clause-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 138, 184, 0.32);
                }
                .waiver-footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .waiver-footer-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 13px 16px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #f4eef1;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    min-height: 46px;
                }
                .waiver-footer-link:hover {
                    background: rgba(255, 45, 120, 0.12);
                    border-color: rgba(255, 138, 184, 0.4);
                    color: #ffffff;
                }
                @media (max-width: 640px) {
                    .waiver-hero-card {
                        padding: 26px 20px !important;
                    }
                    .waiver-clause-card {
                        padding: 20px 18px;
                        gap: 14px;
                    }
                }
            `}</style>

            {/* Ambient radial glows */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '8%',
                    left: '4%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255, 45, 120, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: '18%',
                    right: '4%',
                    width: '360px',
                    height: '360px',
                    background: 'radial-gradient(circle, rgba(226, 194, 134, 0.06) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />

            <div className="waiver-shell">
                {/* Breadcrumb & Back Bar */}
                <nav
                    aria-label="Breadcrumb"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '22px',
                    }}
                >
                    <Link
                        href="/policy"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#dfd2d9',
                            textDecoration: 'none',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            fontFamily: 'Poppins, sans-serif',
                            padding: '8px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <ChevronLeft size={15} color="#ff8ab8" /> Studio Policies
                    </Link>

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12.5px',
                            color: '#c8b8c2',
                        }}
                    >
                        <Link href="/" style={{ color: '#dfd2d9', textDecoration: 'none' }}>
                            Home
                        </Link>
                        <ChevronRight size={13} color="#c8b8c2" />
                        <Link href="/policy" style={{ color: '#dfd2d9', textDecoration: 'none' }}>
                            Policies
                        </Link>
                        <ChevronRight size={13} color="#c8b8c2" />
                        <span style={{ color: '#ff8ab8', fontWeight: 600 }}>Liability Waiver</span>
                    </div>
                </nav>

                {/* Cross-Policy Navigation Pills */}
                <nav className="waiver-pill-bar" aria-label="Legal and studio policy pages">
                    {CROSS_POLICY_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className="waiver-nav-pill"
                            style={{
                                background: item.active
                                    ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.28), rgba(226, 194, 134, 0.18))'
                                    : 'rgba(255, 255, 255, 0.04)',
                                border: item.active
                                    ? '1px solid rgba(255, 138, 184, 0.5)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                color: item.active ? '#ffffff' : '#dfd2d9',
                            }}
                        >
                            <ShieldCheck size={14} color={item.active ? '#ff8ab8' : '#c8b8c2'} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Editorial Hero Card */}
                <header
                    className="waiver-hero-card"
                    style={{
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '26px',
                        padding: '38px 36px',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '24px',
                            right: '24px',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                        }}
                    />

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.12)',
                            border: '1px solid rgba(255, 138, 184, 0.3)',
                            marginBottom: '16px',
                        }}
                    >
                        <Shield size={14} color="#ff8ab8" />
                        <span
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase',
                                color: '#ff8ab8',
                            }}
                        >
                            Client Consent &amp; Service Acknowledgment
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 800,
                            fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
                            letterSpacing: '-0.8px',
                            marginBottom: '14px',
                            lineHeight: 1.12,
                            color: '#ffffff',
                        }}
                    >
                        Liability{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #ff8ab8 0%, #E2C286 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Waiver
                        </span>
                    </h1>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '15.5px',
                            lineHeight: 1.65,
                            maxWidth: '680px',
                            margin: '0 0 14px',
                        }}
                    >
                        Liability Waiver &amp; Client Consent — This Liability Waiver applies to regular website
                        bookings and in-studio or routine service appointments with Glitz &amp; Glamour Studio for
                        non-event beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and
                        similar services.
                    </p>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#dfd2d9',
                            fontSize: '13px',
                            fontWeight: 600,
                            margin: '0 0 16px',
                        }}
                    >
                        Last Updated: April 2026 · Glitz &amp; Glamour Studio
                    </p>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#dfd2d9',
                            fontSize: '13.5px',
                            margin: 0,
                            maxWidth: '720px',
                            lineHeight: 1.65,
                            borderLeft: '2px solid rgba(255, 138, 184, 0.45)',
                            paddingLeft: '14px',
                        }}
                    >
                        By checking the acknowledgment box at booking and by receiving services, you confirm that you
                        have reviewed this Liability Waiver together with the{' '}
                        <Link href="/policy" style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}>
                            Studio Policies
                        </Link>
                        ,{' '}
                        <Link href="/terms" style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}>
                            Terms &amp; Conditions
                        </Link>
                        , and{' '}
                        <Link
                            href="/privacy"
                            style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}
                        >
                            Privacy Policy
                        </Link>{' '}
                        applicable to regular website bookings. This page does not govern separate bridal, event, or
                        Beauty Events Agreement services.
                    </p>
                </header>

                {/* Intro banner */}
                <div
                    style={{
                        background: 'linear-gradient(155deg, rgba(44, 18, 35, 0.92), rgba(20, 9, 16, 0.96))',
                        border: '1px solid rgba(255, 138, 184, 0.28)',
                        borderRadius: '18px',
                        padding: '18px 22px',
                        marginBottom: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                    }}
                >
                    <ShieldCheck size={22} color="#ff8ab8" style={{ flexShrink: 0 }} />
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#f4eef1',
                            fontSize: '14.5px',
                            fontWeight: 500,
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        By booking or receiving non-event services, you acknowledge the inherent risks of beauty
                        services, confirm your disclosure responsibilities, and agree to the following limitations and
                        acknowledgments.
                    </p>
                </div>

                {/* Clause Cards Section */}
                <section aria-labelledby="waiver-clauses-heading">
                    <h2
                        id="waiver-clauses-heading"
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '1.2px',
                            textTransform: 'uppercase',
                            color: '#ff8ab8',
                            margin: '0 0 16px 4px',
                        }}
                    >
                        Waiver Clauses &amp; Client Acknowledgments (01–10)
                    </h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* First 2 sections (01, 02) */}
                        {SECTIONS.slice(0, 2).map(({ num, icon, title, text }) => (
                            <PolicyCard key={title} num={num} icon={icon} title={title}>
                                <p style={{ margin: 0 }}>{text}</p>
                            </PolicyCard>
                        ))}

                        {/* 03. Client Confirmations — bulleted */}
                        <PolicyCard
                            num="03"
                            icon={<CheckCircle size={18} color="#6ef2b8" />}
                            title="Client Confirmations"
                        >
                            <ul
                                style={{
                                    paddingLeft: '18px',
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <li>
                                    You have disclosed relevant allergies, sensitivities, medications, and conditions to
                                    the best of your knowledge.
                                </li>
                                <li>You understand results vary and are not guaranteed.</li>
                                <li>
                                    You understand service longevity, retention, color result, lift, durability, or
                                    final outcome may vary based on individual factors.
                                </li>
                                <li>You agree to follow all reasonable pre-service and aftercare instructions.</li>
                            </ul>
                        </PolicyCard>

                        {/* Remaining sections (04–10) */}
                        {SECTIONS.slice(2).map(({ num, icon, title, text }) => (
                            <PolicyCard key={title} num={num} icon={icon} title={title}>
                                <p style={{ margin: 0 }}>{text}</p>
                            </PolicyCard>
                        ))}
                    </div>
                </section>

                {/* Cross-Policy Footer Card */}
                <section
                    style={{
                        marginTop: '52px',
                        padding: '36px 28px',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        borderRadius: '26px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '24px',
                            right: '24px',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)',
                        }}
                    />

                    <h2
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '20px',
                            color: '#ffffff',
                            margin: '0 0 8px',
                            textAlign: 'center',
                        }}
                    >
                        More Studio Policies
                    </h2>
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '14px',
                            margin: '0 0 24px',
                            textAlign: 'center',
                        }}
                    >
                        Explore our other policies and guidelines below.
                    </p>

                    <div className="waiver-footer-grid">
                        <Link href="/faq" className="waiver-footer-link">
                            <HelpCircle size={16} color="#ff8ab8" />
                            <span>FAQ</span>
                        </Link>
                        <Link href="/policy" className="waiver-footer-link">
                            <ShieldCheck size={16} color="#E2C286" />
                            <span>Studio Policies</span>
                        </Link>
                        <Link href="/terms" className="waiver-footer-link">
                            <Scale size={16} color="#ff8ab8" />
                            <span>Terms &amp; Conditions</span>
                        </Link>
                        <Link href="/privacy" className="waiver-footer-link">
                            <Lock size={16} color="#E2C286" />
                            <span>Privacy Policy</span>
                        </Link>
                        <Link href="/image-policy" className="waiver-footer-link">
                            <Camera size={16} color="#ff8ab8" />
                            <span>Image Release Policy</span>
                        </Link>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Link
                            href="/book"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '14px 32px',
                                borderRadius: '999px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #c9185b 100%)',
                                color: '#ffffff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 10px 28px rgba(255, 45, 120, 0.35)',
                            }}
                        >
                            <Calendar size={16} /> Book Appointment
                        </Link>
                    </div>
                </section>
            </div>
        </main>
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
        <div className="waiver-clause-card">
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '16px',
                    right: '16px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent)',
                }}
            />
            <div
                style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#ff8ab8',
                            padding: '2px 9px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.14)',
                            border: '1px solid rgba(255, 138, 184, 0.32)',
                            flexShrink: 0,
                        }}
                    >
                        {num}
                    </span>
                    <h3
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            fontSize: '16.5px',
                            color: '#ffffff',
                            margin: 0,
                        }}
                    >
                        {title}
                    </h3>
                </div>
                <div
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#e2d6dc',
                        fontSize: '14.5px',
                        lineHeight: 1.7,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
