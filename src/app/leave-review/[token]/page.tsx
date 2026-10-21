'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star,
    Sparkles,
    Gift,
    Copy,
    Check,
    Link2Off,
    Heart,
    MapPin,
    ArrowLeft,
    ExternalLink,
    ShieldCheck,
    MessageSquareHeart,
} from 'lucide-react';

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

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    const activeRating = hovered || value;

    return (
        <div
            role="radiogroup"
            aria-label="Select a star rating from 1 to 5"
            style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                margin: '10px 0',
                flexWrap: 'wrap',
            }}
        >
            {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= activeRating;
                return (
                    <button
                        key={s}
                        type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        aria-label={`Rate ${s} out of 5 stars (${STAR_LABELS[s]})`}
                        aria-pressed={value === s}
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: filled
                                ? 'linear-gradient(145deg, rgba(255, 138, 184, 0.2), rgba(226, 194, 134, 0.14))'
                                : 'rgba(255, 255, 255, 0.04)',
                            border: filled
                                ? '1px solid rgba(226, 194, 134, 0.55)'
                                : '1px solid rgba(255, 255, 255, 0.12)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: filled ? 'translateY(-2px) scale(1.05)' : 'scale(1)',
                            transition: 'all 0.18s ease',
                            boxShadow: filled ? '0 8px 20px rgba(255, 45, 120, 0.2)' : 'none',
                            padding: 0,
                        }}
                    >
                        <Star
                            size={26}
                            color={filled ? '#E2C286' : '#c8b8c2'}
                            fill={filled ? '#E2C286' : 'transparent'}
                            strokeWidth={1.9}
                        />
                    </button>
                );
            })}
        </div>
    );
}

