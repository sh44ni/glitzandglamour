'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    Lock,
    Sparkles,
    HeartPulse,
    Calendar,
    LogIn,
    CheckCircle2,
    FileText,
    Phone,
} from 'lucide-react';

const S = { fontFamily: 'Poppins, sans-serif' } as React.CSSProperties;

const HEALTH_QUESTIONS: { key: string; q: string }[] = [
    { key: 'pregnant', q: 'Pregnant or breastfeeding?' },
    { key: 'accutane', q: 'Used Accutane / isotretinoin in the past 12 months?' },
    { key: 'retinoids', q: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?' },
    { key: 'botox', q: 'Had Botox, fillers, or injections in the past 2 weeks?' },
    { key: 'surgery', q: 'Had surgery or medical procedures in the past 6 months?' },
    { key: 'infections', q: 'Any active skin infections, open wounds, or cold sores?' },
    { key: 'autoimmune', q: 'Any autoimmune conditions, diabetes, or circulatory issues?' },
    { key: 'hsv', q: 'History of cold sores (HSV)?' },
    { key: 'pacemaker', q: 'Pacemaker or implanted medical device?' },
];

const SAFETY_PROTOCOLS = [
    {
        title: 'Active Skincare & Retinoid Screening',
        desc: 'We screen for isotretinoin (Accutane), topical retinoids, AHAs, and BHAs prior to waxing and enzyme facials to protect the skin barrier from lifting or sensitivity.',
    },
    {
        title: 'Allergy & Adhesive Patch Readiness',
        desc: 'Any known reactions to cyanoacrylate lash adhesives, acrylates, latex, essential oils, or botanical extracts are flagged directly for your licensed specialist.',
    },
    {
        title: 'Hospital-Grade Studio Sanitation',
        desc: 'All non-porous implements undergo EPA-registered bactericidal, fungicidal, and virucidal disinfection, while single-use buffers and waxing applicators are never double-dipped or reused.',
    },
    {
        title: 'Encrypted & Strictly Confidential',
        desc: 'Your intake responses are restricted exclusively to licensed studio staff at Glitz & Glamour Studio for treatment customization and safety compliance.',
    },
];

function Section({ title }: { title: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
            <h2
                style={{
                    ...S,
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#ff8ab8',
                    textTransform: 'uppercase',
                    letterSpacing: '1.3px',
                    whiteSpace: 'nowrap',
                }}
            >
                {title}
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>
    );
}

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            }}
        >
            <span style={{ ...S, fontSize: 13.5, color: '#dfd2d9', flex: 1 }}>{label}</span>
            <span
                style={{
                    ...S,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: highlight ? '#ff8ab8' : '#ffffff',
                    textAlign: 'right',
                    maxWidth: '60%',
                }}
            >
                {value}
            </span>
        </div>
    );
}

function YesNoBadge({ val }: { val: string | undefined }) {
    if (!val) return <span style={{ ...S, fontSize: 12.5, color: '#c8b8c2' }}>Not specified</span>;
    const isYes = val === 'yes';
    return (
        <span
            style={{
                ...S,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                background: isYes ? 'rgba(255, 90, 110, 0.16)' : 'rgba(16, 224, 138, 0.14)',
                border: `1px solid ${isYes ? 'rgba(255, 138, 150, 0.45)' : 'rgba(56, 239, 160, 0.4)'}`,
                color: isYes ? '#ffb3be' : '#6ef2b8',
            }}
        >
            {isYes ? 'Yes' : 'No'}
        </span>
    );
}

