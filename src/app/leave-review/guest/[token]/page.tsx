'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type PageState = 'loading' | 'splash' | 'form' | 'submitting' | 'success' | 'invalid';

type TokenData = {
    guestName: string;
    isFirstVisit: boolean;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map(s => {
                const filled = s <= (hovered || value);
                return (
                    <button key={s} type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 'clamp(36px,10vw,48px)',
                            filter: filled ? 'none' : 'grayscale(1) opacity(0.25)',
                            transform: filled ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.15s', padding: '4px', lineHeight: 1,
                        }}
                        aria-label={`${s} star`}
                    >⭐</button>
                );
            })}
        </div>
    );
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

const BENEFITS = [
    { icon: '🐱', title: 'Hello Kitty Loyalty Card', desc: 'Collect stamps and earn a FREE nail set after 10 visits' },
    { icon: '🎂', title: 'Birthday Surprise', desc: 'Unlock a special birthday spin reward every year' },
    { icon: '📅', title: 'Booking History', desc: 'Track all your past appointments in one place' },
    { icon: '🎟️', title: 'Exclusive Perks', desc: 'First access to promotions and insider rewards' },
];

export default function GuestReviewPage() {
    const params = useParams();
    const token = params.token as string;

    const [pageState, setPageState] = useState<PageState>('loading');
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [invalidReason, setInvalidReason] = useState('');

    // Form state
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');

    const validate = useCallback(async () => {
        try {
            const res = await fetch(`/api/reviews/guest-token?token=${token}`);
            const d = await res.json();
            if (d.valid) {
                setTokenData({ guestName: d.guestName, isFirstVisit: d.isFirstVisit });
                setDisplayName(d.guestName);
                setPageState('splash');
            } else {
                const reasons: Record<string, string> = {
                    not_found: 'This review link is invalid or has expired.',
                    already_used: 'This review link has already been used — thanks for your review! 💖',
                    expired: 'This review link has expired (valid for 7 days).',
                };
                setInvalidReason(reasons[d.reason] || 'Something went wrong with this link.');
                setPageState('invalid');
            }
        } catch {
            setInvalidReason('Could not load this page. Please try again.');
            setPageState('invalid');
        }
    }, [token]);

    useEffect(() => { validate(); }, [validate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (rating === 0) { setError('Please select a star rating.'); return; }
        if (text.trim().length < 10) { setError('Please write at least 10 characters.'); return; }

        setPageState('submitting');
        try {
            const res = await fetch('/api/reviews/guest-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, rating, text: text.trim(), displayName: displayName.trim() || tokenData?.guestName }),
            });
            const d = await res.json();
            if (!res.ok) {
                setError(d.error || 'Failed to submit. Please try again.');
                setPageState('form');
                return;
            }
            setPageState('success');
        } catch {
            setError('Network error. Please try again.');
            setPageState('form');
        }
    }

    const firstName = tokenData?.guestName.trim().split(' ')[0] || 'there';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #0A0A0A; font-family: 'Poppins', sans-serif; min-height: 100dvh; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
                .skip-btn:hover { opacity: 0.7; }
                .review-btn:active { transform: scale(0.97); }
                textarea:focus { outline: none; border-color: #FF2D78 !important; }
                input:focus { outline: none; border-color: #FF2D78 !important; }
            `}</style>

            <div style={{
                minHeight: '100dvh', background: '#0A0A0A',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'flex-start', padding: 'clamp(24px,6vw,48px) 16px',
            }}>
                {/* Logo */}
                <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                    <div style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 900,
                        fontSize: 'clamp(22px,6vw,28px)',
                        background: 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>Glitz & Glamour</div>
                    <p style={{ color: '#444', fontSize: '12px', marginTop: '4px' }}>812 Frances Dr, Vista, CA 92083</p>
                </div>

                <div style={{ width: '100%', maxWidth: '440px' }}>

                    {/* LOADING */}
                    {pageState === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '50%',
                                border: '3px solid rgba(255,45,120,0.2)', borderTopColor: '#FF2D78',
                                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
                            }} />
                            <p style={{ color: '#444', fontSize: '13px' }}>Loading your review link…</p>
                        </div>
                    )}

                    {/* INVALID */}
                    {pageState === 'invalid' && (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px', padding: '40px 28px', textAlign: 'center',
                            animation: 'slideUp 0.4s ease',
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
                            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '20px', marginBottom: '10px' }}>Link Unavailable</h2>
                            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>{invalidReason}</p>
                            <Link href="/" style={{
                                display: 'inline-block', padding: '12px 28px',
                                background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)',
                                borderRadius: '50px', color: '#FF2D78',
                                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                            }}>← Back to Glitz & Glamour</Link>
                        </div>
                    )}

                    {/* SPLASH — Sign-up pitch */}
                    {pageState === 'splash' && tokenData && (
                        <div style={{ animation: 'slideUp 0.4s ease' }}>
                            {/* Hero card */}
                            <div style={{
                                background: 'linear-gradient(145deg,#1a0a14,#110a18)',
                                border: '1px solid rgba(255,45,120,0.25)',
                                borderRadius: '24px', padding: 'clamp(24px,6vw,36px)',
                                marginBottom: '14px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '52px', marginBottom: '12px' }}>💅</div>
                                <h1 style={{
                                    color: '#fff', fontWeight: 900,
                                    fontSize: 'clamp(20px,6vw,26px)', marginBottom: '8px', lineHeight: 1.2,
                                }}>
                                    Hey {firstName}, create a free account!
                                </h1>
                                <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                                    Join the Glitz & Glamour family and unlock exclusive perks — takes 10 seconds with Google.
                                </p>

                                {/* Benefits */}
                                <div style={{ display: 'grid', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
                                    {BENEFITS.map(b => (
                                        <div key={b.title} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: '12px', padding: '12px 14px',
                                        }}>
                                            <span style={{ fontSize: '22px', flexShrink: 0 }}>{b.icon}</span>
                                            <div>
                                                <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{b.title}</p>
                                                <p style={{ color: '#555', fontSize: '12px', lineHeight: 1.5 }}>{b.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Google Sign-in */}
                                <Link
                                    href={`/sign-in?callbackUrl=/leave-review/guest/${token}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        width: '100%', padding: '14px',
                                        background: '#fff', borderRadius: '14px',
                                        color: '#111', fontSize: '15px', fontWeight: 700,
                                        textDecoration: 'none', marginBottom: '12px',
                                        transition: 'opacity 0.2s',
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign up with Google
                                </Link>

                                {/* Skip */}
                                <button
                                    className="skip-btn"
                                    onClick={() => setPageState('form')}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#555', fontSize: '13px', fontWeight: 500,
                                        padding: '8px', width: '100%', transition: 'opacity 0.2s',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Skip and take me to the review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* REVIEW FORM */}
                    {(pageState === 'form' || pageState === 'submitting') && tokenData && (
                        <div style={{ animation: 'slideUp 0.4s ease' }}>
                            {tokenData.isFirstVisit && (
                                <div style={{
                                    background: 'linear-gradient(135deg,rgba(255,45,120,0.15),rgba(255,107,168,0.06))',
                                    border: '1px solid rgba(255,45,120,0.3)',
                                    borderRadius: '16px', padding: '14px 18px',
                                    marginBottom: '16px', textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: '18px', marginBottom: '4px' }}>🎁</p>
                                    <p style={{ color: '#FF2D78', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>First Visit Perk!</p>
                                    <p style={{ color: '#bbb', fontSize: '12px', lineHeight: 1.5 }}>
                                        Leave your review and get <strong style={{ color: '#FF2D78' }}>$10 OFF</strong> your next appointment!
                                    </p>
                                </div>
                            )}

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px', padding: 'clamp(22px,6vw,34px)',
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                                    <h1 style={{
                                        color: '#fff', fontWeight: 800,
                                        fontSize: 'clamp(18px,5vw,23px)', marginBottom: '6px',
                                    }}>
                                        How was your experience? 💅
                                    </h1>
                                    <p style={{ color: '#555', fontSize: '13px' }}>Glitz & Glamour · Vista, CA</p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {/* Stars */}
                                    <div style={{ textAlign: 'center' }}>
                                        <StarRating value={rating} onChange={setRating} />
                                        {rating > 0 && (
                                            <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>
                                                {STAR_LABELS[rating]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label style={{
                                            display: 'block', color: '#777', fontSize: '11px',
                                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px',
                                        }}>Your Name</label>
                                        <input
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            placeholder="How should we credit you?"
                                            style={{
                                                width: '100%', background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', padding: '12px 14px',
                                                color: '#fff', fontSize: '14px',
                                                fontFamily: 'Poppins, sans-serif',
                                                transition: 'border-color 0.2s',
                                            }}
                                        />
                                    </div>

                                    {/* Review text */}
                                    <div>
                                        <label style={{
                                            display: 'block', color: '#777', fontSize: '11px',
                                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px',
                                        }}>Your Review</label>
                                        <textarea
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            placeholder="Tell us about your experience — what did you love?"
                                            rows={5}
                                            disabled={pageState === 'submitting'}
                                            style={{
                                                width: '100%', resize: 'vertical',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', padding: '12px 14px',
                                                color: '#fff', fontSize: '14px',
                                                fontFamily: 'Poppins, sans-serif',
                                                lineHeight: 1.6, minHeight: '120px',
                                                transition: 'border-color 0.2s',
                                            }}
                                        />
                                        <p style={{ color: '#333', fontSize: '11px', marginTop: '4px', textAlign: 'right' }}>
                                            {text.length}/800
                                        </p>
                                    </div>

                                    {error && (
                                        <div style={{
                                            background: 'rgba(255,45,120,0.08)',
                                            border: '1px solid rgba(255,45,120,0.25)',
                                            borderRadius: '10px', padding: '11px 14px',
                                        }}>
                                            <p style={{ color: '#FF2D78', fontSize: '13px' }}>{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={pageState === 'submitting'}
                                        className="review-btn"
                                        style={{
                                            padding: '15px',
                                            background: pageState === 'submitting'
                                                ? 'rgba(255,45,120,0.4)'
                                                : 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                                            border: 'none', borderRadius: '14px',
                                            color: '#fff', fontSize: '15px', fontWeight: 700,
                                            cursor: pageState === 'submitting' ? 'not-allowed' : 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            transition: 'all 0.2s', letterSpacing: '0.3px',
                                        }}
                                    >
                                        {pageState === 'submitting' ? 'Submitting…' : tokenData.isFirstVisit ? 'Submit & Claim My $10 Code 🎁' : 'Submit My Review ⭐'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {pageState === 'success' && (
                        <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px', padding: '40px 28px', marginBottom: '20px',
                            }}>
                                <div style={{ fontSize: '56px', marginBottom: '16px' }}>💖</div>
                                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(20px,6vw,26px)', marginBottom: '10px' }}>
                                    Thank you so much!
                                </h2>
                                <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '28px' }}>
                                    Your review means the world to JoJany and helps other clients discover Glitz & Glamour. ✨
                                </p>

                                {/* Upsell to create account */}
                                <div style={{
                                    background: 'rgba(255,45,120,0.06)',
                                    border: '1px solid rgba(255,45,120,0.2)',
                                    borderRadius: '16px', padding: '18px',
                                    marginBottom: '20px', textAlign: 'left',
                                }}>
                                    <p style={{ color: '#FF2D78', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                                        💅 Want to earn loyalty stamps?
                                    </p>
                                    <p style={{ color: '#666', fontSize: '12px', lineHeight: 1.6, marginBottom: '14px' }}>
                                        Create a free account to collect stamps, track bookings, and get exclusive birthday perks.
                                    </p>
                                    <Link href="/sign-in" style={{
                                        display: 'block', textAlign: 'center', padding: '11px',
                                        background: 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                                        borderRadius: '10px', color: '#fff',
                                        textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                                    }}>
                                        Create My Free Account →
                                    </Link>
                                </div>

                                <Link href="/" style={{ color: '#444', fontSize: '13px', textDecoration: 'none' }}>
                                    ← Back to Glitz & Glamour
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
