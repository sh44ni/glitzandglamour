'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

/* ─── Offer configuration ─── */
const OFFER_END = new Date('2026-06-01T00:00:00'); // Midnight June 1 = May 31 deadline
const SESSION_KEY = 'se_popup_dismissed_may2026';

function isOfferActive(): boolean {
    return Date.now() < OFFER_END.getTime();
}

/* ─── Countdown hook ─── */
function useCountdown(target: Date) {
    const calc = useCallback(() => {
        const diff = Math.max(0, target.getTime() - Date.now());
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            secs: Math.floor((diff % (1000 * 60)) / 1000),
        };
    }, [target]);
    const [t, setT] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);
    return t;
}

/* ─── Perks ─── */
const PERKS = [
    { emoji: '💅', text: 'Free lashes with select glam bundles' },
    { emoji: '🎁', text: 'Mini touch-up kit for qualifying event bookings' },
    { emoji: '🎉', text: 'Priority timeline planning for groups & full event glam' },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function SpecialEventPopup({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void } = {}) {
    const [visible, setVisible] = useState(false);
    const { days, hours, mins, secs } = useCountdown(OFFER_END);
    const pathname = usePathname();

    // Auto-show on first visit (once per session) — only on Home and Special Events pages
    useEffect(() => {
        if (!isOfferActive()) return;
        if (typeof window === 'undefined') return;
        if (sessionStorage.getItem(SESSION_KEY)) return;
        // Only auto-show on Home page and Special Events page
        if (pathname !== '/' && pathname !== '/special-events') return;
        const t = setTimeout(() => setVisible(true), 1400);
        return () => clearTimeout(t);
    }, [pathname]);

    // Force-open from external trigger (e.g. "Learn More" button)
    useEffect(() => {
        if (forceOpen) setVisible(true);
    }, [forceOpen]);

    // Lock scroll + ESC key
    useEffect(() => {
        if (!visible) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', handleKey);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    function dismiss() {
        sessionStorage.setItem(SESSION_KEY, '1');
        setVisible(false);
        onClose?.();
    }

    function goToInquiry() {
        dismiss();
        document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' });
    }

    if (!visible) return null;

    const pad = (n: number) => String(n).padStart(2, '0');

    /* compact countdown digit */
    const digit = (val: number, label: string) => (
        <div style={{ textAlign: 'center' }}>
            <div className="se-digit" style={{
                position: 'relative',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,45,120,0.25)',
                borderRadius: '10px',
                padding: '6px 10px',
                minWidth: '38px',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900, fontSize: '18px',
                color: '#fff', lineHeight: 1,
                letterSpacing: '-0.5px', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,45,120,0.2) 0%, transparent 70%)',
                    animation: 'sePulse 2s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>{pad(val)}</span>
            </div>
            <div style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '8px',
                color: 'rgba(255,255,255,0.45)', marginTop: '3px',
                textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600,
            }}>{label}</div>
        </div>
    );

    const colon = (
        <span style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: '16px',
            color: 'rgba(255,45,120,0.5)', marginTop: '5px',
            animation: 'seBlink 1s step-end infinite',
        }}>:</span>
    );

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={dismiss}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9000,
                    background: 'rgba(0,0,0,0.78)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    animation: 'seFadeIn 0.35s ease forwards',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px', pointerEvents: 'none',
            }}>
                <div style={{
                    pointerEvents: 'all',
                    width: '100%', maxWidth: '400px',
                    borderRadius: '24px', overflow: 'hidden',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,45,120,0.2)',
                    animation: 'seSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
                    maxHeight: '90vh', overflowY: 'auto',
                }}>
                    {/* ─── HEADER ─── */}
                    <div style={{
                        background: 'linear-gradient(145deg, #1a0a10 0%, #0d0d0d 100%)',
                        padding: '22px 22px 18px',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* subtle shimmer pattern */}
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.04,
                            backgroundImage: 'radial-gradient(circle, #FF2D78 1px, transparent 1px)',
                            backgroundSize: '28px 28px', pointerEvents: 'none',
                        }} />

                        {/* Close button */}
                        <button
                            onClick={dismiss}
                            aria-label="Close popup"
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '14px', lineHeight: 1,
                                transition: 'background 0.2s', fontFamily: 'sans-serif',
                            }}
                            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        >
                            ✕
                        </button>

                        {/* Label */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.25)',
                            borderRadius: '50px', padding: '4px 12px', marginBottom: '12px',
                        }}>
                            <span style={{
                                fontFamily: "'Poppins', sans-serif", fontSize: '9px', fontWeight: 700,
                                color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1.5px',
                            }}>Limited-Time Event Offer</span>
                        </div>

                        {/* Heading */}
                        <h2 style={{
                            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
                            fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',
                            color: '#fff', lineHeight: 1.18, margin: '0 0 10px',
                        }}>
                            Prom, Quinceañera {'&'}<br />
                            Wedding Dates{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontStyle: 'italic',
                            }}>Fill Fast</span>
                        </h2>

                        {/* Subtext */}
                        <p style={{
                            fontFamily: "'Poppins', sans-serif", color: 'rgba(255,255,255,0.7)',
                            fontSize: '12px', lineHeight: 1.65, margin: '0 0 8px',
                        }}>
                            Submit your event inquiry by May 31st and receive a special booking bonus for qualifying event services.
                        </p>

                        {/* Planning ahead notice */}
                        <p style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '11px', lineHeight: 1.55,
                            color: '#FF6BA8', margin: 0,
                        }}>
                            Planning ahead?{' '}
                            <span style={{ color: '#FF2D78', fontWeight: 600 }}>
                                This offer also applies to June, July, and later event dates
                            </span>{' '}
                            — as long as your inquiry is submitted by May 31st.
                        </p>
                    </div>

                    {/* ─── BODY ─── */}
                    <div style={{ background: '#111', padding: '16px 22px 22px' }}>

                        {/* Perks */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '14px' }}>
                            {PERKS.map((p, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '12px', padding: '10px 14px',
                                    transition: 'border-color 0.3s',
                                }}
                                    onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(255,45,120,0.25)')}
                                    onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                                >
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                        background: 'rgba(255,45,120,0.08)',
                                        border: '1px solid rgba(255,45,120,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px',
                                    }}>{p.emoji}</div>
                                    <p style={{
                                        fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                                        fontSize: '12px', color: '#ddd', margin: 0, lineHeight: 1.45,
                                    }}>{p.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Countdown */}
                        <div style={{
                            background: 'rgba(255,45,120,0.05)',
                            border: '1px solid rgba(255,45,120,0.15)',
                            borderRadius: '14px', padding: '12px 14px',
                            marginBottom: '16px',
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif", fontSize: '9px', color: '#FF6BA8',
                                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                                marginBottom: '8px', textAlign: 'center',
                            }}>⏰ Inquiry deadline</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'flex-start' }}>
                                {digit(days, 'days')}
                                {colon}
                                {digit(hours, 'hrs')}
                                {colon}
                                {digit(mins, 'min')}
                                {colon}
                                {digit(secs, 'sec')}
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={goToInquiry}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', width: '100%', padding: '13px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)',
                                border: 'none', borderRadius: '50px', cursor: 'pointer',
                                fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '14px',
                                color: '#fff', textDecoration: 'none',
                                boxShadow: '0 8px 32px rgba(255,45,120,0.4)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                marginBottom: '8px',
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,45,120,0.55)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,45,120,0.4)'; }}
                        >
                            Submit Event Inquiry
                        </button>

                        <button
                            onClick={dismiss}
                            style={{
                                display: 'block', width: '100%', padding: '8px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: "'Poppins', sans-serif", fontSize: '12px', color: '#555',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={e => (e.currentTarget.style.color = '#888')}
                            onMouseOut={e => (e.currentTarget.style.color = '#555')}
                        >
                            No thanks, I&apos;ll do it later
                        </button>

                        <p style={{
                            fontFamily: "'Poppins', sans-serif", fontSize: '9.5px', color: '#444',
                            textAlign: 'center', marginTop: '2px', lineHeight: 1.55,
                        }}>
                            Valid for new event inquiries only. Offer applies to inquiries submitted by May 31st, even if the event date is later. Retainer required to officially secure date. Bonus depends on service type, party size, and availability.
                        </p>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes seFadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes seSlideUp {
                    from { opacity: 0; transform: translateY(36px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes sePulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                @keyframes seBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .se-digit {
                    transition: transform 0.15s ease;
                }
            `}</style>
        </>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Inline Countdown Strip — render on the Special Events page itself
 *  (between hero and events section, or wherever you want urgency)
 * ═══════════════════════════════════════════════════════════════════════════ */
export function EventCountdownStrip({ onLearnMore }: { onLearnMore?: () => void }) {
    const { days, hours, mins, secs } = useCountdown(OFFER_END);

    if (!isOfferActive()) return null;

    const pad = (n: number) => String(n).padStart(2, '0');

    const unit = (val: number, label: string) => (
        <div style={{ textAlign: 'center' }}>
            <div
                className="se-strip-digit"
                style={{
                    background: 'rgba(255,45,120,0.1)',
                    border: '1px solid rgba(255,45,120,0.25)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    minWidth: '44px',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 900,
                    fontSize: '20px',
                    color: '#FF2D78',
                    lineHeight: 1,
                    letterSpacing: '-0.5px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,45,120,0.15) 0%, transparent 70%)',
                    animation: 'sePulse 2s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>{pad(val)}</span>
            </div>
            <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '9px',
                color: 'rgba(255,255,255,0.4)',
                marginTop: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontWeight: 600,
            }}>{label}</div>
        </div>
    );

    const scrollToInquiry = () => document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div style={{
            maxWidth: '1100px', margin: '0 auto',
            padding: '0 20px',
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,45,120,0.06) 0%, rgba(139,0,67,0.08) 100%)',
                border: '1px solid rgba(255,45,120,0.18)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
            }}>
                {/* Left — text */}
                <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                    <p style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '10px', fontWeight: 700,
                        color: '#FF2D78', textTransform: 'uppercase',
                        letterSpacing: '2px', marginBottom: '6px',
                    }}>⏰ Limited-Time Event Offer</p>
                    <p style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '15px', fontWeight: 700,
                        color: '#fff', lineHeight: 1.4, marginBottom: '4px',
                    }}>
                        Submit your inquiry by <span style={{ color: '#FF2D78' }}>May 31st</span> for bonus perks
                    </p>
                    <p style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '12px', color: '#888',
                    }}>
                        Even if your event is months away
                    </p>
                </div>

                {/* Center — countdown */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    {unit(days, 'days')}
                    <span style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 900, fontSize: '20px',
                        color: 'rgba(255,45,120,0.4)',
                        marginTop: '6px',
                        animation: 'seBlink 1s step-end infinite',
                    }}>:</span>
                    {unit(hours, 'hrs')}
                    <span style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 900, fontSize: '20px',
                        color: 'rgba(255,45,120,0.4)',
                        marginTop: '6px',
                        animation: 'seBlink 1s step-end infinite',
                    }}>:</span>
                    {unit(mins, 'min')}
                    <span style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 900, fontSize: '20px',
                        color: 'rgba(255,45,120,0.4)',
                        marginTop: '6px',
                        animation: 'seBlink 1s step-end infinite',
                    }}>:</span>
                    {unit(secs, 'sec')}
                </div>

                {/* Right — CTAs */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={scrollToInquiry}
                        className="btn-primary btn-pulse"
                        style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '13px', fontWeight: 700,
                            padding: '12px 24px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Inquire Now →
                    </button>
                    {onLearnMore && (
                        <button
                            onClick={onLearnMore}
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: '12px', fontWeight: 600,
                                padding: '10px 18px',
                                whiteSpace: 'nowrap',
                                background: 'rgba(255,45,120,0.08)',
                                border: '1px solid rgba(255,45,120,0.25)',
                                borderRadius: '50px',
                                color: '#FF2D78',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,45,120,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.4)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,45,120,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,45,120,0.25)'; }}
                        >
                            Learn More
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes sePulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                @keyframes seBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
