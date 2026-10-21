'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Sparkles,
    Scissors,
    Sun,
    Eye,
    FileText,
    MapPin,
    HelpCircle,
    Calendar,
    ShieldCheck,
    Scale,
    Lock,
    Camera,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function AccordionItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div
            className="faq-card-item"
            style={{
                borderRadius: '18px',
                overflow: 'hidden',
                marginBottom: '12px',
                border: isOpen
                    ? '1px solid rgba(255, 138, 184, 0.42)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                background: isOpen
                    ? 'linear-gradient(155deg, rgba(44, 18, 35, 0.95), rgba(18, 9, 15, 0.98))'
                    : 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                boxShadow: isOpen
                    ? '0 14px 34px rgba(0, 0, 0, 0.45), 0 0 24px rgba(255, 45, 120, 0.1)'
                    : '0 8px 24px rgba(0, 0, 0, 0.3)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                position: 'relative',
            }}
        >
            {/* Top specular highlight */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '16px',
                    right: '16px',
                    height: '1px',
                    background: isOpen
                        ? 'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.14), transparent)',
                    pointerEvents: 'none',
                }}
            />

            <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 600 }}>
                <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%',
                        padding: '20px 22px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        fontSize: '15.5px',
                        color: '#ffffff',
                        lineHeight: 1.45,
                    }}
                >
                    <span>{q}</span>
                    <span
                        aria-hidden="true"
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            background: isOpen ? 'rgba(255, 45, 120, 0.22)' : 'rgba(255, 255, 255, 0.06)',
                            border: isOpen
                                ? '1px solid rgba(255, 138, 184, 0.45)'
                                : '1px solid rgba(255, 255, 255, 0.12)',
                            color: isOpen ? '#ff8ab8' : '#dfd2d9',
                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease, color 0.2s ease',
                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        }}
                    >
                        <Plus size={17} />
                    </span>
                </button>
            </h3>

            <div
                style={{
                    display: isOpen ? 'block' : 'none',
                    padding: '0 22px 22px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}
            >
                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#e2d6dc',
                        fontSize: '14.5px',
                        lineHeight: 1.7,
                        margin: '14px 0 0',
                    }}
                >
                    {a}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const faqData = [
        {
            id: 'general',
            category: t('faq.categories.general'),
            shortLabel: 'Studio & Booking',
            icon: <MapPin size={20} color="#ff8ab8" />,
            questions: [
                { q: t('faq.q0_1'), a: t('faq.a0_1') },
                { q: t('faq.q0_2'), a: t('faq.a0_2') },
                { q: t('faq.q0_3'), a: t('faq.a0_3') },
                { q: t('faq.q0_4'), a: t('faq.a0_4') },
                { q: t('faq.q0_5'), a: t('faq.a0_5') },
                { q: t('faq.q0_6'), a: t('faq.a0_6') },
                { q: t('faq.q0_7'), a: t('faq.a0_7') },
                { q: t('faq.q0_8'), a: t('faq.a0_8') },
            ],
        },
        {
            id: 'nails',
            category: t('faq.categories.nails'),
            shortLabel: 'Nails & Pedicures',
            icon: <Sparkles size={20} color="#ff8ab8" />,
            questions: [
                { q: t('faq.q1_1'), a: t('faq.a1_1') },
                { q: t('faq.q1_2'), a: t('faq.a1_2') },
                { q: t('faq.q1_3'), a: t('faq.a1_3') },
                { q: t('faq.q1_4'), a: t('faq.a1_4') },
                { q: t('faq.q1_5'), a: t('faq.a1_5') },
            ],
        },
        {
            id: 'hair',
            category: t('faq.categories.hair'),
            shortLabel: 'Hair & Color',
            icon: <Scissors size={20} color="#ff8ab8" />,
            questions: [
                { q: t('faq.q2_1'), a: t('faq.a2_1') },
                { q: t('faq.q2_2'), a: t('faq.a2_2') },
                { q: t('faq.q2_3'), a: t('faq.a2_3') },
                { q: t('faq.q2_4'), a: t('faq.a2_4') },
            ],
        },
        {
            id: 'waxing',
            category: t('faq.categories.waxing'),
            shortLabel: 'Waxing',
            icon: <Sun size={20} color="#E2C286" />,
            questions: [
                { q: t('faq.q3_1'), a: t('faq.a3_1') },
                { q: t('faq.q3_2'), a: t('faq.a3_2') },
                { q: t('faq.q3_3'), a: t('faq.a3_3') },
                { q: t('faq.q3_4'), a: t('faq.a3_4') },
            ],
        },
        {
            id: 'lashes',
            category: t('faq.categories.lashes'),
            shortLabel: 'Lashes & Facials',
            icon: <Eye size={20} color="#ff8ab8" />,
            questions: [
                { q: t('faq.q4_1'), a: t('faq.a4_1') },
                { q: t('faq.q4_2'), a: t('faq.a4_2') },
                { q: t('faq.q4_3'), a: t('faq.a4_3') },
                { q: t('faq.q4_4'), a: t('faq.a4_4') },
            ],
        },
    ];

    const totalQuestions = faqData.reduce((acc, s) => acc + s.questions.length, 0);
    const visibleSections =
        activeCategory === 'all' ? faqData : faqData.filter((s) => s.id === activeCategory);
    const cleanBackLabel = t('faq.backToHome').replace(/^[←\s]+/, '');

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
                .faq-shell {
                    max-width: 960px;
                    margin: 0 auto;
                }
                .faq-filter-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 36px;
                }
                .faq-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 999px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-height: 44px;
                }
                .faq-policy-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
                    gap: 12px;
                }
                .faq-policy-link {
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
                .faq-policy-link:hover {
                    background: rgba(255, 45, 120, 0.12);
                    border-color: rgba(255, 138, 184, 0.4);
                    color: #ffffff;
                    transform: translateY(-1px);
                }
                @media (max-width: 640px) {
                    .faq-hero-card {
                        padding: 26px 20px !important;
                    }
                    .faq-concierge-card {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        padding: 24px 20px !important;
                    }
                }
            `}</style>

            {/* Ambient editorial radial glows */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '6%',
                    right: '4%',
                    width: '320px',
                    height: '320px',
                    background: 'radial-gradient(circle, rgba(255, 45, 120, 0.09) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '38%',
                    left: '3%',
                    width: '360px',
                    height: '360px',
                    background: 'radial-gradient(circle, rgba(226, 194, 134, 0.06) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />

            <div className="faq-shell">
                {/* Breadcrumb & Back Navigation */}
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
                        href="/"
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
                        <ChevronLeft size={15} color="#ff8ab8" /> {cleanBackLabel}
                    </Link>

                    <div
                        style={{
                            display: ' inline-flex',
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
                        <span style={{ color: '#ff8ab8', fontWeight: 600 }}>FAQ</span>
                    </div>
                </nav>

                {/* 2.0 Dark Glam Editorial Hero Card */}
                <header
                    className="faq-hero-card"
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
                        <HelpCircle size={14} color="#ff8ab8" />
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
                            Client Help Center · San Marcos, CA
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 800,
                            fontSize: 'clamp(2rem, 4.5vw, 3.1rem)',
                            letterSpacing: '-0.8px',
                            marginBottom: '14px',
                            lineHeight: 1.12,
                            color: '#ffffff',
                        }}
                    >
                        {t('faq.heading')}{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #ff8ab8 0%, #E2C286 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {t('faq.headingHighlight')}
                        </span>
                    </h1>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '15.5px',
                            lineHeight: 1.65,
                            maxWidth: '660px',
                            margin: '0 0 18px',
                        }}
                    >
                        {t('faq.subtext')}
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '12px',
                            paddingTop: '14px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#dfd2d9',
                                fontSize: '12.5px',
                                fontWeight: 500,
                            }}
                        >
                            {t('faq.lastUpdated')}
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.25)' }} aria-hidden="true">
                            ·
                        </span>
                        <span
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#c8b8c2',
                                fontSize: '12.5px',
                            }}
                        >
                            935 W San Marcos Blvd, Suite 101 · San Marcos, CA 92078
                        </span>
                    </div>
                </header>

                {/* Category Filter Pills */}
                <div className="faq-filter-bar" role="group" aria-label="Filter FAQ by category">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        aria-pressed={activeCategory === 'all'}
                        className="faq-pill"
                        style={{
                            background:
                                activeCategory === 'all'
                                    ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.28), rgba(226, 194, 134, 0.18))'
                                    : 'rgba(255, 255, 255, 0.04)',
                            border:
                                activeCategory === 'all'
                                    ? '1px solid rgba(255, 138, 184, 0.5)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                            color: activeCategory === 'all' ? '#ffffff' : '#dfd2d9',
                        }}
                    >
                        <Sparkles size={14} color={activeCategory === 'all' ? '#ff8ab8' : '#c8b8c2'} />
                        <span>All Topics ({totalQuestions})</span>
                    </button>

                    {faqData.map((sec) => {
                        const isActive = activeCategory === sec.id;
                        return (
                            <button
                                key={sec.id}
                                type="button"
                                onClick={() => setActiveCategory(sec.id)}
                                aria-pressed={isActive}
                                className="faq-pill"
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.28), rgba(226, 194, 134, 0.18))'
                                        : 'rgba(255, 255, 255, 0.04)',
                                    border: isActive
                                        ? '1px solid rgba(255, 138, 184, 0.5)'
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                    color: isActive ? '#ffffff' : '#dfd2d9',
                                }}
                            >
                                <span>
                                    {sec.shortLabel} ({sec.questions.length})
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* FAQ Category Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {visibleSections.map((section, idx) => (
                        <section key={section.id} id={section.id} aria-labelledby={`heading-${section.id}`}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    marginBottom: '18px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '13px',
                                            background: 'rgba(255, 45, 120, 0.12)',
                                            border: '1px solid rgba(255, 138, 184, 0.28)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {section.icon}
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                display: 'block',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                letterSpacing: '1.1px',
                                                textTransform: 'uppercase',
                                                color: '#ff8ab8',
                                            }}
                                        >
                                            Section 0{idx + 1}
                                        </span>
                                        <h2
                                            id={`heading-${section.id}`}
                                            style={{
                                                fontFamily: 'Poppins, sans-serif',
                                                fontWeight: 700,
                                                fontSize: 'clamp(1.2rem, 2.5vw, 1.45rem)',
                                                color: '#ffffff',
                                                margin: 0,
                                            }}
                                        >
                                            {section.category}
                                        </h2>
                                    </div>
                                </div>

                                <span
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#dfd2d9',
                                        padding: '4px 11px',
                                        borderRadius: '999px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {section.questions.length} Q&amp;As
                                </span>
                            </div>

                            <div>
                                {section.questions.map((faq, fIdx) => (
                                    <AccordionItem
                                        key={fIdx}
                                        q={faq.q}
                                        a={faq.a}
                                        defaultOpen={idx === 0 && fIdx === 0}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Concierge CTA Card ("Still have questions?") */}
                <section
                    className="faq-concierge-card"
                    style={{
                        marginTop: '48px',
                        padding: '28px 30px',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 138, 184, 0.25)',
                        borderRadius: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '20px',
                            right: '20px',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(226, 194, 134, 0.55), rgba(255, 138, 184, 0.55), transparent)',
                        }}
                    />

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                flexShrink: 0,
                                background: 'rgba(226, 194, 134, 0.12)',
                                border: '1px solid rgba(226, 194, 134, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FileText size={20} color="#E2C286" />
                        </div>
                        <div>
                            <h2
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700,
                                    fontSize: '18px',
                                    color: '#ffffff',
                                    margin: '0 0 6px',
                                }}
                            >
                                {t('faq.stillHaveQuestions')}
                            </h2>
                            <p
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#e2d6dc',
                                    fontSize: '14px',
                                    lineHeight: 1.65,
                                    margin: 0,
                                }}
                            >
                                {t('faq.stillHaveQuestionsText')}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flexShrink: 0 }}>
                        <Link
                            href="/book"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 22px',
                                borderRadius: '999px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #c9185b 100%)',
                                color: '#ffffff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 8px 22px rgba(255, 45, 120, 0.32)',
                            }}
                        >
                            <Calendar size={15} /> Book Appointment
                        </Link>
                        <Link
                            href="/policy"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '999px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                color: '#f4eef1',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13.5px',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            {t('faq.studioPolicies')}
                        </Link>
                    </div>
                </section>

                {/* Cross-Policy Navigation Footer */}
                <section
                    style={{
                        marginTop: '36px',
                        padding: '34px 28px',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
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
                        {t('faq.morePolicies')}
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
                        {t('faq.morePoliciesText')}
                    </p>
                    <div className="faq-policy-grid">
                        <Link href="/policy" className="faq-policy-link">
                            <ShieldCheck size={16} color="#ff8ab8" />
                            <span>{t('faq.studioPolicies')}</span>
                        </Link>
                        <Link href="/waiver" className="faq-policy-link">
                            <FileText size={16} color="#E2C286" />
                            <span>{t('faq.liabilityWaiver')}</span>
                        </Link>
                        <Link href="/terms" className="faq-policy-link">
                            <Scale size={16} color="#ff8ab8" />
                            <span>{t('faq.termsConditions')}</span>
                        </Link>
                        <Link href="/privacy" className="faq-policy-link">
                            <Lock size={16} color="#E2C286" />
                            <span>{t('faq.privacyPolicy')}</span>
                        </Link>
                        <Link href="/image-policy" className="faq-policy-link">
                            <Camera size={16} color="#ff8ab8" />
                            <span>Image Release Policy</span>
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
