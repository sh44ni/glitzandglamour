'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type PageState = 'loading' | 'valid' | 'invalid' | 'submitting' | 'success';

type ValidationData = {
    isFirstVisit: boolean;
    customerName: string;
    service: string;
    bookingId: string;
    hasAccount: boolean;
    userImage: string | null;
};

type SuccessData = {
    isFirstVisit: boolean;
    discountCode: string | null;
    customerName: string;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map(s => {
                const filled = s <= (hovered || value);
                return (
                    <button
                        key={s}
                        type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 'clamp(36px, 10vw, 48px)',
                            filter: filled ? 'none' : 'grayscale(1) opacity(0.3)',
                            transform: filled ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s',
                            padding: '4px',
                            lineHeight: 1,
                        }}
                        aria-label={`${s} star`}
                    >
                        ⭐
                    </button>
                );
            })}
        </div>
    );
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

function DiscountPopup({ code, customerName, onClose }: { code: string; customerName: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const firstName = customerName.trim().split(' ')[0];

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch { }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            animation: 'fadeIn 0.3s ease',
        }}>
            <div style={{
                background: 'linear-gradient(145deg,#1a0a14,#130c18)',
                border: '1px solid rgba(255,45,120,0.35)',
                borderRadius: '28px', padding: '36px 28px', textAlign: 'center',
                maxWidth: '380px', width: '100%',
                boxShadow: '0 0 60px rgba(255,45,120,0.2)',
                animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}>
                {/* Confetti emoji burst */}
                <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>🎉</div>

                <h2 style={{
                    fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(20px,6vw,26px)',
                    fontWeight: 800, color: '#fff', marginBottom: '8px',
                }}>
                    You&apos;re amazing, {firstName}!
                </h2>
                <p style={{
                    fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                    color: '#aaa', marginBottom: '24px', lineHeight: 1.6,
                }}>
                    Thank you for your first visit review! Here&apos;s your exclusive<br />
                    <span style={{ color: '#FF2D78', fontWeight: 700 }}>$10 OFF</span> code for your next visit:
                </p>

                {/* Code box */}
                <div style={{
                    background: 'rgba(255,45,120,0.1)', border: '2px dashed rgba(255,45,120,0.5)',
                    borderRadius: '16px', padding: '20px',
                    marginBottom: '20px',
                }}>
                    <p style={{
                        fontFamily: 'Courier New, monospace', fontSize: 'clamp(22px,7vw,30px)',
                        fontWeight: 900, color: '#FF2D78', letterSpacing: '3px',
                        margin: 0, wordBreak: 'break-all',
                    }}>
                        {code}
                    </p>
                </div>

                <button
                    onClick={copyCode}
                    style={{
                        width: '100%', padding: '14px',
                        background: copied ? 'rgba(0,212,120,0.15)' : 'rgba(255,45,120,0.12)',
                        border: `1px solid ${copied ? 'rgba(0,212,120,0.4)' : 'rgba(255,45,120,0.3)'}`,
                        borderRadius: '12px', cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                        color: copied ? '#00D47888' : '#FF2D78', fontWeight: 600,
                        transition: 'all 0.2s', marginBottom: '12px',
                    }}
                >
                    {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>

                <p style={{
                    fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#555',
                    marginBottom: '20px', lineHeight: 1.5,
                }}>
                    Present this code at the studio when paying. One-time use only.
                </p>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '14px',
                        background: 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                        border: 'none', borderRadius: '14px', cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif', fontSize: '15px',
                        color: '#fff', fontWeight: 700,
                    }}
                >
                    Awesome, got it! 💅
                </button>
            </div>
        </div>
    );
}

