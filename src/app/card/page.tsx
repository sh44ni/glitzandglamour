'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Award, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import UnverifiedBanner from '@/components/UnverifiedBanner';

const TOTAL_STAMPS = 10;

type LoyaltyCard = {
    currentStamps: number; lifetimeStamps: number; spinAvailable: boolean; spinsRedeemed: number;
    stamps: { id: string; earnedAt: string; note?: string }[];
};

export default function CardPage() {
    const { data: session, status } = useSession();
    const [card, setCard] = useState<LoyaltyCard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetch('/api/loyalty').then(r => r.json()).then(d => { setCard(d.loyaltyCard); setLoading(false); }).catch(() => setLoading(false));
        }
    }, [session]);

    if (status === 'loading' || loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '340px', height: '260px', borderRadius: '24px' }} />
        </div>
    );

    if (!session) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1, position: 'relative' }}>
            <div className="glass" style={{ maxWidth: '380px', width: '100%', padding: '48px 28px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', marginBottom: '16px' }}>
                    <CreditCard size={22} color="#FF2D78" strokeWidth={1.75} />
                </div>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff', marginBottom: '8px' }}>Your Loyalty Card</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                    Sign in to access your loyalty card and track your stamps across every visit.
                </p>
                <Link href="/sign-in" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>Sign In to Access</Link>
            </div>
        </div>
    );

    const currentStamps = card?.currentStamps ?? 0;
    const progressPct = Math.min((currentStamps / TOTAL_STAMPS) * 100, 100);

    const isUnverified = session && !(session.user as { emailVerified?: string | null })?.emailVerified;

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', maxWidth: '520px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {isUnverified && <UnverifiedBanner />}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff', marginBottom: '4px' }}>My Loyalty Card</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px' }}>Earn a stamp every visit · 10 stamps = free spin</p>
            </div>

            {/* THE CARD */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,45,120,0.08) 0%, rgba(121,40,202,0.06) 100%)',
                border: card?.spinAvailable ? '1.5px solid rgba(255,45,120,0.5)' : '1px solid rgba(255,45,120,0.2)',
                borderRadius: '20px', padding: '28px 24px', marginBottom: '16px', position: 'relative', overflow: 'hidden',
                boxShadow: card?.spinAvailable ? '0 0 48px rgba(255,45,120,0.2)' : '0 8px 40px rgba(0,0,0,0.5)',
                transition: 'all 0.4s ease',
            }}>
                {/* Top shimmer line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,45,120,0.6) 50%, transparent 100%)' }} />

                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Glitz & Glamour Studio</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px', marginTop: '2px' }}>Loyalty Card</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                            {currentStamps} / {TOTAL_STAMPS}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px' }}>{session.user?.name}</p>
                    </div>
                </div>

                {/* Stamp dots grid */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', justifyContent: 'center' }}>
                    {Array.from({ length: TOTAL_STAMPS }).map((_, i) => {
                        const earned = i < currentStamps;
                        const isLast = i === TOTAL_STAMPS - 1;
                        return (
                            <div key={i}
                                className={earned ? 'stamp-pop' : ''}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    border: earned ? '1.5px solid rgba(255,45,120,0.6)' : '1.5px dashed rgba(255,255,255,0.1)',
                                    background: earned ? 'rgba(255,45,120,0.15)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {earned ? (
                                    isLast
                                        ? <RotateCcw size={15} color="#FF2D78" strokeWidth={2} />
                                        : <CheckCircle size={14} color="#FF2D78" strokeWidth={2} />
                                ) : (
                                    isLast
                                        ? <Award size={14} color="#aaa" strokeWidth={1.5} />
                                        : null
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                        <div style={{
                            height: '100%', width: `${progressPct}%`,
                            background: 'linear-gradient(90deg, #FF2D78, #FF6BA8)',
                            borderRadius: '3px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', textAlign: 'center' }}>
                        {card?.spinAvailable
                            ? 'Free spin ready — visit me to redeem'
                            : `${TOTAL_STAMPS - currentStamps} more visit${TOTAL_STAMPS - currentStamps === 1 ? '' : 's'} until your free spin`}
                    </p>
                </div>
            </div>

            {/* Spin Ready Banner */}
            {card?.spinAvailable && (
                <div style={{
                    background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)',
                    borderRadius: '14px', padding: '18px 20px', marginBottom: '16px', textAlign: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <RotateCcw size={16} color="#FF2D78" strokeWidth={2} />
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#FF2D78', fontSize: '15px' }}>Free Spin Ready</p>
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px' }}>
                        Visit the studio and let me know — we&apos;ll spin the wheel together.
                    </p>
                </div>
            )}

            {/* Stats row */}
            {card && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {[
                        { label: 'Total Visits', value: card.stamps.length },
                        { label: 'Lifetime Stamps', value: card.lifetimeStamps },
                        { label: 'Spins Earned', value: card.spinsRedeemed },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 12px', textAlign: 'center' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '20px' }}>{value}</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px', marginTop: '2px' }}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Visit history */}
            {card?.stamps && card.stamps.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visit History</p>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {card.stamps.slice(0, 10).map((stamp, i) => (
                            <div key={stamp.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CheckCircle size={13} color="#FF2D78" strokeWidth={2} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px', fontWeight: 500 }}>
                                        Visit #{(card.stamps.length) - i}
                                    </p>
                                    {stamp.note && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>{stamp.note}</p>}
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={11} color="#aaa" />
                                    {new Date(stamp.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!card && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
                        No stamps yet. Book your first appointment to get started.
                    </p>
                    <Link href="/book" className="btn-primary">Book Now</Link>
                </div>
            )}
        </div>
    );
}
