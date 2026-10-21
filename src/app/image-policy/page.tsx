'use client';

import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Camera,
    Shield,
    Edit3,
    Slash,
    Award,
    Users,
    XCircle,
    Scale,
    ShieldCheck,
    FileText,
    Lock,
    HelpCircle,
    Calendar,
} from 'lucide-react';

const CROSS_POLICY_LINKS = [
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: false },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/image-policy', label: 'Image Release Policy', active: true },
];

const CLAUSES = [
    {
        num: '01',
        icon: <Camera size={18} color="#E2C286" />,
        title: 'Optional consent',
        text: 'By checking the optional image consent box or otherwise providing written consent, you grant Glitz & Glamour Studio a non-exclusive, royalty-free, worldwide license to use, reproduce, publish, and display photographs, video recordings, and images captured during or after your session for uses including, but not limited to, social media, website and online portfolio, marketing and promotional materials, blog posts and newsletters, and contest or award submissions.',
    },
    {
        num: '02',
        icon: <Shield size={18} color="#6ef2b8" />,
        title: 'No effect on services',
        text: 'You are not required to consent to photo, video, or image use in order to book or receive services. Declining consent will not affect your appointment or service experience.',
    },
    {
        num: '03',
        icon: <Edit3 size={18} color="#ff8ab8" />,
        title: 'Editing and presentation',
        text: 'Glitz & Glamour Studio may crop, resize, adjust lighting or color, add captions, watermarks, music, branding, or otherwise edit images or videos for presentation purposes. We will not intentionally edit content in a way that materially misrepresents you or the service provided.',
    },
    {
        num: '04',
        icon: <Slash size={18} color="#E2C286" />,
        title: 'Restrictions',
        text: 'Glitz & Glamour Studio will not sell your images or videos directly to third parties for commercial resale, use your images or videos in a defamatory, obscene, or unlawful manner, or alter images or videos in a way that misrepresents you.',
    },
    {
        num: '05',
        icon: <Award size={18} color="#6ef2b8" />,
        title: 'Ownership & copyright',
        text: 'Glitz & Glamour Studio retains full copyright and ownership of all images and videos taken during or after your session. Agreeing to this policy grants a usage license only — it does not transfer copyright to the client.',
    },
    {
        num: '06',
        icon: <Users size={18} color="#ff8ab8" />,
        title: 'Minors',
        text: 'If any subject is under 18 years of age, the parent or legal guardian providing consent confirms they have legal authority to grant the rights described in this policy on behalf of the minor.',
    },
    {
        num: '07',
        icon: <XCircle size={18} color="#E2C286" />,
        title: 'Withdrawal of consent',
        text: 'You may withdraw consent for future use of your images or videos by submitting a written request to info@glitzandglamours.com. Previously published content cannot always be removed from all platforms, but we will make reasonable efforts to stop future use going forward.',
    },
    {
        num: '08',
        icon: <Scale size={18} color="#ff8ab8" />,
        title: 'Governing law',
        text: 'This policy is governed by the laws of California, United States. Any disputes shall be resolved in the courts of that jurisdiction.',
    },
];

export default function ImagePolicyPage() {
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
                .imgpol-shell {
                    max-width: 920px;
                    margin: 0 auto;
                }
                .imgpol-pill-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .imgpol-nav-pill {
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
                .imgpol-clause-card {
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
                .imgpol-clause-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 138, 184, 0.32);
                }
                .imgpol-footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .imgpol-footer-link {
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
                .imgpol-footer-link:hover {
                    background: rgba(255, 45, 120, 0.12);
                    border-color: rgba(255, 138, 184, 0.4);
                    color: #ffffff;
                }
                @media (max-width: 640px) {
                    .imgpol-hero-card {
                        padding: 26px 20px !important;
                    }
                    .imgpol-clause-card {
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

            <div className="imgpol-shell">
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
                        <span style={{ color: '#ff8ab8', fontWeight: 600 }}>Image Release Policy</span>
                    </div>
                </nav>

                {/* Cross-Policy Navigation Pills */}
                <nav className="imgpol-pill-bar" aria-label="Legal and studio policy pages">
                    {CROSS_POLICY_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className="imgpol-nav-pill"
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
                    className="imgpol-hero-card"
                    style={{
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '26px',
                        padding: '38px 36px',
                        marginBottom: '28px',
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
                        <Camera size={14} color="#ff8ab8" />
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
                            Optional Photo &amp; Video Consent
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
                        Image Usage &amp;{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #ff8ab8 0%, #E2C286 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Release Policy
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
                        Applies only if you separately opt in to photo/video consent through this website, your booking
                        form, or another written consent method.
                    </p>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#dfd2d9',
                            fontSize: '13px',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        Last Updated: April 2026 · Glitz &amp; Glamour Studio · San Marcos, CA
                    </p>
                </header>

                {/* Policy Sections (01–08) */}
                <section aria-labelledby="image-policy-clauses-heading">
                    <h2
                        id="image-policy-clauses-heading"
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
                        Image Usage Terms &amp; Client Rights (01–08)
                    </h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {CLAUSES.map((clause) => (
                            <PolicyCard
                                key={clause.num}
                                num={clause.num}
                                icon={clause.icon}
                                title={clause.title}
                            >
                                <p style={{ margin: 0 }}>{clause.text}</p>
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

                    <div className="imgpol-footer-grid">
                        <Link href="/faq" className="imgpol-footer-link">
                            <HelpCircle size={16} color="#ff8ab8" />
                            <span>FAQ</span>
                        </Link>
                        <Link href="/policy" className="imgpol-footer-link">
                            <ShieldCheck size={16} color="#E2C286" />
                            <span>Studio Policies</span>
                        </Link>
                        <Link href="/waiver" className="imgpol-footer-link">
                            <FileText size={16} color="#ff8ab8" />
                            <span>Liability Waiver</span>
                        </Link>
                        <Link href="/terms" className="imgpol-footer-link">
                            <Scale size={16} color="#E2C286" />
                            <span>Terms &amp; Conditions</span>
                        </Link>
                        <Link href="/privacy" className="imgpol-footer-link">
                            <Lock size={16} color="#ff8ab8" />
                            <span>Privacy Policy</span>
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
        <div className="imgpol-clause-card">
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
