'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAprilPromoActive, PROMO_END_DATE } from '@/lib/aprilPromo';

const SESSION_KEY = 'april_promo_dismissed_2026';

function useCountdown(target: Date) {
    const calc = () => {
        const diff = Math.max(0, target.getTime() - Date.now());
        const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs  = Math.floor((diff % (1000 * 60)) / 1000);
        return { days, hours, mins, secs };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return time;
}

export default function AprilPromoPopup() {
    const [visible, setVisible] = useState(false);
    const { days, hours, mins, secs } = useCountdown(PROMO_END_DATE);

    useEffect(() => {
        // Only show during April, and only once per browser session
        if (!isAprilPromoActive()) return;
        if (sessionStorage.getItem(SESSION_KEY)) return;

        // 1.2 second delay so page loads first
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
    }, []);

    function dismiss() {
        sessionStorage.setItem(SESSION_KEY, '1');
        setVisible(false);
    }

    if (!visible) return null;

    const pad = (n: number) => String(n).padStart(2, '0');

    const unitBox = (val: number, label: string) => (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '8px 12px', minWidth: '44px',
                fontFamily: 'Poppins, sans-serif', fontWeight: 800,
                fontSize: '20px', color: '#fff', lineHeight: 1,
            }}>{pad(val)}</div>
            <div style={{
                fontFamily: 'Poppins, sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.55)',
                marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>{label}</div>
        </div>
    );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={dismiss}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9000,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    animation: 'aprilFadeIn 0.35s ease forwards',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', pointerEvents: 'none',
            }}>
                <div style={{
                    pointerEvents: 'all',
                    width: '100%', maxWidth: '420px',
                    borderRadius: '28px', overflow: 'hidden',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,45,120,0.3)',
                    animation: 'aprilSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
                }}>

                    {/* ── HERO HEADER ── */}
                    <div style={{
                        background: 'linear-gradient(145deg, #FF2D78 0%, #CC1E5A 50%, #8B0043 100%)',
                        padding: '32px 28px 24px',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* dot pattern */}
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.07,
                            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                            backgroundSize: '24px 24px', pointerEvents: 'none',
                        }} />

                        {/* Close button */}
                        <button
                            onClick={dismiss}
                            aria-label="Close promotion"
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '16px', lineHeight: 1,
                                transition: 'background 0.2s',
                                fontFamily: 'sans-serif',
                            }}
                            onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
                        >
                            ✕
                        </button>

                        {/* Label */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(255,255,255,0.15)', borderRadius: '50px',
                            padding: '5px 14px', marginBottom: '14px',
                        }}>
                            <span style={{ fontSize: '13px' }}>🌸</span>
                            <span style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
                                color: '#fff', textTransform: 'uppercase', letterSpacing: '1.5px',
                            }}>April Special 2026</span>
                        </div>

                        <h2 style={{
                            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
                            fontSize: 'clamp(1.4rem, 5vw, 1.9rem)',
                            color: '#fff', lineHeight: 1.15, margin: '0 0 8px',
                        }}>
                            Fixed Prices<br />This Month Only ✨
                        </h2>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.8)',
                            fontSize: '14px', margin: 0,
                        }}>
                            Book in April &amp; lock in your rate — no surprises.
                        </p>
                    </div>

                    {/* ── BODY ── */}
                    <div style={{ background: '#161616', padding: '24px 28px 28px' }}>

                        {/* Deal cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { emoji: '💅', service: 'Pedicure Special', price: 50, desc: 'Any style, any design' },
                                { emoji: '✂️', service: "Women's Haircut Special", price: 45, desc: 'Expert finish, any style' },
                            ].map(deal => (
                                <div key={deal.service} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,45,120,0.18)',
                                    borderRadius: '16px', padding: '14px 18px',
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                        background: 'rgba(255,45,120,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '22px',
                                    }}>{deal.emoji}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                                            fontSize: '15px', color: '#fff', marginBottom: '2px',
                                        }}>{deal.service}</p>
                                        <p style={{
                                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888',
                                        }}>{deal.desc}</p>
                                    </div>
                                    <div style={{
                                        fontFamily: 'Poppins, sans-serif', fontWeight: 900,
                                        fontSize: '26px', color: '#FF2D78', flexShrink: 0,
                                        lineHeight: 1,
                                    }}>${deal.price}</div>
                                </div>
                            ))}
                        </div>

                        {/* Countdown */}
                        <div style={{
                            background: 'rgba(255,45,120,0.06)',
                            border: '1px solid rgba(255,45,120,0.15)',
                            borderRadius: '14px', padding: '14px 18px',
                            marginBottom: '20px',
                        }}>
                            <p style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF6BA8',
                                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
                                marginBottom: '10px', textAlign: 'center',
                            }}>⏱ Offer ends in</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'flex-start' }}>
                                {unitBox(days, 'days')}
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: 'rgba(255,255,255,0.3)', marginTop: '7px' }}>:</span>
                                {unitBox(hours, 'hrs')}
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: 'rgba(255,255,255,0.3)', marginTop: '7px' }}>:</span>
                                {unitBox(mins, 'min')}
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: 'rgba(255,255,255,0.3)', marginTop: '7px' }}>:</span>
                                {unitBox(secs, 'sec')}
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <Link
                            href="/book"
                            onClick={dismiss}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', width: '100%', padding: '15px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)',
                                border: 'none', borderRadius: '50px', cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px',
                                color: '#fff', textDecoration: 'none',
                                boxShadow: '0 8px 32px rgba(255,45,120,0.4)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                marginBottom: '10px',
                            }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(255,45,120,0.55)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(255,45,120,0.4)'; }}
                        >
                            💅 Book Your Appointment
                        </Link>

                        <button
                            onClick={dismiss}
                            style={{
                                display: 'block', width: '100%', padding: '10px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#555',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={e => (e.currentTarget.style.color = '#888')}
                            onMouseOut={e => (e.currentTarget.style.color = '#555')}
                        >
                            Maybe later
                        </button>

                        <p style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444',
                            textAlign: 'center', marginTop: '4px',
                        }}>
                            April only · glitzandglamours.com · While availability lasts
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes aprilFadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes aprilSlideUp {
                    from { opacity: 0; transform: translateY(32px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
}