export default function LeaveReviewPage() {
    const params = useParams();
    const token = params.token as string;

    const [pageState, setPageState] = useState<PageState>('loading');
    const [invalidReason, setInvalidReason] = useState('');
    const [data, setData] = useState<ValidationData | null>(null);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const [showCodePopup, setShowCodePopup] = useState(false);

    // Form state
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const validate = useCallback(async () => {
        try {
            const res = await fetch(`/api/reviews/submit-token?token=${token}`);
            const d = await res.json();
            if (d.valid) {
                setData(d);
                setPageState('valid');
            } else {
                const reasons: Record<string, string> = {
                    not_found: 'This review link is invalid or has expired.',
                    already_used: 'This review link has already been used.',
                    expired: 'This review link has expired (it\'s valid for 7 days).',
                    already_reviewed: 'A review has already been submitted — thank you! 💖',
                    not_completed: 'Your booking needs to be marked complete first.',
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
            const res = await fetch('/api/reviews/submit-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, rating, text: text.trim() }),
            });
            const d = await res.json();

            if (!res.ok) {
                setError(d.error || 'Failed to submit. Please try again.');
                setPageState('valid');
                return;
            }

            setSuccessData({
                isFirstVisit: d.isFirstVisit,
                discountCode: d.discountCode,
                customerName: d.customerName,
            });
            setPageState('success');
            if (d.isFirstVisit && d.discountCode) {
                setTimeout(() => setShowCodePopup(true), 600);
            }
        } catch {
            setError('Network error. Please try again.');
            setPageState('valid');
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #0A0A0A; font-family: 'Poppins', sans-serif; min-height: 100dvh; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
                .review-btn:active { transform: scale(0.97); }
                textarea:focus { outline: none; border-color: #FF2D78 !important; }
            `}</style>

            <div style={{
                minHeight: '100dvh', background: '#0A0A0A',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'flex-start', padding: 'clamp(24px,6vw,48px) 20px',
            }}>
                {/* Logo header */}
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 900,
                        fontSize: 'clamp(22px,6vw,30px)',
                        background: 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Glitz &amp; Glamour
                    </div>
                    <p style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
                        812 Frances Dr, Vista, CA 92083
                    </p>
                </div>

                <div style={{ width: '100%', maxWidth: '460px' }}>

                    {/* LOADING */}
                    {pageState === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                border: '3px solid rgba(255,45,120,0.2)',
                                borderTopColor: '#FF2D78',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 16px',
                            }} />
                            <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Loading your review link…</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* INVALID */}
                    {pageState === 'invalid' && (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px', padding: '40px 28px',
                            textAlign: 'center', animation: 'slideUp 0.4s ease',
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
                            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '20px', marginBottom: '10px' }}>
                                Link Unavailable
                            </h2>
                            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
                                {invalidReason}
                            </p>
                            <Link href="https://g.page/r/glitzandglamour/review" style={{
                                display: 'inline-block', padding: '12px 28px',
                                background: 'rgba(255,45,120,0.12)',
                                border: '1px solid rgba(255,45,120,0.3)',
                                borderRadius: '50px', color: '#FF2D78',
                                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                            }}>
                                Leave a Google Review Instead
                            </Link>
                        </div>
                    )}

                    {/* VALID — Review Form */}
                    {(pageState === 'valid' || pageState === 'submitting') && data && (
                        <div style={{ animation: 'slideUp 0.4s ease' }}>
                            {/* First visit banner */}
                            {data.isFirstVisit && (
                                <div style={{
                                    background: 'linear-gradient(135deg,rgba(255,45,120,0.15),rgba(255,107,168,0.06))',
                                    border: '1px solid rgba(255,45,120,0.3)',
                                    borderRadius: '16px', padding: '16px 20px',
                                    marginBottom: '20px', textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: '18px', marginBottom: '4px' }}>🎁</p>
                                    <p style={{ color: '#FF2D78', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                                        First Visit Perk!
                                    </p>
                                    <p style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.5 }}>
                                        Leave your review below and get <strong style={{ color: '#FF2D78' }}>$10 OFF</strong> your next appointment — your personal code appears after you submit!
                                    </p>
                                </div>
                            )}

                            {/* Card */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px', padding: 'clamp(24px,6vw,36px)',
                            }}>
                                {/* Greeting */}
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    {data.userImage && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={data.userImage} alt={data.customerName}
                                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,45,120,0.4)', marginBottom: 12 }} />
                                    )}
                                    <h1 style={{
                                        color: '#fff', fontWeight: 800,
                                        fontSize: 'clamp(18px,5vw,24px)', marginBottom: '6px',
                                    }}>
                                        How was your visit, {data.customerName.split(' ')[0]}? 💅
                                    </h1>
                                    <p style={{ color: '#666', fontSize: '13px' }}>
                                        {data.service} at Glitz &amp; Glamour
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Stars */}
                                    <div style={{ textAlign: 'center' }}>
                                        <StarRating value={rating} onChange={setRating} />
                                        {rating > 0 && (
                                            <p style={{
                                                color: '#FF2D78', fontWeight: 600, fontSize: '14px',
                                                marginTop: '4px', transition: 'opacity 0.2s',
                                            }}>
                                                {STAR_LABELS[rating]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <label style={{
                                            display: 'block', color: '#888',
                                            fontSize: '11px', fontWeight: 600,
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                            marginBottom: '8px',
                                        }}>
                                            Your Review
                                        </label>
                                        <textarea
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            placeholder="Tell us about your experience — what did you love? What made it special?"
                                            rows={5}
                                            disabled={pageState === 'submitting'}
                                            style={{
                                                width: '100%', resize: 'vertical',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '14px', padding: '14px 16px',
                                                color: '#fff', fontSize: '15px',
                                                fontFamily: 'Poppins, sans-serif',
                                                lineHeight: 1.6, minHeight: '120px',
                                                transition: 'border-color 0.2s',
                                            }}
                                        />
                                        <p style={{ color: '#444', fontSize: '12px', marginTop: '4px', textAlign: 'right' }}>
                                            {text.length}/800
                                        </p>
                                    </div>

                                    {error && (
                                        <div style={{
                                            background: 'rgba(255,45,120,0.08)',
                                            border: '1px solid rgba(255,45,120,0.25)',
                                            borderRadius: '12px', padding: '12px 16px',
                                        }}>
                                            <p style={{ color: '#FF2D78', fontSize: '13px' }}>{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={pageState === 'submitting'}
                                        className="review-btn"
                                        style={{
                                            padding: '16px',
                                            background: pageState === 'submitting'
                                                ? 'rgba(255,45,120,0.4)'
                                                : 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                                            border: 'none', borderRadius: '16px',
                                            color: '#fff', fontSize: '16px', fontWeight: 700,
                                            cursor: pageState === 'submitting' ? 'not-allowed' : 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            transition: 'all 0.2s',
                                            letterSpacing: '0.3px',
                                        }}
                                    >
                                        {pageState === 'submitting' ? 'Submitting…' : data.isFirstVisit ? 'Submit & Claim My $10 Code 🎁' : 'Submit My Review ⭐'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {pageState === 'success' && successData && (
                        <div style={{
                            textAlign: 'center', animation: 'slideUp 0.4s ease',
                        }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px', padding: '40px 28px',
                                marginBottom: '20px',
                            }}>
                                <div style={{ fontSize: '56px', marginBottom: '16px' }}>💖</div>
                                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(20px,6vw,26px)', marginBottom: '10px' }}>
                                    Thank you so much!
                                </h2>
                                <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
                                    Your review means the world to us and helps other clients discover Glitz &amp; Glamour.
                                    {successData.isFirstVisit && successData.discountCode
                                        ? " Check your $10 off code below! 🎉"
                                        : " We can't wait to see you again! 💅"
                                    }
                                </p>

                                {successData.isFirstVisit && successData.discountCode && (
                                    <button
                                        onClick={() => setShowCodePopup(true)}
                                        style={{
                                            padding: '14px 28px',
                                            background: 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                                            border: 'none', borderRadius: '50px',
                                            color: '#fff', fontSize: '15px', fontWeight: 700,
                                            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        🎁 View My $10 Off Code
                                    </button>
                                )}
                            </div>

                            <Link href="/" style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}>
                                ← Back to Glitz &amp; Glamour
                            </Link>
                        </div>
                    )}

                </div>
            </div>

            {/* Discount Code Popup */}
            {showCodePopup && successData?.discountCode && (
                <DiscountPopup
                    code={successData.discountCode}
                    customerName={successData.customerName}
                    onClose={() => setShowCodePopup(false)}
                />
            )}
        </>
    );
}
