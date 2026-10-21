'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Sparkles, Gift, Cake, Crown, CreditCard, Calendar,
    Users, CheckCircle2, ChevronRight, Star, Smartphone, Heart
} from 'lucide-react';

const LOYALTY_STYLES = `
    .loyalty-shell {
        width: min(1080px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 28px 0 120px;
    }
    .loyalty-hero-surface {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        background:
            radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.18), transparent 52%),
            radial-gradient(circle at 85% 12%, rgba(226, 194, 134, 0.14), transparent 48%),
            linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
    }
    .loyalty-hero-surface::before {
        content: '';
        position: absolute;
        top: 0;
        left: 8%;
        right: 8%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.6), transparent);
        pointer-events: none;
    }
    .loyalty-card {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.44);
        transition: transform 0.22s ease, border-color 0.22s ease;
    }
    .loyalty-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 10%;
        right: 10%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.45), rgba(226, 194, 134, 0.35), transparent);
        pointer-events: none;
    }
    .loyalty-card:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 138, 184, 0.35);
    }
    .loyalty-steps-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
    .loyalty-tiers-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
    }
    .loyalty-perks-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
    @media (max-width: 860px) {
        .loyalty-steps-grid,
        .loyalty-tiers-grid,
        .loyalty-perks-grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }
    @media (max-width: 560px) {
        .loyalty-shell {
            width: calc(100% - 1.5rem);
            padding: 20px 0 110px;
        }
    }
`;

