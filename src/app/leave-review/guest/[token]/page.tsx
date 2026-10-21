'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    Star,
    Sparkles,
    Cake,
    Calendar,
    Gift,
    Award,
    Link2Off,
    Heart,
    MapPin,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    ExternalLink,
} from 'lucide-react';

type PageState = 'loading' | 'splash' | 'form' | 'submitting' | 'success' | 'invalid';

type TokenData = {
    guestName: string;
    isFirstVisit: boolean;
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

const BENEFITS = [
    {
        Icon: Award,
        title: 'Hello Kitty Loyalty Card',
        desc: 'Collect digital stamps and earn a complimentary nail set after 10 studio visits.',
    },
    {
        Icon: Cake,
        title: 'Birthday Surprise',
        desc: 'Unlock a special birthday prize wheel spin reward every year.',
    },
    {
        Icon: Calendar,
        title: 'Booking History',
        desc: 'Track all your past and upcoming beauty appointments in one place.',
    },
    {
        Icon: Gift,
        title: 'Exclusive Perks',
        desc: 'Priority access to seasonal promotions and Glam Insider rewards.',
    },
];

export default function GuestReviewPage() {
    const params = useParams();
    const token = params.token as string;
    const { data: session, status } = useSession();

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
            const res = await fetch(`/api/reviews/guest-token?token=${encodeURIComponent(token)}`);
            const d = await res.json();
            if (d.valid) {
                setTokenData({ guestName: d.guestName, isFirstVisit: d.isFirstVisit });
                setDisplayName(d.guestName);
                setPageState('splash');
            } else {
                const reasons: Record<string, string> = {
                    not_found: 'This guest review invitation link is invalid or has expired.',
                    already_used: 'This review invitation link has already been used — thank you for your feedback!',
                    expired: 'This review invitation link has expired (links remain active for 7 days).',
                };
                setInvalidReason(reasons[d.reason] || 'We could not verify this guest review invitation link.');
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

    useEffect(() => {
        if (pageState === 'splash' && status === 'authenticated') {
            setPageState('form');
            if (session?.user?.name) {
                setDisplayName(session.user.name);
            }
        }
    }, [status, pageState, session]);

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
            const res = await fetch('/api/reviews/guest-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    rating,
                    text: text.trim(),
                    displayName: displayName.trim() || tokenData?.guestName,
                }),
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
                @keyframes grSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes grSpin { to { transform: rotate(360deg); } }
                .gr-skip-btn:hover { color: #ffffff !important; }
                .gr-submit-btn:active { transform: scale(0.98); }
                .gr-field:focus { outline: none; border-color: #ff8ab8 !important; box-shadow: 0 0 0 3px rgba(255, 138, 184, 0.15); }
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
                        Guest Experience &amp; VIP Invitation
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
                        Thank you for visiting our San Marcos studio. Leave your verified guest review below and
                        discover complimentary VIP loyalty rewards.
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

                <div style={{ width: '100%', maxWidth: '480px' }}>
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
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    border: '3px solid rgba(255, 138, 184, 0.22)',
                                    borderTopColor: '#ff8ab8',
                                    animation: 'grSpin 0.8s linear infinite',
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
                                Verifying Guest Invitation
                            </h2>
                            <p
                                style={{
                                    color: '#e2d6dc',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '14px',
                                    margin: 0,
                                }}
                            >
                                Loading your personalized guest review link…
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
                                animation: 'grSlideUp 0.35s ease',
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

                            {/* VIP Perks Preview inside Invalid/Sample state */}
                            <div
                                style={{
                                    display: 'grid',
                                    gap: '10px',
                                    marginBottom: '24px',
                                    textAlign: 'left',
                                }}
                            >
                                {BENEFITS.slice(0, 2).map(({ Icon, title, desc }) => (
                                    <div
                                        key={title}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '14px',
                                            padding: '12px 14px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(255, 45, 120, 0.14)',
                                                border: '1px solid rgba(255, 138, 184, 0.28)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ff8ab8',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon size={18} />
                                        </span>
                                        <div>
                                            <h3
                                                style={{
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    fontSize: '13px',
                                                    margin: '0 0 2px',
                                                    fontFamily: 'Poppins, sans-serif',
                                                }}
                                            >
                                                {title}
                                            </h3>
                                            <p
                                                style={{
                                                    color: '#dfd2d9',
                                                    fontSize: '12px',
                                                    lineHeight: 1.5,
                                                    margin: 0,
                                                    fontFamily: 'Poppins, sans-serif',
                                                }}
                                            >
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                                    <ArrowLeft size={14} /> Back to Glitz &amp; Glamour Studio
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* SPLASH — Sign-up pitch */}
                    {pageState === 'splash' && tokenData && (
                        <div style={{ animation: 'grSlideUp 0.4s ease' }}>
                            <div
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background:
                                        'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                    border: '1px solid rgba(255, 138, 184, 0.28)',
                                    borderRadius: '24px',
                                    padding: 'clamp(24px, 6vw, 36px)',
                                    marginBottom: '14px',
                                    textAlign: 'center',
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
                                        margin: '0 auto 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255, 45, 120, 0.14)',
                                        border: '1px solid rgba(255, 138, 184, 0.32)',
                                        color: '#E2C286',
                                    }}
                                >
                                    <Sparkles size={26} />
                                </div>

                                <h2
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        fontSize: 'clamp(20px, 5.5vw, 25px)',
                                        marginBottom: '8px',
                                        lineHeight: 1.25,
                                    }}
                                >
                                    Hey {firstName}, unlock your free VIP pass!
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        marginBottom: '24px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Join the Glitz &amp; Glamour family and unlock exclusive member perks — creating an
                                    account takes just seconds.
                                </p>

                                {/* Benefits */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gap: '10px',
                                        marginBottom: '24px',
                                        textAlign: 'left',
                                    }}
                                >
                                    {BENEFITS.map(({ Icon, title, desc }) => (
                                        <div
                                            key={title}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '14px',
                                                padding: '12px 14px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: '38px',
                                                    height: '38px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255, 45, 120, 0.14)',
                                                    border: '1px solid rgba(255, 138, 184, 0.28)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#ff8ab8',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Icon size={18} />
                                            </span>
                                            <div>
                                                <h3
                                                    style={{
                                                        color: '#ffffff',
                                                        fontWeight: 700,
                                                        fontSize: '13.5px',
                                                        margin: '0 0 2px',
                                                        fontFamily: 'Poppins, sans-serif',
                                                    }}
                                                >
                                                    {title}
                                                </h3>
                                                <p
                                                    style={{
                                                        color: '#dfd2d9',
                                                        fontSize: '12.5px',
                                                        lineHeight: 1.5,
                                                        margin: 0,
                                                        fontFamily: 'Poppins, sans-serif',
                                                    }}
                                                >
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Registration Link */}
                                <Link
                                    href={`/sign-in?callbackUrl=/leave-review/guest/${token}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                        border: '1px solid rgba(255, 138, 184, 0.4)',
                                        borderRadius: '14px',
                                        color: '#ffffff',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        marginBottom: '12px',
                                        fontFamily: 'Poppins, sans-serif',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    Create My Free Account <ArrowRight size={16} />
                                </Link>

                                {/* Skip */}
                                <button
                                    type="button"
                                    className="gr-skip-btn"
                                    onClick={() => setPageState('form')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#dfd2d9',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        padding: '10px',
                                        width: '100%',
                                        transition: 'color 0.2s',
                                        fontFamily: 'Poppins, sans-serif',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    Skip and take me to the review <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* REVIEW FORM */}
                    {(pageState === 'form' || pageState === 'submitting') && tokenData && (
                        <div style={{ animation: 'grSlideUp 0.4s ease' }}>
                            {tokenData.isFirstVisit && (
                                <div
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(255, 45, 120, 0.16), rgba(226, 194, 134, 0.1))',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        borderRadius: '16px',
                                        padding: '16px 18px',
                                        marginBottom: '16px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '10px',
                                            background: 'rgba(226, 194, 134, 0.18)',
                                            color: '#E2C286',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        <Gift size={17} />
                                    </div>
                                    <h2
                                        style={{
                                            color: '#ff8ab8',
                                            fontWeight: 700,
                                            fontSize: '13.5px',
                                            margin: '0 0 4px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        First Visit Perk!
                                    </h2>
                                    <p
                                        style={{
                                            color: '#f4eef1',
                                            fontSize: '12.5px',
                                            lineHeight: 1.55,
                                            margin: 0,
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        Leave your review and unlock{' '}
                                        <strong style={{ color: '#E2C286' }}>$10 OFF</strong> your next appointment!
                                    </p>
                                </div>
                            )}

                            <div
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background:
                                        'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    padding: 'clamp(22px, 6vw, 34px)',
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

                                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                                    <h2
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: '#ffffff',
                                            fontWeight: 800,
                                            fontSize: 'clamp(18px, 5vw, 23px)',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        How was your experience?
                                    </h2>
                                    <p
                                        style={{
                                            color: '#dfd2d9',
                                            fontSize: '13px',
                                            margin: 0,
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        Glitz &amp; Glamour Studio · San Marcos, CA
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
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

                                    {/* Name */}
                                    <div>
                                        <label
                                            htmlFor="guest-review-name"
                                            style={{
                                                display: 'block',
                                                color: '#dfd2d9',
                                                fontSize: '11.5px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                marginBottom: '7px',
                                                fontFamily: 'Poppins, sans-serif',
                                            }}
                                        >
                                            Your Name
                                        </label>
                                        <input
                                            id="guest-review-name"
                                            className="gr-field"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="How should we credit you?"
                                            style={{
                                                width: '100%',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                                borderRadius: '12px',
                                                padding: '12px 14px',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontFamily: 'Poppins, sans-serif',
                                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>

                                    {/* Review text */}
                                    <div>
                                        <label
                                            htmlFor="guest-review-textarea"
                                            style={{
                                                display: 'block',
                                                color: '#dfd2d9',
                                                fontSize: '11.5px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                marginBottom: '7px',
                                                fontFamily: 'Poppins, sans-serif',
                                            }}
                                        >
                                            Your Review
                                        </label>
                                        <textarea
                                            id="guest-review-textarea"
                                            className="gr-field"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Tell us about your experience — what did you love?"
                                            rows={5}
                                            disabled={pageState === 'submitting'}
                                            style={{
                                                width: '100%',
                                                resize: 'vertical',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                                borderRadius: '12px',
                                                padding: '12px 14px',
                                                color: '#ffffff',
                                                fontSize: '14px',
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
                                                fontSize: '11.5px',
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
                                                borderRadius: '10px',
                                                padding: '11px 14px',
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
                                        className="gr-submit-btn"
                                        style={{
                                            padding: '15px',
                                            background:
                                                pageState === 'submitting'
                                                    ? 'rgba(216, 27, 96, 0.45)'
                                                    : 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                            border: '1px solid rgba(255, 138, 184, 0.4)',
                                            borderRadius: '14px',
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
                                        ) : tokenData.isFirstVisit ? (
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
                    {pageState === 'success' && (
                        <div style={{ textAlign: 'center', animation: 'grSlideUp 0.4s ease' }}>
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
                                        lineHeight: 1.75,
                                        marginBottom: '26px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Your review means the world to JoJany and helps other clients discover Glitz &amp;
                                    Glamour Studio.
                                </p>

                                {/* Upsell to create account */}
                                <div
                                    style={{
                                        background: 'rgba(255, 45, 120, 0.08)',
                                        border: '1px solid rgba(255, 138, 184, 0.28)',
                                        borderRadius: '16px',
                                        padding: '18px',
                                        marginBottom: '22px',
                                        textAlign: 'left',
                                    }}
                                >
                                    <h3
                                        style={{
                                            color: '#ff8ab8',
                                            fontWeight: 700,
                                            fontSize: '13.5px',
                                            margin: '0 0 6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        <Award size={16} color="#E2C286" /> Want to earn loyalty stamps?
                                    </h3>
                                    <p
                                        style={{
                                            color: '#e2d6dc',
                                            fontSize: '12.5px',
                                            lineHeight: 1.6,
                                            margin: '0 0 14px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        Create a complimentary member account to collect Hello Kitty stamps, track
                                        appointments, and unlock birthday rewards.
                                    </p>
                                    <Link
                                        href="/sign-in"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            width: '100%',
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                            border: '1px solid rgba(255, 138, 184, 0.4)',
                                            borderRadius: '12px',
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            fontSize: '13.5px',
                                            fontWeight: 700,
                                            fontFamily: 'Poppins, sans-serif',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        Create My Free Account <ArrowRight size={15} />
                                    </Link>
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
        </>
    );
}
