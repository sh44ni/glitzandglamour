'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Crown, Sparkles, Gift, Calendar, UserPlus, CheckCircle2,
    Copy, Check, ChevronRight, Cake, CreditCard, ShieldCheck
} from 'lucide-react';

const REFER_STYLES = `
    .refer-shell {
        width: min(980px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 28px 0 120px;
    }
    .refer-hero-surface {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        background:
            radial-gradient(circle at 18% 0%, rgba(226, 194, 134, 0.18), transparent 52%),
            radial-gradient(circle at 84% 14%, rgba(255, 45, 120, 0.16), transparent 48%),
            linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.58);
    }
    .refer-hero-surface::before {
        content: '';
        position: absolute;
        top: 0;
        left: 8%;
        right: 8%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(226, 194, 134, 0.75), rgba(255, 138, 184, 0.65), transparent);
        pointer-events: none;
    }
    .refer-card {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
        transition: transform 0.22s ease, border-color 0.22s ease;
    }
    .refer-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 10%;
        right: 10%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(226, 194, 134, 0.45), rgba(255, 138, 184, 0.4), transparent);
        pointer-events: none;
    }
    .refer-card:hover {
        transform: translateY(-2px);
        border-color: rgba(226, 194, 134, 0.35);
    }
    .refer-steps-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
    @media (max-width: 820px) {
        .refer-steps-grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }
    @media (max-width: 560px) {
        .refer-shell {
            width: calc(100% - 1.5rem);
            padding: 20px 0 110px;
        }
    }
`;