function DiscountPopup({
    code,
    customerName,
    onClose,
}: {
    code: string;
    customerName: string;
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const firstName = customerName.trim().split(' ')[0] || 'Gorgeous';

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', handleKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch {}
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-modal-title"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1050,
                background: 'rgba(6, 3, 5, 0.88)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                animation: 'lrFadeIn 0.3s ease',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.96), rgba(14, 7, 12, 0.98))',
                    border: '1px solid rgba(255, 138, 184, 0.32)',
                    borderRadius: '28px',
                    padding: '36px 28px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 48px rgba(255, 45, 120, 0.18)',
                    animation: 'lrSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '12%',
                        right: '12%',
                        height: '1px',
                        background:
                            'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.6), transparent)',
                    }}
                />

                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '18px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2), rgba(226, 194, 134, 0.15))',
                        border: '1px solid rgba(255, 138, 184, 0.35)',
                        color: '#E2C286',
                    }}
                >
                    <Gift size={28} />
                </div>

                <h2
                    id="discount-modal-title"
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 'clamp(20px, 5.5vw, 25px)',
                        fontWeight: 800,
                        color: '#ffffff',
                        marginBottom: '8px',
                    }}
                >
                    You&apos;re amazing, {firstName}!
                </h2>
                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        color: '#e2d6dc',
                        marginBottom: '22px',
                        lineHeight: 1.65,
                    }}
                >
                    Thank you for your first-visit review! Here is your exclusive{' '}
                    <span style={{ color: '#ff8ab8', fontWeight: 700 }}>$10 OFF</span> reward code for your next
                    studio appointment:
                </p>

                <div
                    style={{
                        background: 'rgba(255, 45, 120, 0.1)',
                        border: '1.5px dashed rgba(255, 138, 184, 0.5)',
                        borderRadius: '16px',
                        padding: '18px',
                        marginBottom: '18px',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'Courier New, monospace',
                            fontSize: 'clamp(22px, 6.5vw, 28px)',
                            fontWeight: 900,
                            color: '#ff8ab8',
                            letterSpacing: '3px',
                            margin: 0,
                            wordBreak: 'break-all',
                        }}
                    >
                        {code}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={copyCode}
                    style={{
                        width: '100%',
                        padding: '13px 16px',
                        background: copied ? 'rgba(0, 212, 120, 0.16)' : 'rgba(255, 138, 184, 0.12)',
                        border: `1px solid ${copied ? 'rgba(0, 212, 120, 0.45)' : 'rgba(255, 138, 184, 0.35)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        color: copied ? '#6ee7b7' : '#ff8ab8',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '12px',
                    }}
                >
                    {copied ? (
                        <>
                            <Check size={16} /> Copied to Clipboard!
                        </>
                    ) : (
                        <>
                            <Copy size={16} /> Copy Reward Code
                        </>
                    )}
                </button>

                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        color: '#dfd2d9',
                        marginBottom: '20px',
                        lineHeight: 1.55,
                    }}
                >
                    Present this code at checkout during your next visit. Valid for one-time studio redemption.
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                        border: '1px solid rgba(255, 138, 184, 0.4)',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '15px',
                        color: '#ffffff',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                    }}
                >
                    <Sparkles size={16} /> Save &amp; Continue
                </button>
            </div>
        </div>,
        document.body
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
            const res = await fetch(`/api/reviews/submit-token?token=${encodeURIComponent(token)}`);
            const d = await res.json();
            if (d.valid) {
                setData(d);
                setPageState('valid');
            } else {
                const reasons: Record<string, string> = {
                    not_found: 'This personalized review invitation link is invalid or has expired.',
                    already_used: 'This review invitation link has already been used.',
                    expired: 'This review invitation link has expired (links remain active for 7 days).',
                    already_reviewed: 'A verified review has already been submitted for this appointment — thank you!',
                    not_completed: 'Your studio appointment must be marked complete before submitting a review.',
                };
                setInvalidReason(reasons[d.reason] || 'We could not verify this review invitation token.');
                setPageState('invalid');
            }
        } catch {
            setInvalidReason('Could not verify this review link right now. Please try again.');
            setPageState('invalid');
        }
    }, [token]);

    useEffect(() => {
        validate();
    }, [validate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a star rating above.');
            return;
        }
        if (text.trim().length < 10) {
            setError('Please write at least 10 characters about your visit.');
            return;
        }

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
                @keyframes lrFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes lrSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes lrSpin { to { transform: rotate(360deg); } }
                .lr-submit-btn:active { transform: scale(0.98); }
                .lr-textarea:focus { outline: none; border-color: #ff8ab8 !important; box-shadow: 0 0 0 3px rgba(255, 138, 184, 0.15); }
            `}</style>

            <section
                style={{
                    minHeight: 'calc(100dvh - 80px)',
                    background:
                        'radial-gradient(circle at 50% 0%, rgba(255, 45, 120, 0.14) 0%, rgba(32, 15, 26, 0.4) 42%, #0a0609 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: 'clamp(36px, 7vw, 72px) 16px 80px',
                    boxSizing: 'border-box',
                    width: '100%',
                    overflowX: 'hidden',
                }}
            >
                {/* 2.0 Dark Glam Editorial Header — Always rendered for immediate SSR & SEO/Accessibility */}
                <header
                    style={{
                        maxWidth: '580px',
                        width: '100%',
                        textAlign: 'center',
                        marginBottom: '28px',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.12)',
                            border: '1px solid rgba(255, 138, 184, 0.3)',
                            color: '#ff8ab8',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            marginBottom: '14px',
                        }}
                    >
                        <Sparkles size={13} color="#E2C286" />
                        Verified Client Feedback
                    </div>

                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 800,
                            fontSize: 'clamp(24px, 5.5vw, 34px)',
                            lineHeight: 1.2,
                            color: '#ffffff',
                            letterSpacing: '-0.02em',
                            margin: '0 0 10px',
                        }}
                    >
                        Share Your Studio Experience{' '}
                        <span
                            style={{
                                display: 'block',
                                fontSize: 'clamp(15px, 3.6vw, 19px)',
                                fontWeight: 600,
                                color: '#ff8ab8',
                                marginTop: '4px',
                            }}
                        >
                            Glitz &amp; Glamour Studio
                        </span>
                    </h1>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '14px',
                            lineHeight: 1.65,
                            margin: '0 auto 12px',
                            maxWidth: '46ch',
                        }}
                    >
                        Every review helps our independent San Marcos beauty studio continue delivering bespoke nail
                        artistry, hair styling, and luxury self-care.
                    </p>

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#dfd2d9',
                            fontSize: '12px',
                            fontWeight: 500,
                        }}
                    >
                        <MapPin size={13} color="#E2C286" />
                        <span>935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078</span>
                    </div>
                </header>

                <div style={{ width: '100%', maxWidth: '500px' }}>
                    {/* LOADING */}
                    {pageState === 'loading' && (
                        <div
                            role="status"
                            aria-live="polite"
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                padding: '44px 28px',
                                textAlign: 'center',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
                            }}
                        >
                            <div
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '10%',
                                    right: '10%',
                                    height: '1px',
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)',
                                }}
                            />
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    border: '3px solid rgba(255, 138, 184, 0.22)',
                                    borderTopColor: '#ff8ab8',
                                    animation: 'lrSpin 0.8s linear infinite',
                                    margin: '0 auto 18px',
                                }}
                            />
                            <h2
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#ffffff',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    marginBottom: '6px',
                                }}
                            >
                                Verifying Your Invitation
                            </h2>
                            <p
                                style={{
                                    color: '#e2d6dc',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}
                            >
                                Loading your personalized studio review link…
                            </p>
                        </div>
                    )}

                    {/* INVALID */}
                    {pageState === 'invalid' && (
                        <div
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 32px)',
                                textAlign: 'center',
                                animation: 'lrSlideUp 0.35s ease',
                                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            <div
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '10%',
                                    right: '10%',
                                    height: '1px',
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)',
                                }}
                            />

                            <div
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '18px',
                                    margin: '0 auto 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255, 45, 120, 0.12)',
                                    border: '1px solid rgba(255, 138, 184, 0.3)',
                                    color: '#ff8ab8',
                                }}
                            >
                                <Link2Off size={26} />
                            </div>

                            <h2
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '21px',
                                    marginBottom: '10px',
                                }}
                            >
                                Review Link Unavailable
                            </h2>

                            <p
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#e2d6dc',
                                    fontSize: '14px',
                                    lineHeight: 1.7,
                                    marginBottom: '24px',
                                }}
                            >
                                {invalidReason}
                            </p>

                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <MessageSquareHeart
                                    size={20}
                                    color="#E2C286"
                                    style={{ flexShrink: 0, marginTop: '2px' }}
                                />
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#ffffff',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            margin: '0 0 4px',
                                        }}
                                    >
                                        Still want to share your feedback?
                                    </h3>
                                    <p
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#dfd2d9',
                                            fontSize: '12.5px',
                                            lineHeight: 1.55,
                                            margin: 0,
                                        }}
                                    >
                                        You can post a public Google review any time or sign in to your member profile
                                        to view past appointments.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Link
                                    href="https://g.page/r/glitzandglamour/review"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '14px 24px',
                                        background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                        border: '1px solid rgba(255, 138, 184, 0.4)',
                                        borderRadius: '999px',
                                        color: '#ffffff',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Leave a Google Review Instead <ExternalLink size={15} />
                                </Link>

                                <Link
                                    href="/"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '12px 20px',
                                        color: '#dfd2d9',
                                        textDecoration: 'none',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    <ArrowLeft size={14} /> Return to Glitz &amp; Glamour Studio
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* VALID — Review Form */}
                    {(pageState === 'valid' || pageState === 'submitting') && data && (
                        <div style={{ animation: 'lrSlideUp 0.4s ease' }}>
                            {/* First visit banner */}
                            {data.isFirstVisit && (
                                <div
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(255, 45, 120, 0.16), rgba(226, 194, 134, 0.1))',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        borderRadius: '18px',
                                        padding: '18px 20px',
                                        marginBottom: '20px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(226, 194, 134, 0.18)',
                                            color: '#E2C286',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <Gift size={18} />
                                    </div>
                                    <h2
                                        style={{
                                            color: '#ff8ab8',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            margin: '0 0 4px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        First Visit Studio Reward
                                    </h2>
                                    <p
                                        style={{
                                            color: '#f4eef1',
                                            fontSize: '13px',
                                            lineHeight: 1.55,
                                            margin: 0,
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        Leave your review below and unlock{' '}
                                        <strong style={{ color: '#E2C286' }}>$10 OFF</strong> your next appointment —
                                        your personal reward code appears right after you submit!
                                    </p>
                                </div>
                            )}

                            {/* Card */}
                            <div
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background:
                                        'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    padding: 'clamp(24px, 6vw, 36px)',
                                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                <div
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '10%',
                                        right: '10%',
                                        height: '1px',
                                        background:
                                            'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)',
                                    }}
                                />

                                {/* Greeting */}
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    {data.userImage && (
                                        <Image
                                            src={data.userImage}
                                            alt={data.customerName}
                                            width={56}
                                            height={56}
                                            style={{
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid rgba(255, 138, 184, 0.45)',
                                                margin: '0 auto 12px',
                                                display: 'block',
                                            }}
                                        />
                                    )}
                                    <h2
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#ffffff',
                                            fontWeight: 800,
                                            fontSize: 'clamp(18px, 5vw, 24px)',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        How was your visit, {data.customerName.split(' ')[0]}?
                                    </h2>
                                    <p
                                        style={{
                                            color: '#dfd2d9',
                                            fontSize: '13px',
                                            margin: 0,
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        {data.service} · Glitz &amp; Glamour Studio
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                                >
                                    {/* Stars */}
                                    <div style={{ textAlign: 'center' }}>
                                        <StarRating value={rating} onChange={setRating} />
                                        {rating > 0 && (
                                            <p
                                                style={{
                                                    color: '#ff8ab8',
                                                    fontWeight: 700,
                                                    fontSize: '14px',
                                                    marginTop: '6px',
                                                    fontFamily: 'Poppins, sans-serif',
                                                }}
                                            >
                                                {STAR_LABELS[rating]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <label
                                            htmlFor="client-review-textarea"
                                            style={{
                                                display: 'block',
                                                color: '#dfd2d9',
                                                fontSize: '11.5px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                marginBottom: '8px',
                                                fontFamily: 'Poppins, sans-serif',
                                            }}
                                        >
                                            Your Review
                                        </label>
                                        <textarea
                                            id="client-review-textarea"
                                            className="lr-textarea"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Tell us about your experience — what did you love? What made it special?"
                                            rows={5}
                                            disabled={pageState === 'submitting'}
                                            style={{
                                                width: '100%',
                                                resize: 'vertical',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                                borderRadius: '14px',
                                                padding: '14px 16px',
                                                color: '#ffffff',
                                                fontSize: '15px',
                                                fontFamily: 'Poppins, sans-serif',
                                                lineHeight: 1.6,
                                                minHeight: '120px',
                                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                        <p
                                            style={{
                                                color: '#c8b8c2',
                                                fontSize: '12px',
                                                marginTop: '6px',
                                                textAlign: 'right',
                                                fontFamily: 'Poppins, sans-serif',
                                            }}
                                        >
                                            {text.length}/800
                                        </p>
                                    </div>

                                    {error && (
                                        <div
                                            role="alert"
                                            style={{
                                                background: 'rgba(255, 45, 120, 0.12)',
                                                border: '1px solid rgba(255, 138, 184, 0.35)',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                            }}
                                        >
                                            <p
                                                style={{
                                                    color: '#ff8ab8',
                                                    fontSize: '13px',
                                                    margin: 0,
                                                    fontWeight: 600,
                                                    fontFamily: 'Poppins, sans-serif',
                                                }}
                                            >
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={pageState === 'submitting'}
                                        className="lr-submit-btn"
                                        style={{
                                            padding: '16px',
                                            background:
                                                pageState === 'submitting'
                                                    ? 'rgba(216, 27, 96, 0.45)'
                                                    : 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                            border: '1px solid rgba(255, 138, 184, 0.4)',
                                            borderRadius: '16px',
                                            color: '#ffffff',
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            cursor: pageState === 'submitting' ? 'not-allowed' : 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            transition: 'all 0.2s',
                                            letterSpacing: '0.02em',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        {pageState === 'submitting' ? (
                                            'Submitting Review…'
                                        ) : data.isFirstVisit ? (
                                            <>
                                                <Gift size={18} /> Submit &amp; Claim My $10 Code
                                            </>
                                        ) : (
                                            <>
                                                <Star size={18} /> Submit My Review
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {pageState === 'success' && successData && (
                        <div
                            style={{
                                textAlign: 'center',
                                animation: 'lrSlideUp 0.4s ease',
                            }}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background:
                                        'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    padding: '40px 28px',
                                    marginBottom: '20px',
                                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '18px',
                                        margin: '0 auto 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255, 45, 120, 0.15)',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        color: '#ff8ab8',
                                    }}
                                >
                                    <Heart size={28} />
                                </div>

                                <h2
                                    style={{
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        fontSize: 'clamp(20px, 6vw, 26px)',
                                        marginBottom: '10px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Thank you so much!
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.7,
                                        marginBottom: '24px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Your review means the world to us and helps other clients discover Glitz &amp;
                                    Glamour Studio.
                                    {successData.isFirstVisit && successData.discountCode
                                        ? ' Tap below to view your $10 off reward code!'
                                        : ' We cannot wait to welcome you back soon!'}
                                </p>

                                {successData.isFirstVisit && successData.discountCode && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCodePopup(true)}
                                        style={{
                                            padding: '14px 28px',
                                            background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                            border: '1px solid rgba(255, 138, 184, 0.4)',
                                            borderRadius: '999px',
                                            color: '#ffffff',
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <Gift size={17} /> View My $10 Off Code
                                    </button>
                                )}
                            </div>

                            <Link
                                href="/"
                                style={{
                                    color: '#dfd2d9',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                <ArrowLeft size={14} /> Back to Glitz &amp; Glamour Studio
                            </Link>
                        </div>
                    )}

                    {/* Verified Review Assurance Footer */}
                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#c8b8c2',
                            fontSize: '12px',
                            fontFamily: 'Poppins, sans-serif',
                            textAlign: 'center',
                        }}
                    >
                        <ShieldCheck size={15} color="#E2C286" style={{ flexShrink: 0 }} />
                        <span>100% Verified Client Reviews · Glitz &amp; Glamour Studio</span>
                    </div>
                </div>
            </section>

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