export default function LoyaltyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session) {
            router.replace('/card');
        }
    }, [status, session, router]);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <style>{LOYALTY_STYLES}</style>

            <div className="loyalty-shell">
                {/* Editorial Hero Section */}
                <section className="loyalty-hero-surface" style={{ padding: 'clamp(28px, 4.5vw, 52px)', marginBottom: '28px', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: 'rgba(255, 45, 120, 0.14)',
                        border: '1px solid rgba(255, 138, 184, 0.35)',
                        marginBottom: '16px',
                    }}>
                        <Sparkles size={13} color="#ff8ab8" aria-hidden="true" />
                        <span style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#ff8ab8',
                            fontWeight: 700,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '2.2px',
                        }}>
                            Glitz &amp; Glamour Studio · Rewards &amp; Insider Club
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#fff',
                        fontSize: 'clamp(28px, 4.5vw, 44px)',
                        fontWeight: 800,
                        letterSpacing: '-0.8px',
                        lineHeight: 1.12,
                        marginBottom: '14px',
                    }}>
                        Glamutta Loyalty Program &amp; Insider Perks
                    </h1>

                    <p style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#e2d6dc',
                        fontSize: 'clamp(14px, 1.8vw, 16px)',
                        maxWidth: '680px',
                        margin: '0 auto 28px',
                        lineHeight: 1.65,
                    }}>
                        Every studio appointment brings you closer to complimentary nail artistry, annual birthday wheel rewards, and invitation-only Glam Insider referral privileges — seamlessly synced to Apple Wallet and Google Wallet.
                    </p>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Link
                            href="/card"
                            className="btn-primary"
                            style={{ padding: '14px 28px', fontSize: '15px' }}
                        >
                            Open Digital Loyalty Card
                            <ChevronRight size={16} aria-hidden="true" />
                        </Link>
                        <Link
                            href="/sign-in?callbackUrl=/card"
                            className="btn-outline"
                            style={{
                                padding: '13px 26px',
                                fontSize: '15px',
                                color: '#ff8ab8',
                                borderColor: 'rgba(255, 138, 184, 0.5)',
                                background: 'rgba(255, 45, 120, 0.06)',
                            }}
                        >
                            Sign In to Your Studio Account
                        </Link>
                        <Link
                            href="/book"
                            className="btn-outline"
                            style={{
                                padding: '13px 26px',
                                fontSize: '15px',
                                color: '#E2C286',
                                borderColor: 'rgba(226, 194, 134, 0.45)',
                                background: 'rgba(226, 194, 134, 0.06)',
                            }}
                        >
                            Book an Appointment
                        </Link>
                    </div>
                </section>

                {/* How the 10-Stamp Card Works */}
                <section aria-label="How the 10-Stamp Card Works" style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', margin: 0 }}>
                            How the 10-Stamp Glamutta Card Works
                        </h2>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ff8ab8', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                            10 Visits = 1 Free Nail Set
                        </span>
                    </div>

                    <div className="loyalty-steps-grid">
                        <div className="loyalty-card" style={{ padding: '26px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Calendar size={20} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '13px', color: '#E2C286', letterSpacing: '1px' }}>
                                    STEP 01
                                </span>
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#fff', marginBottom: '8px' }}>
                                Book &amp; Visit the Studio
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Create your free studio account and book any nail set, pedicure, hair color, haircut, waxing, or custom facial service.
                            </p>
                        </div>

                        <div className="loyalty-card" style={{ padding: '26px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Sparkles size={20} color="#E2C286" aria-hidden="true" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '13px', color: '#E2C286', letterSpacing: '1px' }}>
                                    STEP 02
                                </span>
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#fff', marginBottom: '8px' }}>
                                Collect Digital Stamps
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Earn 1 digital stamp on your Glamutta Loyalty Card after each completed appointment. Your pass updates automatically in real time.
                            </p>
                        </div>

                        <div className="loyalty-card" style={{ padding: '26px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Gift size={20} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '13px', color: '#E2C286', letterSpacing: '1px' }}>
                                    STEP 03
                                </span>
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#fff', marginBottom: '8px' }}>
                                Redeem Your Free Nail Set
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Once you collect all 10 stamps, your card unlocks a complimentary full nail set to redeem on your next studio visit.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Member vs Glam Insider Tiers */}
                <section aria-label="Loyalty Membership Tiers" style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', margin: 0 }}>
                            Two Tiers of Studio Luxury
                        </h2>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#E2C286', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                            Rose-Magenta &amp; Champagne-Gold
                        </span>
                    </div>

                    <div className="loyalty-tiers-grid">
                        {/* Tier 1: Glam Member */}
                        <div className="loyalty-card" style={{ padding: '28px 24px', borderColor: 'rgba(255, 138, 184, 0.32)' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.38)', marginBottom: '14px' }}>
                                <Heart size={13} color="#ff8ab8" aria-hidden="true" />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#ff8ab8', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
                                    Glam Member · Instant Access
                                </span>
                            </div>

                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '21px', color: '#fff', marginBottom: '8px' }}>
                                Signature Rose-Magenta Card
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, marginBottom: '18px' }}>
                                Automatically activated for every registered studio client from your very first visit.
                            </p>

                            <div style={{ display: 'grid', gap: '10px', marginBottom: '22px' }}>
                                {[
                                    'Earn 1 digital stamp per completed studio appointment',
                                    'Unlock a complimentary full nail set every 10 stamps',
                                    'Annual birthday prize wheel spin when you add your DOB',
                                    'One-tap save to Apple Wallet & Google Wallet',
                                ].map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        <CheckCircle2 size={16} color="#ff8ab8" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#f4eef1', lineHeight: 1.5 }}>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/card" className="btn-primary" style={{ width: '100%', padding: '13px 20px', fontSize: '14px' }}>
                                View Glam Member Card <ChevronRight size={15} aria-hidden="true" />
                            </Link>
                        </div>

                        {/* Tier 2: Glam Insider */}
                        <div className="loyalty-card" style={{ padding: '28px 24px', borderColor: 'rgba(226, 194, 134, 0.38)' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.42)', marginBottom: '14px' }}>
                                <Crown size={13} color="#E2C286" aria-hidden="true" />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#E2C286', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
                                    Glam Insider · By Invitation
                                </span>
                            </div>

                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '21px', color: '#fff', marginBottom: '8px' }}>
                                Champagne-Gold VIP Referral Card
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, marginBottom: '18px' }}>
                                Awarded to our dedicated studio regulars with exclusive referral privileges and VIP recognition.
                            </p>

                            <div style={{ display: 'grid', gap: '10px', marginBottom: '22px' }}>
                                {[
                                    'Personal QR referral code embedded directly on your Gold Card',
                                    'Earn a complimentary nail set for every referred guest who completes a booking',
                                    'Live referral dashboard tracking invites, completed visits, and earned sets',
                                    'All 10-stamp and birthday wheel benefits included',
                                ].map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        <Star size={16} color="#E2C286" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#f4eef1', lineHeight: 1.5 }}>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/sign-in?callbackUrl=/card"
                                className="btn-outline"
                                style={{
                                    width: '100%', padding: '12px 20px', fontSize: '14px',
                                    color: '#E2C286', borderColor: 'rgba(226, 194, 134, 0.5)',
                                    background: 'rgba(226, 194, 134, 0.08)',
                                }}
                            >
                                Sign In to Check Insider Status <ChevronRight size={15} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Birthday Rewards, Referral Bonuses & Mobile Wallet Perks */}
                <section aria-label="Additional Member Perks" style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', marginBottom: '16px' }}>
                        Birthday Rewards, Referrals &amp; Mobile Wallet
                    </h2>

                    <div className="loyalty-perks-grid">
                        <div className="loyalty-card" style={{ padding: '22px 20px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                            }}>
                                <Cake size={20} color="#ff8ab8" aria-hidden="true" />
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Annual Birthday Spin
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Register your date of birth in your studio profile to unlock a free annual spin on our in-studio birthday prize wheel.
                            </p>
                        </div>

                        <div className="loyalty-card" style={{ padding: '22px 20px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                            }}>
                                <Users size={20} color="#E2C286" aria-hidden="true" />
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Friend Referral Bonuses
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Glam Insiders can share their personal referral link or QR code with friends to unlock bonus complimentary nail sets.
                            </p>
                        </div>

                        <div className="loyalty-card" style={{ padding: '22px 20px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                            }}>
                                <Smartphone size={20} color="#ff8ab8" aria-hidden="true" />
                            </div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Apple &amp; Google Wallet
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Add your Glamutta pass to your phone&apos;s native wallet for instant studio check-in and live stamp notifications.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA Banner */}
                <section className="loyalty-card" style={{ padding: '24px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CreditCard size={22} color="#ff8ab8" aria-hidden="true" />
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', margin: 0 }}>
                                Ready to start collecting stamps?
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px', margin: 0 }}>
                                Sign in to view your live stamp card or book your next studio appointment.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link href="/card" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13.5px' }}>
                            Go to Loyalty Card
                        </Link>
                        <Link href="/book" className="btn-outline" style={{ padding: '9px 18px', fontSize: '13.5px', color: '#ff8ab8', borderColor: 'rgba(255, 138, 184, 0.45)' }}>
                            Book Now
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