export default function ReferralInvitePage() {
    const params = useParams<{ code?: string }>();
    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);

    const rawCode = params?.code ? decodeURIComponent(String(params.code)).trim() : '';
    const referralCode = rawCode || 'GLAM-VIP';

    useEffect(() => {
        if (!rawCode) return;
        try {
            sessionStorage.setItem('glitz_referral_code', rawCode);
            localStorage.setItem('glitz_referral_code', rawCode);
        } catch {
            // Ignore storage errors in private browsing
        }
    }, [rawCode]);

    async function handleCopyCode() {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Ignore clipboard errors
        }
    }

    const encodedRef = encodeURIComponent(referralCode);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <style>{REFER_STYLES}</style>

            <div className="refer-shell">
                {/* Immediate SSR-Visible Editorial Invitation Card */}
                <section className="refer-hero-surface" style={{ padding: 'clamp(28px, 4.5vw, 52px)', marginBottom: '26px', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: 'rgba(226, 194, 134, 0.15)',
                        border: '1px solid rgba(226, 194, 134, 0.42)',
                        marginBottom: '16px',
                    }}>
                        <Crown size={13} color="#E2C286" aria-hidden="true" />
                        <span style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#E2C286',
                            fontWeight: 700,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '2.2px',
                        }}>
                            Glam Insider VIP Invitation
                        </span>
                    </div>

                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        margin: '0 auto 18px',
                        background: 'linear-gradient(135deg, rgba(226, 194, 134, 0.22), rgba(255, 45, 120, 0.18))',
                        border: '1.5px solid rgba(226, 194, 134, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 12px 34px rgba(226, 194, 134, 0.2)',
                    }}>
                        <Gift size={32} color="#E2C286" strokeWidth={1.8} aria-hidden="true" />
                    </div>

                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#fff',
                        fontSize: 'clamp(26px, 4.2vw, 42px)',
                        fontWeight: 800,
                        letterSpacing: '-0.7px',
                        lineHeight: 1.14,
                        marginBottom: '14px',
                    }}>
                        You&apos;ve Been Invited to Glitz &amp; Glamour Studio
                    </h1>

                    <p style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#e2d6dc',
                        fontSize: 'clamp(14px, 1.8vw, 16px)',
                        maxWidth: '650px',
                        margin: '0 auto 24px',
                        lineHeight: 1.65,
                    }}>
                        A Glam Insider has shared their private studio invitation with you. Claim your invitation below to activate your Glamutta Digital Loyalty Card, start collecting stamps toward a complimentary full nail set, and unlock your annual birthday prize wheel spin.
                    </p>

                    {/* Referral Code Pill Box */}
                    <div style={{
                        maxWidth: '440px',
                        margin: '0 auto 28px',
                        padding: '16px 20px',
                        borderRadius: '18px',
                        background: 'rgba(12, 6, 10, 0.72)',
                        border: '1px solid rgba(226, 194, 134, 0.38)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <CheckCircle2 size={13} color="#00D478" aria-hidden="true" />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00D478', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                                    Invitation Code Ready
                                </span>
                            </div>
                            <p style={{ fontFamily: '"Courier New", monospace', fontSize: '18px', fontWeight: 700, color: '#E2C286', letterSpacing: '2px', margin: 0 }}>
                                {referralCode}
                            </p>
                        </div>

                        <button
                            type="button"
                            aria-label="Copy referral invitation code"
                            onClick={handleCopyCode}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '999px',
                                background: copied ? 'rgba(0, 212, 120, 0.16)' : 'rgba(226, 194, 134, 0.14)',
                                border: copied ? '1px solid rgba(0, 212, 120, 0.4)' : '1px solid rgba(226, 194, 134, 0.38)',
                                color: copied ? '#00D478' : '#E2C286',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                    </div>

                    {/* Primary & Secondary CTAs */}
                    {session ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#f4eef1', margin: 0 }}>
                                Signed in as <strong style={{ color: '#ff8ab8' }}>{session.user?.name || session.user?.email}</strong>
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                                <Link
                                    href={`/book?ref=${encodedRef}`}
                                    className="btn-primary"
                                    style={{ padding: '14px 28px', fontSize: '15px' }}
                                >
                                    Book Your Studio Appointment
                                    <ChevronRight size={16} aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/card"
                                    className="btn-outline"
                                    style={{
                                        padding: '13px 26px',
                                        fontSize: '15px',
                                        color: '#E2C286',
                                        borderColor: 'rgba(226, 194, 134, 0.45)',
                                        background: 'rgba(226, 194, 134, 0.06)',
                                    }}
                                >
                                    Open Your Loyalty Card
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                                <Link
                                    href={`/sign-in?ref=${encodedRef}&tab=signup`}
                                    className="btn-primary"
                                    style={{ padding: '14px 28px', fontSize: '15px' }}
                                >
                                    Claim Invitation &amp; Create Account
                                    <ChevronRight size={16} aria-hidden="true" />
                                </Link>
                                <Link
                                    href={`/book?ref=${encodedRef}`}
                                    className="btn-outline"
                                    style={{
                                        padding: '13px 26px',
                                        fontSize: '15px',
                                        color: '#ff8ab8',
                                        borderColor: 'rgba(255, 138, 184, 0.5)',
                                        background: 'rgba(255, 45, 120, 0.06)',
                                    }}
                                >
                                    Book Your First Appointment
                                </Link>
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#dfd2d9', margin: 0 }}>
                                Already have a studio account?{' '}
                                <Link href={`/sign-in?ref=${encodedRef}`} style={{ color: '#ff8ab8', fontWeight: 700, textDecoration: 'underline' }}>
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    )}
                </section>

                {/* How Your Invitation Works */}
                <section aria-label="How Your Invitation Works" style={{ marginBottom: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', margin: 0 }}>
                            How Your Glam Insider Invitation Works
                        </h2>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#E2C286', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                            3 Simple Steps
                        </span>
                    </div>

                    <div className="refer-steps-grid">
                        <div className="refer-card" style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <UserPlus size={20} color="#E2C286" aria-hidden="true" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '12px', color: '#E2C286', letterSpacing: '1px' }}>
                                    STEP 01
                                </span>
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Claim Your Studio Account
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Register with invitation code <strong style={{ color: '#E2C286' }}>{referralCode}</strong> pre-applied to activate your digital Glamutta Loyalty Card.
                            </p>
                        </div>

                        <div className="refer-card" style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Calendar size={20} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '12px', color: '#ff8ab8', letterSpacing: '1px' }}>
                                    STEP 02
                                </span>
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Book &amp; Visit Our Studio
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Schedule your nail set, pedicure, balayage, haircut, waxing, or facial session at our Vista and San Marcos studio.
                            </p>
                        </div>

                        <div className="refer-card" style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Sparkles size={20} color="#E2C286" aria-hidden="true" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '12px', color: '#E2C286', letterSpacing: '1px' }}>
                                    STEP 03
                                </span>
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Both Unlock Studio Rewards
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                You earn your first digital stamp and birthday spin eligibility, while your Glam Insider host receives their referral nail set reward.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Member Perks Summary */}
                <section aria-label="Included Member Benefits" className="refer-steps-grid">
                    <div className="refer-card" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CreditCard size={20} color="#ff8ab8" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                        <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
                                10-Stamp Complimentary Nail Set
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#dfd2d9', lineHeight: 1.55, margin: 0 }}>
                                Collect 10 digital stamps across your studio appointments to redeem a complimentary full nail set.
                            </p>
                        </div>
                    </div>

                    <div className="refer-card" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <Cake size={20} color="#E2C286" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                        <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
                                Annual Birthday Prize Spin
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#dfd2d9', lineHeight: 1.55, margin: 0 }}>
                                Add your date of birth when signing up to receive a free spin on our studio birthday wheel every year.
                            </p>
                        </div>
                    </div>

                    <div className="refer-card" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <ShieldCheck size={20} color="#ff8ab8" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                        <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
                                Apple &amp; Google Wallet Ready
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#dfd2d9', lineHeight: 1.55, margin: 0 }}>
                                Save your digital loyalty card directly to your phone for effortless check-ins and live stamp updates.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