export default function HealthRecordPage() {
    const { data: session, status } = useSession();
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [data, setData] = useState<any>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    useEffect(() => {
        if (status !== 'authenticated') return;
        setLoadingRecord(true);
        fetch('/api/profile/health')
            .then((r) => r.json())
            .then((d) => {
                if (d.healthForm) {
                    setData(d.healthForm.data);
                    setUpdatedAt(d.healthForm.updatedAt);
                }
                setLoadingRecord(false);
            })
            .catch(() => setLoadingRecord(false));
    }, [status]);

    const isAuthenticated = status === 'authenticated' && !!session;

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
                .health-shell {
                    max-width: 820px;
                    margin: 0 auto;
                }
                .health-protocol-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px;
                }
                @media (max-width: 680px) {
                    .health-protocol-grid {
                        grid-template-columns: 1fr;
                    }
                    .health-hero-card {
                        padding: 26px 20px !important;
                    }
                }
            `}</style>

            {/* Ambient radial glows */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '8%',
                    left: '5%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255, 45, 120, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />

            <div className="health-shell">
                {/* Breadcrumb & Back bar */}
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
                        href="/profile"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#dfd2d9',
                            textDecoration: 'none',
                            fontSize: 13.5,
                            fontWeight: 600,
                            padding: '8px 14px',
                            borderRadius: 999,
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            ...S,
                        }}
                    >
                        <ArrowLeft size={14} color="#ff8ab8" /> Back to Profile
                    </Link>

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12.5,
                            color: '#c8b8c2',
                            ...S,
                        }}
                    >
                        <Link href="/" style={{ color: '#dfd2d9', textDecoration: 'none' }}>
                            Home
                        </Link>
                        <ChevronRight size={13} color="#c8b8c2" />
                        <Link href="/profile" style={{ color: '#dfd2d9', textDecoration: 'none' }}>
                            Profile
                        </Link>
                        <ChevronRight size={13} color="#c8b8c2" />
                        <span style={{ color: '#ff8ab8', fontWeight: 600 }}>Health Record</span>
                    </div>
                </nav>

                {/* Hero Header Card */}
                <header
                    className="health-hero-card"
                    style={{
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        padding: '34px 32px',
                        marginBottom: 24,
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
                            left: 24,
                            right: 24,
                            height: 1,
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)',
                        }}
                    />

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 14px',
                            borderRadius: 999,
                            background: 'rgba(255, 45, 120, 0.12)',
                            border: '1px solid rgba(255, 138, 184, 0.3)',
                            marginBottom: 14,
                        }}
                    >
                        <ShieldCheck size={14} color="#ff8ab8" />
                        <span
                            style={{
                                ...S,
                                fontSize: 11.5,
                                fontWeight: 700,
                                letterSpacing: '1.1px',
                                textTransform: 'uppercase',
                                color: '#ff8ab8',
                            }}
                        >
                            Client Safety &amp; Hygiene Portal
                        </span>
                    </div>

                    <h1
                        style={{
                            ...S,
                            color: '#ffffff',
                            fontSize: 'clamp(1.65rem, 3.6vw, 2.35rem)',
                            fontWeight: 800,
                            lineHeight: 1.18,
                            letterSpacing: '-0.5px',
                            margin: '0 0 12px',
                        }}
                    >
                        Confidential Client Health &amp;{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #ff8ab8 0%, #E2C286 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Skin Intake Record
                        </span>{' '}
                        | Glitz &amp; Glamour Studio
                    </h1>

                    <p
                        style={{
                            ...S,
                            color: '#e2d6dc',
                            fontSize: 14.5,
                            lineHeight: 1.65,
                            margin: 0,
                            maxWidth: 680,
                        }}
                    >
                        Your health information is collected at booking and kept strictly confidential. It is only used
                        by our licensed studio specialists in San Marcos, CA to customize treatments and ensure your
                        safety during facial, lash, waxing, hair, and nail services.
                    </p>

                    {updatedAt && (
                        <p style={{ ...S, color: '#dfd2d9', fontSize: 12.5, margin: '14px 0 0' }}>
                            Last updated: {new Date(updatedAt).toLocaleString()}
                        </p>
                    )}
                </header>

                {!isAuthenticated ? (
                    /* ── Guest Preview Card (Immediate SSR + Unauthenticated View) ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <section
                            aria-labelledby="guest-portal-heading"
                            style={{
                                background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                border: '1px solid rgba(255, 138, 184, 0.28)',
                                borderRadius: 24,
                                padding: '32px 28px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 16,
                                    marginBottom: 22,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 14,
                                        background: 'rgba(255, 45, 120, 0.14)',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Lock size={22} color="#ff8ab8" />
                                </div>
                                <div style={{ flex: 1, minWidth: 240 }}>
                                    <h2
                                        id="guest-portal-heading"
                                        style={{
                                            ...S,
                                            color: '#ffffff',
                                            fontSize: 20,
                                            fontWeight: 700,
                                            margin: '0 0 6px',
                                        }}
                                    >
                                        Sign In to View Your Personal Intake Record
                                    </h2>
                                    <p
                                        style={{
                                            ...S,
                                            color: '#e2d6dc',
                                            fontSize: 14,
                                            lineHeight: 1.65,
                                            margin: 0,
                                        }}
                                    >
                                        To protect client privacy, saved medical disclosures, allergy notes, and
                                        emergency contact details are encrypted and accessible only when signed in to
                                        your Glitz &amp; Glamour member profile.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
                                <Link
                                    href="/sign-in"
                                    style={{
                                        ...S,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '13px 24px',
                                        borderRadius: 999,
                                        background: 'linear-gradient(135deg, #FF2D78 0%, #c9185b 100%)',
                                        color: '#ffffff',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        boxShadow: '0 10px 26px rgba(255, 45, 120, 0.35)',
                                    }}
                                >
                                    <LogIn size={16} /> Sign In to Member Portal
                                </Link>
                                <Link
                                    href="/book"
                                    style={{
                                        ...S,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '13px 22px',
                                        borderRadius: 999,
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.14)',
                                        color: '#f4eef1',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                    }}
                                >
                                    <Calendar size={16} color="#E2C286" /> Book Appointment &amp; Complete Intake
                                </Link>
                            </div>

                            {/* Studio Hygiene & Skin Safety Protocols */}
                            <div
                                style={{
                                    borderTop: '1px solid rgba(255, 255, 255, 0.09)',
                                    paddingTop: 24,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 14,
                                    }}
                                >
                                    <Sparkles size={16} color="#E2C286" />
                                    <h3
                                        style={{
                                            ...S,
                                            color: '#ffffff',
                                            fontSize: 16,
                                            fontWeight: 700,
                                            margin: 0,
                                        }}
                                    >
                                        Studio Hygiene &amp; Skin Safety Protocols
                                    </h3>
                                </div>

                                <div className="health-protocol-grid">
                                    {SAFETY_PROTOCOLS.map((item) => (
                                        <div
                                            key={item.title}
                                            style={{
                                                padding: '18px',
                                                borderRadius: 16,
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <CheckCircle2 size={15} color="#ff8ab8" />
                                                <h4
                                                    style={{
                                                        ...S,
                                                        color: '#ffffff',
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {item.title}
                                                </h4>
                                            </div>
                                            <p
                                                style={{
                                                    ...S,
                                                    color: '#dfd2d9',
                                                    fontSize: 13,
                                                    lineHeight: 1.6,
                                                    margin: 0,
                                                }}
                                            >
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Preview of Standard Intake Screening Checklist */}
                        <section
                            aria-labelledby="screening-checklist-heading"
                            style={{
                                background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 24,
                                padding: '28px 26px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <HeartPulse size={18} color="#ff8ab8" />
                                <h2
                                    id="screening-checklist-heading"
                                    style={{
                                        ...S,
                                        color: '#ffffff',
                                        fontSize: 18,
                                        fontWeight: 700,
                                        margin: 0,
                                    }}
                                >
                                    Standard Pre-Service Safety Screening Questions
                                </h2>
                            </div>
                            <p
                                style={{
                                    ...S,
                                    color: '#e2d6dc',
                                    fontSize: 13.5,
                                    lineHeight: 1.6,
                                    margin: '0 0 16px',
                                }}
                            >
                                Below is a preview of the confidential contraindication checklist collected when booking
                                facials, waxing, or lash extensions:
                            </p>

                            <div>
                                {HEALTH_QUESTIONS.map(({ key, q }) => (
                                    <div
                                        key={key}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '11px 0',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                        }}
                                    >
                                        <span style={{ ...S, fontSize: 13.5, color: '#e2d6dc', flex: 1, lineHeight: 1.45 }}>
                                            {q}
                                        </span>
                                        <span
                                            style={{
                                                ...S,
                                                fontSize: 11.5,
                                                fontWeight: 600,
                                                color: '#dfd2d9',
                                                padding: '3px 10px',
                                                borderRadius: 999,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            Yes / No
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    marginTop: 20,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 10,
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{ ...S, fontSize: 12.5, color: '#c8b8c2' }}>
                                    Also see our{' '}
                                    <Link href="/waiver" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>
                                        Liability Waiver
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/policy" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>
                                        Studio Policies
                                    </Link>
                                    .
                                </span>
                                <a
                                    href="tel:+17602905910"
                                    style={{
                                        ...S,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: '#E2C286',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                    }}
                                >
                                    <Phone size={14} /> Questions? Call (760) 290-5910
                                </a>
                            </div>
                        </section>
                    </div>
                ) : loadingRecord ? (
                    <div
                        style={{
                            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                            padding: '40px 24px',
                            textAlign: 'center',
                        }}
                    >
                        <p style={{ ...S, color: '#e2d6dc', fontSize: 14, margin: 0 }}>
                            Loading your confidential health intake record...
                        </p>
                    </div>
                ) : !data ? (
                    /* ── Authenticated: No record on file yet ── */
                    <div
                        style={{
                            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                            padding: '40px 28px',
                            textAlign: 'center',
                        }}
                    >
                        <AlertCircle size={36} color="#ff8ab8" style={{ marginBottom: 12 }} />
                        <h2 style={{ ...S, color: '#ffffff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                            No health record on file
                        </h2>
                        <p
                            style={{
                                ...S,
                                color: '#e2d6dc',
                                fontSize: 14,
                                lineHeight: 1.6,
                                maxWidth: 460,
                                margin: '0 auto 22px',
                            }}
                        >
                            Your health intake form will be collected the next time you book a facial, lash, or waxing
                            service.
                        </p>
                        <Link
                            href="/book"
                            style={{
                                ...S,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 24px',
                                borderRadius: 999,
                                background: 'linear-gradient(135deg, #FF2D78 0%, #c9185b 100%)',
                                color: '#ffffff',
                                fontSize: 13.5,
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            <Calendar size={15} /> Book a Service
                        </Link>
                    </div>
                ) : (
                    /* ── Authenticated: Full Health Record View ── */
                    <div
                        style={{
                            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                            padding: '26px 28px',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        {/* ── Skin type ── */}
                        <Section title="Skin & Conditions" />
                        <Row
                            label="Skin type / concerns"
                            value={data.skinTypes?.length ? data.skinTypes.join(', ') : 'None specified'}
                        />

                        {/* ── Health questions ── */}
                        <Section title="Health Questions" />
                        {HEALTH_QUESTIONS.map(({ key, q }) => (
                            <div
                                key={key}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '11px 0',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                }}
                            >
                                <span style={{ ...S, fontSize: 13.5, color: '#e2d6dc', flex: 1, lineHeight: 1.45 }}>
                                    {q}
                                </span>
                                <YesNoBadge val={data.healthQ?.[key]} />
                            </div>
                        ))}

                        {/* ── Medications ── */}
                        <Section title="Medications" />
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                borderRadius: 14,
                                padding: '14px 16px',
                            }}
                        >
                            <p
                                style={{
                                    ...S,
                                    fontSize: 13.5,
                                    color: data.medications ? '#f4eef1' : '#dfd2d9',
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}
                            >
                                {data.medications || 'None listed'}
                            </p>
                        </div>

                        {/* ── Allergies ── */}
                        <Section title="Allergies & Reactions" />
                        <Row
                            label="Known reactions to"
                            value={data.allergies?.length ? data.allergies.join(', ') : 'None known'}
                            highlight={data.allergies?.length > 0}
                        />
                        {data.allergyNotes && (
                            <div
                                style={{
                                    background: 'rgba(255, 45, 120, 0.08)',
                                    border: '1px solid rgba(255, 138, 184, 0.3)',
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                    marginTop: 10,
                                }}
                            >
                                <p
                                    style={{
                                        ...S,
                                        fontSize: 11.5,
                                        color: '#ff8ab8',
                                        fontWeight: 700,
                                        margin: '0 0 4px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.6px',
                                    }}
                                >
                                    Reaction Notes
                                </p>
                                <p style={{ ...S, fontSize: 13.5, color: '#f4eef1', lineHeight: 1.55, margin: 0 }}>
                                    {data.allergyNotes}
                                </p>
                            </div>
                        )}

                        {/* ── Emergency contact ── */}
                        <Section title="Emergency Contact" />
                        {data.emergencyName ? (
                            <>
                                <Row label="Name" value={data.emergencyName} />
                                <Row label="Phone" value={data.emergencyPhone || 'Not provided'} />
                                <Row label="Relationship" value={data.emergencyRelation || 'Not provided'} />
                            </>
                        ) : (
                            <p style={{ ...S, fontSize: 13.5, color: '#dfd2d9', margin: 0 }}>
                                No emergency contact on file.
                            </p>
                        )}

                        {/* Footer note */}
                        <div
                            style={{
                                marginTop: 28,
                                padding: '16px 18px',
                                background: 'rgba(16, 224, 138, 0.07)',
                                border: '1px solid rgba(56, 239, 160, 0.25)',
                                borderRadius: 14,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 6,
                                }}
                            >
                                <Lock size={15} color="#6ef2b8" />
                                <span style={{ ...S, fontSize: 13, color: '#6ef2b8', fontWeight: 700 }}>
                                    Confidential Studio Record
                                </span>
                            </div>
                            <p style={{ ...S, fontSize: 12.5, color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                This information is securely stored and only accessed by our licensed studio staff. To
                                update your health record, please contact the studio directly or update it during your
                                next booking.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
