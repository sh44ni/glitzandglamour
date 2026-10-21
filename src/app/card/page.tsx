'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    Clock, Gift, Sparkles, Cake, Star, Crown, Lock,
    CheckCircle2, Heart, Users, Award, ChevronRight,
    CreditCard, X
} from 'lucide-react';
import { FaApple } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import UnverifiedBanner from '@/components/UnverifiedBanner';

const TOTAL_STAMPS = 10;

// CSS keyframe animations & 2.0 Dark Glam Editorial surfaces
const CARD_STYLES = `
  @keyframes bowFloat {
    0%, 100% { transform: translateY(0px) rotate(-4deg); }
    50% { transform: translateY(-5px) rotate(4deg); }
  }
  @keyframes bowPulse {
    0%, 100% { transform: scale(1) rotate(3deg); opacity: 0.75; }
    50% { transform: scale(1.12) rotate(-3deg); opacity: 1; }
  }
  @keyframes stampPop {
    0% { transform: scale(0.6); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  .bow-float { animation: bowFloat 3.5s ease-in-out infinite; }
  .bow-pulse { animation: bowPulse 2.8s ease-in-out infinite; }
  .stamp-earned { animation: stampPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  .card-swipe-container {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-shell {
    width: min(980px, calc(100% - 2rem));
    margin: 0 auto;
    padding: 28px 0 120px;
  }
  .card-editorial-surface {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    background:
      radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.17), transparent 52%),
      radial-gradient(circle at 86% 12%, rgba(226, 194, 134, 0.12), transparent 48%),
      linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  }
  .card-editorial-surface::before {
    content: '';
    position: absolute;
    top: 0;
    left: 8%;
    right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.6), transparent);
    pointer-events: none;
  }
  .card-panel {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
  }
  .card-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.45), rgba(226, 194, 134, 0.35), transparent);
    pointer-events: none;
  }
  .card-guest-grid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 24px;
    align-items: center;
  }
  .card-perks-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  @media (max-width: 860px) {
    .card-guest-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .card-perks-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 560px) {
    .card-shell {
      width: calc(100% - 1.5rem);
      padding: 20px 0 110px;
    }
  }
`;

type LoyaltyCard = {
    currentStamps: number; lifetimeStamps: number; spinAvailable: boolean; spinsRedeemed: number;
    birthdaySpinAvailable?: boolean;
    isInsider?: boolean; referralCode?: string; referralRewards?: number;
    stamps: { id: string; earnedAt: string; note?: string }[];
    referralStats?: { totalReferrals: number; pendingRewards: number; completedReferrals: number };
};

type BirthdayInfo = { birthdayToday: boolean; spinGranted: boolean; noDob?: boolean; alreadyGranted?: boolean };

/** Returns days until next birthday (0 = today, 1-364 = future) */
function daysUntilBirthday(dob: Date): number {
    const now = new Date();
    const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    const diff = next.getTime() - now.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** 0-100 progress of the year toward next birthday */
function birthdayProgress(dob: Date): number {
    const days = daysUntilBirthday(dob);
    return Math.round(((365 - days) / 365) * 100);
}

// ─── Hello Kitty SVG stamp ────────────────────────────────────────────────
function HelloKittyStamp({ earned, isLast, index, gold = false }: { earned: boolean; isLast: boolean; index: number; total: number; gold?: boolean }) {
    const delay = `${index * 80}ms`;
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            transform: earned ? 'scale(1)' : 'scale(0.94)',
            transition: `all 0.4s cubic-bezier(0.34,1.56,0.64,1) ${delay}`,
        }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '50%', position: 'relative',
                background: earned
                    ? isLast
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                        : gold
                            ? 'linear-gradient(135deg, #D4AF37, #FFD700)'
                            : 'linear-gradient(135deg, #FF2D78, #FF6BA8)'
                    : gold ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.05)',
                border: earned
                    ? isLast ? '2px solid rgba(255,215,0,0.7)' : gold ? '2px solid rgba(212,175,55,0.6)' : '2px solid rgba(255,138,184,0.6)'
                    : gold ? '2px dashed rgba(226,194,134,0.32)' : '2px dashed rgba(255,255,255,0.22)',
                boxShadow: earned
                    ? isLast ? '0 0 16px rgba(255,215,0,0.4), 0 4px 12px rgba(0,0,0,0.4)'
                        : gold ? '0 0 12px rgba(212,175,55,0.4), 0 4px 8px rgba(0,0,0,0.3)'
                            : '0 0 12px rgba(255,45,120,0.4), 0 4px 8px rgba(0,0,0,0.3)'
                    : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                {earned ? (
                    isLast ? (
                        <Gift size={22} color="#14070c" strokeWidth={2.2} aria-hidden="true" />
                    ) : (
                        <img
                            src="/hellokitty-new.svg?v=3"
                            alt={`Stamp ${index + 1} earned`}
                            width={34}
                            height={34}
                            style={{
                                display: 'block',
                                filter: gold
                                    ? 'drop-shadow(0 1px 4px rgba(212,175,55,0.5)) sepia(0.3) hue-rotate(10deg)'
                                    : 'drop-shadow(0 1px 4px rgba(0,0,0,0.35))',
                            }}
                        />
                    )
                ) : (
                    isLast ? (
                        <Gift size={18} color={gold ? '#E2C286' : '#ff8ab8'} aria-hidden="true" />
                    ) : (
                        <Sparkles size={15} color={gold ? 'rgba(226,194,134,0.55)' : 'rgba(255,138,184,0.55)'} aria-hidden="true" />
                    )
                )}
            </div>
            <span style={{
                fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600,
                color: earned ? (isLast ? '#FFD700' : gold ? '#E2C286' : '#ff8ab8') : '#c8b8c2',
                letterSpacing: '0.3px',
            }}>
                {isLast ? 'FREE' : index + 1}
            </span>
        </div>
    );
}

// ─── Bow decoration ──────────────────────────────────────────────────
function Bow({ size = 28, animClass = 'bow-float', delay = '0s', golden = false }: { size?: number; animClass?: string; delay?: string; golden?: boolean }) {
    return (
        <img
            src="/new_bowdesign.svg"
            alt=""
            className={animClass}
            width={size}
            height={size}
            style={{
                display: 'inline-block',
                animationDelay: delay,
                userSelect: 'none',
                objectFit: 'contain',
                filter: golden ? 'sepia(1) saturate(1.5) hue-rotate(5deg) brightness(1.2)' : undefined,
            }}
            aria-hidden="true"
        />
    );
}

// ─── GLAM MEMBER Card ────────────────────────────────────────────────
function GlamMemberCard({ card, session, shimmer, currentStamps, progressPct, remaining, birthdayInfo, userDob }: {
    card: LoyaltyCard | null; session: any; shimmer: boolean;
    currentStamps: number; progressPct: number; remaining: number;
    birthdayInfo: BirthdayInfo | null; userDob: Date | null;
}) {
    const userImage = (session.user as { image?: string | null })?.image;
    return (
        <div style={{
            position: 'relative', borderRadius: '28px', overflow: 'hidden',
            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.96), rgba(14, 7, 12, 0.98))',
            border: card?.spinAvailable ? '1.5px solid rgba(255,215,0,0.55)' : '1.5px solid rgba(255, 138, 184, 0.3)',
            boxShadow: card?.spinAvailable
                ? '0 0 60px rgba(255,215,0,0.18), 0 20px 60px rgba(0,0,0,0.7)'
                : '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,45,120,0.1)',
            transition: 'all 0.5s ease', flexShrink: 0, width: '100%',
        }}>
            {/* Shimmer sweep */}
            <div style={{
                position: 'absolute', top: 0, left: shimmer ? '120%' : '-60%',
                width: '50%', height: '100%', zIndex: 2, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
                transition: shimmer ? 'left 0.8s ease' : 'none',
            }} />
            {/* Top pink glow line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #FF2D78 40%, #ff8ab8 60%, transparent)' }} />

            {/* Hello Kitty watermark */}
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', pointerEvents: 'none', userSelect: 'none' }}>
                <img src="/hellokitty-new.svg?v=3" alt="" aria-hidden="true" style={{ width: '140px', height: '140px', opacity: 0.12, display: 'block' }} />
            </div>

            <div style={{ padding: '24px 20px 28px', position: 'relative', zIndex: 1 }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-float" delay="0s" />
                        <Bow size={18} animClass="bow-pulse" delay="0.6s" />
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px',
                            border: '2.5px solid rgba(255, 138, 184, 0.65)',
                            boxShadow: '0 0 20px rgba(255,45,120,0.35)', overflow: 'hidden',
                            background: 'rgba(255,45,120,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {userImage ? (
                                <img src={userImage} alt={session.user?.name || 'Member'} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            ) : (
                                <span style={{ fontSize: '28px', fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontWeight: 700 }}>
                                    {session.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                                </span>
                            )}
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '2px' }}>
                            {session.user?.name}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Glam Member
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-pulse" delay="0.3s" />
                        <Bow size={18} animClass="bow-float" delay="0.9s" />
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,138,184,0.28), transparent)', marginBottom: '20px' }} />

                {/* Stamp count */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#dfd2d9', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                        Stamps Collected
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '44px', color: card?.spinAvailable ? '#FFD700' : '#ff8ab8', lineHeight: 1 }}>
                            {currentStamps}
                        </span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '20px', color: '#dfd2d9' }}>/</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '22px', color: '#f4eef1' }}>{TOTAL_STAMPS}</span>
                    </div>
                </div>

                {/* Stamps grid */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                    {Array.from({ length: TOTAL_STAMPS }).map((_, i) => (
                        <HelloKittyStamp key={i} earned={i < currentStamps} isLast={i === TOTAL_STAMPS - 1} index={i} total={TOTAL_STAMPS} />
                    ))}
                </div>

                {/* Progress to Nail Set */}
                <div style={{ marginBottom: '14px' }}>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{
                            height: '100%', width: `${progressPct}%`,
                            background: card?.spinAvailable ? 'linear-gradient(90deg, #FFD700, #FFA500)' : 'linear-gradient(90deg, #FF2D78, #FF6BA8)',
                            borderRadius: '4px', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: card?.spinAvailable ? '0 0 8px rgba(255,215,0,0.6)' : '0 0 6px rgba(255,45,120,0.5)',
                        }} />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: card?.spinAvailable ? '#FFD700' : '#e2d6dc', fontSize: '12.5px', textAlign: 'center', fontWeight: card?.spinAvailable ? 600 : 500 }}>
                        {card?.spinAvailable
                            ? 'Complimentary nail set ready — visit us to redeem!'
                            : remaining === 1
                                ? '1 more studio visit to unlock your complimentary nail set!'
                                : `${remaining} more studio visits until your complimentary nail set`}
                    </p>
                </div>

                {/* Birthday progress section */}
                <div style={{ borderTop: '1px solid rgba(255,138,184,0.14)', paddingTop: '14px', marginBottom: '8px' }}>
                    {userDob ? (
                        (() => {
                            const days = daysUntilBirthday(userDob);
                            const bPct = birthdayProgress(userDob);
                            const isToday = days === 0;
                            return (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: isToday ? '#ff8ab8' : '#dfd2d9', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            <Cake size={12} color="#ff8ab8" aria-hidden="true" /> Birthday Reward
                                        </span>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: isToday ? '#FFD700' : '#dfd2d9', fontWeight: 600 }}>
                                            {isToday ? 'Today!' : `${days}d`}
                                        </span>
                                    </div>
                                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                                        <div style={{
                                            height: '100%',
                                            width: isToday ? '100%' : `${bPct}%`,
                                            background: isToday ? 'linear-gradient(90deg, #FF2D78, #FFD700)' : 'linear-gradient(90deg, rgba(255,45,120,0.6), rgba(255,138,184,0.6))',
                                            borderRadius: '4px',
                                            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                                            boxShadow: isToday ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
                                        }} />
                                    </div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11.5px', color: isToday ? '#FFD700' : '#dfd2d9', textAlign: 'center', fontWeight: isToday ? 600 : 400 }}>
                                        {isToday
                                            ? (birthdayInfo?.spinGranted || birthdayInfo?.alreadyGranted)
                                                ? 'Happy Birthday! Your complimentary spin the wheel is ready!'
                                                : 'Happy Birthday!'
                                            : 'Spin the wheel unlocks on your birthday'}
                                    </p>
                                </div>
                            );
                        })()
                    ) : (
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Cake size={13} color="#ff8ab8" aria-hidden="true" />
                            <span>
                                <Link href="/profile" style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}>Add your birthday</Link> to unlock an annual free spin
                            </span>
                        </p>
                    )}
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid rgba(255,138,184,0.14)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '10px', letterSpacing: '2px', fontWeight: 600 }}>GLITZ &amp; GLAMOUR</p>
                        <p style={{ fontFamily: '"Courier New", monospace', color: '#c8b8c2', fontSize: '11.5px', letterSpacing: '3px', marginTop: '2px' }}>
                            •••• •••• •••• {(session.user?.email || '').slice(-4).toUpperCase() || '0001'}
                        </p>
                    </div>
                    <div>
                        {card?.spinAvailable ? <Star size={22} color="#FFD700" fill="#FFD700" aria-hidden="true" /> : <Bow size={22} animClass="bow-pulse" delay="1s" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── GLAM INSIDER Card ────────────────────────────────────────────────
function GlamInsiderCard({ card, session, isInsider, referralUrl, shimmer, currentStamps, progressPct, remaining }: {
    card: LoyaltyCard | null; session: any; isInsider: boolean; referralUrl: string;
    shimmer: boolean; currentStamps: number; progressPct: number; remaining: number;
}) {
    const userImage = (session.user as { image?: string | null })?.image;
    const rewards = card?.referralRewards ?? 0;

    return (
        <div
            aria-hidden={!isInsider}
            style={{
                position: 'relative', borderRadius: '28px', overflow: 'hidden',
                background: 'linear-gradient(145deg, #120d08 0%, #1a1209 45%, #100b06 100%)',
                border: '1.5px solid rgba(226, 194, 134, 0.42)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 50px rgba(212,175,55,0.12)',
                transition: 'all 0.5s ease', flexShrink: 0, width: '100%',
                filter: !isInsider ? 'blur(3px)' : 'none',
                userSelect: !isInsider ? 'none' : 'auto',
                pointerEvents: !isInsider ? 'none' : 'auto',
            }}
        >
            {/* Gold shimmer sweep */}
            <div style={{
                position: 'absolute', top: 0, left: shimmer ? '120%' : '-60%',
                width: '50%', height: '100%', zIndex: 2, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 30%, rgba(212,175,55,0.08) 50%, transparent 70%)',
                transition: shimmer ? 'left 0.8s ease' : 'none',
            }} />
            {/* Top gold glow line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #FFD700 60%, transparent)' }} />

            {/* Hello Kitty watermark - golden tint */}
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', pointerEvents: 'none', userSelect: 'none' }}>
                <img src="/hellokitty-new.svg?v=3" alt="" aria-hidden="true" style={{ width: '140px', height: '140px', opacity: 0.12, display: 'block', filter: 'sepia(1) saturate(1.5) hue-rotate(10deg)' }} />
            </div>

            <div style={{ padding: '24px 20px 28px', position: 'relative', zIndex: 1 }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-float" delay="0s" golden />
                        <Bow size={18} animClass="bow-pulse" delay="0.6s" golden />
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px',
                            border: '2.5px solid rgba(226, 194, 134, 0.7)',
                            boxShadow: '0 0 20px rgba(212,175,55,0.4)', overflow: 'hidden',
                            background: 'rgba(212,175,55,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {userImage ? (
                                <img src={userImage} alt={session.user?.name || 'Insider'} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            ) : (
                                <span style={{ fontSize: '28px', fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontWeight: 700 }}>
                                    {session.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                                </span>
                            )}
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '2px' }}>
                            {session.user?.name}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Crown size={12} color="#E2C286" aria-hidden="true" /> Glam Insider
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-pulse" delay="0.3s" golden />
                        <Bow size={18} animClass="bow-float" delay="0.9s" golden />
                    </div>
                </div>

                {/* Gold divider */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(226,194,134,0.35), transparent)', marginBottom: '20px' }} />

                {/* QR Code section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px', gap: '10px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#E2C286', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                        Your Referral QR
                    </p>
                    <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 0 24px rgba(212,175,55,0.3)' }}>
                        <QRCodeSVG
                            value={referralUrl}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#0a0806"
                            level="M"
                        />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#e2d6dc', textAlign: 'center', maxWidth: '240px', lineHeight: 1.55 }}>
                        Share this QR. When your guest completes a booking, you earn a <strong style={{ color: '#E2C286' }}>complimentary nail set</strong>.
                    </p>
                    {card?.referralCode && (
                        <div style={{ background: 'rgba(226,194,134,0.12)', border: '1px solid rgba(226,194,134,0.3)', borderRadius: '8px', padding: '6px 16px' }}>
                            <p style={{ fontFamily: '"Courier New", monospace', color: '#E2C286', fontSize: '13px', letterSpacing: '2px', fontWeight: 700, margin: 0 }}>
                                {card.referralCode}
                            </p>
                        </div>
                    )}
                </div>

                {/* Referral reward badge */}
                {rewards > 0 && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,215,0,0.08))', border: '1.5px solid rgba(226,194,134,0.45)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFD700', fontSize: '15px', marginBottom: '2px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Gift size={16} color="#FFD700" aria-hidden="true" /> {rewards} Free Nail Set{rewards > 1 ? 's' : ''} Ready!
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '12px', margin: 0 }}>
                            Visit us to redeem your referral reward{rewards > 1 ? 's' : ''}.
                        </p>
                    </div>
                )}

                {/* Stamp count */}
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#dfd2d9', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                        Stamps Collected
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '36px', color: '#E2C286', lineHeight: 1 }}>{currentStamps}</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '18px', color: '#dfd2d9' }}>/</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px', color: '#f4eef1' }}>{TOTAL_STAMPS}</span>
                    </div>
                </div>

                {/* Stamps grid - gold theme */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                    {Array.from({ length: TOTAL_STAMPS }).map((_, i) => (
                        <HelloKittyStamp key={i} earned={i < currentStamps} isLast={i === TOTAL_STAMPS - 1} index={i} total={TOTAL_STAMPS} gold />
                    ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ height: '6px', background: 'rgba(226,194,134,0.14)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #D4AF37, #FFD700)', borderRadius: '4px', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }} />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '12px', textAlign: 'center' }}>
                        {remaining <= 0 ? 'Complimentary nail set ready!' : `${remaining} more visit${remaining > 1 ? 's' : ''} until your complimentary nail set`}
                    </p>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid rgba(226,194,134,0.16)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontSize: '10px', letterSpacing: '2px', fontWeight: 600 }}>GLITZ &amp; GLAMOUR</p>
                        <p style={{ fontFamily: '"Courier New", monospace', color: '#c8b8c2', fontSize: '11.5px', letterSpacing: '3px', marginTop: '2px' }}>
                            •••• •••• •••• {(session.user?.email || '').slice(-4).toUpperCase() || '0001'}
                        </p>
                    </div>
                    <Bow size={22} animClass="bow-pulse" delay="1s" golden />
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function CardPage() {
    const { data: session } = useSession();
    const [card, setCard] = useState<LoyaltyCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [shimmer, setShimmer] = useState(false);
    const [activeCard, setActiveCard] = useState(0); // 0 = MEMBER, 1 = INSIDER
    const [birthdayInfo, setBirthdayInfo] = useState<BirthdayInfo | null>(null);
    const [userDob, setUserDob] = useState<Date | null>(null);
    const [showBookedBanner, setShowBookedBanner] = useState(false);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('booked') === '1') {
                setShowBookedBanner(true);
                const t = setTimeout(() => setShowBookedBanner(false), 6000);
                return () => clearTimeout(t);
            }
        }
    }, []);

    useEffect(() => {
        if (session) {
            fetch('/api/loyalty')
                .then(r => r.json())
                .then(d => { setCard(d.loyaltyCard); setLoading(false); })
                .catch(() => setLoading(false));
            fetch('/api/birthday-check', { method: 'POST' })
                .then(r => r.json())
                .then(d => setBirthdayInfo(d))
                .catch(() => {});
            fetch('/api/profile')
                .then(r => r.json())
                .then(d => {
                    if (d.user?.dateOfBirth) setUserDob(new Date(d.user.dateOfBirth));
                })
                .catch(() => {});
        }
    }, [session]);

    useEffect(() => {
        const id = setInterval(() => {
            setShimmer(true);
            setTimeout(() => setShimmer(false), 900);
        }, 5000);
        return () => clearInterval(id);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) setActiveCard(diff > 0 ? 1 : 0);
        touchStartX.current = null;
    };

    // Immediate SSR-visible 2.0 Dark Glam Editorial Guest / Sign-In Concierge Preview when !session
    if (!session) {
        return (
            <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
                <style>{CARD_STYLES}</style>
                <div className="card-shell">
                    <section className="card-editorial-surface" style={{ padding: 'clamp(26px, 4vw, 44px)', marginBottom: '24px' }}>
                        <div className="card-guest-grid">
                            {/* Left Column: Editorial Copy & CTAs */}
                            <div>
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
                                        Glitz &amp; Glamour Studio · Loyalty Pass
                                    </span>
                                </div>

                                <h1 style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 800,
                                    fontSize: 'clamp(26px, 4vw, 38px)',
                                    color: '#fff',
                                    letterSpacing: '-0.6px',
                                    lineHeight: 1.15,
                                    marginBottom: '12px',
                                }}>
                                    Glamutta Digital Loyalty Card
                                </h1>

                                <p style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#e2d6dc',
                                    fontSize: 'clamp(14px, 1.8vw, 15.5px)',
                                    lineHeight: 1.65,
                                    marginBottom: '24px',
                                }}>
                                    Earn 1 digital stamp on every studio appointment. Collect 10 stamps to unlock a complimentary full nail set, claim your annual birthday prize wheel spin, and save your pass directly to Apple Wallet or Google Wallet.
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                    <Link
                                        href="/sign-in?callbackUrl=/card"
                                        className="btn-primary"
                                        style={{ padding: '14px 28px', fontSize: '15px' }}
                                    >
                                        Sign In to Your Studio Account
                                        <ChevronRight size={16} aria-hidden="true" />
                                    </Link>
                                    <Link
                                        href="/book"
                                        className="btn-outline"
                                        style={{
                                            padding: '13px 24px',
                                            fontSize: '15px',
                                            color: '#ff8ab8',
                                            borderColor: 'rgba(255, 138, 184, 0.5)',
                                            background: 'rgba(255, 45, 120, 0.06)',
                                        }}
                                    >
                                        Book an Appointment
                                    </Link>
                                </div>

                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px', margin: 0 }}>
                                    Don&apos;t have a digital pass yet?{' '}
                                    <Link href="/sign-in?tab=signup&callbackUrl=/card" style={{ color: '#ff8ab8', fontWeight: 700, textDecoration: 'underline' }}>
                                        Create your free account
                                    </Link>
                                </p>
                            </div>

                            {/* Right Column: Editorial Stamp Card Preview */}
                            <div style={{
                                borderRadius: '24px',
                                padding: '24px 20px',
                                background: 'linear-gradient(150deg, rgba(22, 9, 18, 0.96), rgba(11, 5, 10, 0.98))',
                                border: '1.5px solid rgba(255, 138, 184, 0.32)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>
                                            Glam Member Pass
                                        </p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#ff8ab8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.4px', margin: 0 }}>
                                            10-Stamp Reward Edition
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '5px 12px',
                                        borderRadius: '999px',
                                        background: 'rgba(226, 194, 134, 0.14)',
                                        border: '1px solid rgba(226, 194, 134, 0.35)',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#E2C286',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                    }}>
                                        <Lock size={12} color="#E2C286" aria-hidden="true" /> Ready to Activate
                                    </div>
                                </div>

                                {/* 10-Stamp Preview Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                                    gap: '10px',
                                    marginBottom: '18px',
                                }}>
                                    {Array.from({ length: 10 }, (_, i) => {
                                        const sampleEarned = i < 3;
                                        const isRewardSlot = i === 9;
                                        return (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <div style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '50%',
                                                    background: sampleEarned
                                                        ? 'linear-gradient(135deg, #FF2D78, #FF6BA8)'
                                                        : isRewardSlot
                                                            ? 'rgba(226, 194, 134, 0.14)'
                                                            : 'rgba(255, 255, 255, 0.05)',
                                                    border: sampleEarned
                                                        ? '1.5px solid rgba(255, 138, 184, 0.7)'
                                                        : isRewardSlot
                                                            ? '1.5px dashed rgba(226, 194, 134, 0.5)'
                                                            : '1.5px dashed rgba(255, 255, 255, 0.22)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {sampleEarned ? (
                                                        <Star size={18} color="#fff" fill="#fff" aria-hidden="true" />
                                                    ) : isRewardSlot ? (
                                                        <Gift size={18} color="#E2C286" aria-hidden="true" />
                                                    ) : (
                                                        <Sparkles size={14} color="rgba(255, 138, 184, 0.55)" aria-hidden="true" />
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: sampleEarned ? '#ff8ab8' : isRewardSlot ? '#E2C286' : '#c8b8c2',
                                                }}>
                                                    {isRewardSlot ? 'FREE' : i + 1}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ height: '6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: '10px' }}>
                                    <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, #FF2D78, #ff8ab8)', borderRadius: '4px' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9' }}>
                                        10 Stamps = 1 Complimentary Nail Set
                                    </span>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#E2C286', fontWeight: 600 }}>
                                        Apple &amp; Google Wallet
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3 Editorial Perks Highlights */}
                    <section aria-label="Loyalty Card Perks" className="card-perks-grid">
                        <div className="card-panel" style={{ padding: '22px 20px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                            }}>
                                <Gift size={20} color="#ff8ab8" aria-hidden="true" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                10-Stamp Complimentary Set
                            </h2>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Every completed studio visit earns a digital stamp. Collect 10 stamps to unlock a complimentary full nail set.
                            </p>
                        </div>

                        <div className="card-panel" style={{ padding: '22px 20px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                            }}>
                                <Cake size={20} color="#E2C286" aria-hidden="true" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Annual Birthday Prize Wheel
                            </h2>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Add your birthdate to your member profile to unlock a complimentary birthday spin on our studio reward wheel each year.
                            </p>
                        </div>

                        <div className="card-panel" style={{ padding: '22px 20px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                            }}>
                                <Crown size={20} color="#ff8ab8" aria-hidden="true" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                Glam Insider Invitations
                            </h2>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                Loyal members receive invitations to our gold Glam Insider card with a personal QR code that rewards every friend referral.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    const currentStamps = card?.currentStamps ?? 0;
    const progressPct = Math.min((currentStamps / TOTAL_STAMPS) * 100, 100);
    const remaining = TOTAL_STAMPS - currentStamps;
    const isUnverified = session && !(session.user as { emailVerified?: string | null })?.emailVerified;
    const isInsider = card?.isInsider ?? false;
    const referralUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/sign-in?ref=${card?.referralCode || ''}`
        : `/sign-in?ref=${card?.referralCode || ''}`;

    return (
        <div style={{ minHeight: '100vh', padding: '32px 16px 120px', maxWidth: '500px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <style>{CARD_STYLES}</style>
            {isUnverified && <UnverifiedBanner />}

            {/* Booking success banner */}
            {showBookedBanner && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,212,120,0.14), rgba(0,180,100,0.08))',
                    border: '1.5px solid rgba(0,212,120,0.4)', borderRadius: '16px',
                    padding: '16px 20px', marginBottom: '20px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    boxShadow: '0 0 24px rgba(0,212,120,0.1)',
                }}>
                    <CheckCircle2 size={26} color="#00D478" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#00D478', fontSize: '14px', marginBottom: '2px' }}>
                            Booking Received!
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
                            We&apos;ll reach out to confirm your appointment soon.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Dismiss booking confirmation banner"
                        onClick={() => setShowBookedBanner(false)}
                        style={{ background: 'none', border: 'none', color: '#dfd2d9', cursor: 'pointer', padding: '4px', lineHeight: 1, flexShrink: 0 }}
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Page title */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '11.5px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Glitz &amp; Glamour Studio
                </p>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '26px', color: '#fff', marginBottom: '4px' }}>
                    Glamutta Digital Loyalty Card
                </h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', margin: 0 }}>
                    Collect 10 stamps · Earn a complimentary full nail set
                </p>
            </div>

            {/* Card Tier Switcher Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
                <button
                    type="button"
                    id="card-dot-member"
                    onClick={() => setActiveCard(0)}
                    aria-label="Show Glam Member card"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '999px',
                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                        background: activeCard === 0 ? 'rgba(255, 45, 120, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: activeCard === 0 ? '1px solid rgba(255, 138, 184, 0.5)' : '1px solid rgba(255, 255, 255, 0.14)',
                        color: activeCard === 0 ? '#ff8ab8' : '#dfd2d9',
                        transition: 'all 0.25s ease',
                    }}
                >
                    <Heart size={13} color={activeCard === 0 ? '#ff8ab8' : '#dfd2d9'} aria-hidden="true" />
                    Glam Member
                </button>
                <button
                    type="button"
                    id="card-dot-insider"
                    onClick={() => setActiveCard(1)}
                    aria-label="Show Glam Insider card"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '999px',
                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                        background: activeCard === 1 ? 'rgba(226, 194, 134, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                        border: activeCard === 1 ? '1px solid rgba(226, 194, 134, 0.5)' : '1px solid rgba(255, 255, 255, 0.14)',
                        color: activeCard === 1 ? '#E2C286' : '#dfd2d9',
                        transition: 'all 0.25s ease',
                    }}
                >
                    <Crown size={13} color={activeCard === 1 ? '#E2C286' : '#dfd2d9'} aria-hidden="true" />
                    Glam Insider
                </button>
            </div>

            {/* ─── SWIPEABLE CARD AREA ────────────────────────────────── */}
            <div
                style={{ overflow: 'hidden', borderRadius: '28px', marginBottom: '20px', position: 'relative' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="card-swipe-container" style={{ transform: `translateX(${activeCard === 0 ? '0%' : '-100%'})` }}>
                    {/* Slot 1: GLAM MEMBER */}
                    <div style={{ minWidth: '100%' }}>
                        <GlamMemberCard
                            card={card}
                            session={session}
                            shimmer={shimmer}
                            currentStamps={currentStamps}
                            progressPct={progressPct}
                            remaining={remaining}
                            birthdayInfo={birthdayInfo}
                            userDob={userDob}
                        />
                    </div>
                    {/* Slot 2: GLAM INSIDER */}
                    <div style={{ minWidth: '100%', position: 'relative' }}>
                        <GlamInsiderCard
                            card={card}
                            session={session}
                            isInsider={isInsider}
                            referralUrl={referralUrl}
                            shimmer={shimmer}
                            currentStamps={currentStamps}
                            progressPct={progressPct}
                            remaining={remaining}
                        />
                        {/* Lock overlay for non-insiders */}
                        {!isInsider && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(8, 4, 7, 0.86)', backdropFilter: 'blur(6px)',
                                borderRadius: '28px', gap: '12px', padding: '24px', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    background: 'rgba(226, 194, 134, 0.14)',
                                    border: '1.5px solid rgba(226, 194, 134, 0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Lock size={26} color="#E2C286" aria-hidden="true" />
                                </div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#E2C286', fontSize: '18px', lineHeight: 1.3, margin: 0 }}>
                                    Glam Insider Card
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, maxWidth: '260px', margin: 0 }}>
                                    This gold card is issued to our loyal studio regulars. Keep visiting and we&apos;ll invite you when the time is right.
                                </p>
                                <div style={{ background: 'rgba(226,194,134,0.14)', border: '1px solid rgba(226,194,134,0.35)', borderRadius: '50px', padding: '8px 20px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <Crown size={13} color="#E2C286" aria-hidden="true" /> By Invitation Only
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insider referral stats — shown below card when on Insider tab */}
            {activeCard === 1 && isInsider && card?.referralStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                    {[
                        { label: 'Referrals', value: card.referralStats.totalReferrals, Icon: Users },
                        { label: 'Completed', value: card.referralStats.completedReferrals, Icon: CheckCircle2 },
                        { label: 'Rewards', value: card.referralRewards ?? 0, Icon: Gift },
                    ].map(({ label, value, Icon }) => (
                        <div key={label} className="card-panel" style={{ padding: '14px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                <Icon size={18} color="#E2C286" aria-hidden="true" />
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#E2C286', fontSize: '22px', margin: 0 }}>{value}</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11px', marginTop: '2px', marginBottom: 0 }}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Wallet buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/wallet');
                                const data = await res.json();
                                if (data.saveUrl) window.location.href = data.saveUrl;
                                else alert('Failed to generate Wallet pass: ' + data.error);
                            } catch { alert('Error connecting to Server.'); }
                        }}
                        style={{
                            background: '#0e070c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                            padding: '0 20px', borderRadius: '24px', height: '48px',
                            fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            transition: 'all 0.2s', width: '225px', justifyContent: 'center',
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" aria-hidden="true">
                            <path d="M510.992 192.735V107.73c0-49.084-36.4-89.087-81.06-89.087H82.082C37.398 19.09 1 59.093 1 107.73v85.004c0 8.634 6.212 15.462 14.069 15.462h481.876c7.856 0 14.047-6.828 14.047-15.462z" fill="#34a853" />
                            <path d="M510.992 267.298V182.74c0-49.107-36.4-89.11-81.06-89.11H82.082C37.398 93.63 1 133.633 1 182.74v85.004c0 8.634 6.212 15.462 14.069 15.462h481.876c7.856-.47 14.047-7.274 14.047-15.908z" fill="#fbbc04" />
                            <path d="M510.992 342.308v-85.005c0-49.106-36.4-89.11-81.06-89.11H82.082C37.398 168.193 1 208.197 1 257.303v85.005c0 8.634 6.212 15.438 14.069 15.438h481.876c7.856-.446 14.047-7.273 14.047-15.438z" fill="#ea4335" />
                            <path d="M325.282 301.39L1 218.66v187.278c0 49.106 36.399 89.11 81.081 89.11h347.851c44.66 0 81.06-40.004 81.06-89.11V215.024l-77.345 61.823c-31.425 24.988-70.728 34.091-108.365 24.542z" fill="#4285f4" />
                        </svg>
                        Add to Google Wallet
                    </button>

                    <a
                        href="/api/apple-wallet"
                        style={{
                            background: '#0e070c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                            height: '48px', padding: '0 20px', borderRadius: '24px',
                            fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            transition: 'all 0.2s', width: '225px', justifyContent: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        <FaApple size={22} aria-hidden="true" /> Add to Apple Wallet
                    </a>
                </div>
            </div>

            {/* Nail Set ready banner (10 stamps) */}
            {card?.spinAvailable && (
                <div className="card-panel" style={{ padding: '20px', marginBottom: '16px', textAlign: 'center', borderColor: 'rgba(255, 138, 184, 0.45)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <Gift size={28} color="#ff8ab8" aria-hidden="true" />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#ff8ab8', fontSize: '17px', marginBottom: '4px' }}>
                        Complimentary Nail Set Unlocked!
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, margin: 0 }}>
                        Come in on your next visit and redeem your complimentary full nail set.
                    </p>
                </div>
            )}

            {/* Birthday spin banner */}
            {card?.birthdaySpinAvailable && (
                <div className="card-panel" style={{ padding: '20px', marginBottom: '16px', textAlign: 'center', borderColor: 'rgba(255,215,0,0.45)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <Cake size={28} color="#FFD700" aria-hidden="true" />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFD700', fontSize: '17px', marginBottom: '4px' }}>
                        Birthday Spin Unlocked!
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, margin: 0 }}>
                        Come in and we&apos;ll spin the prize wheel together for a special birthday reward.
                    </p>
                </div>
            )}

            {/* Stats row */}
            {card && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                    {[
                        { label: 'Total Visits', value: card.stamps.length, Icon: Sparkles, color: '#ff8ab8' },
                        { label: 'All-Time Stamps', value: card.lifetimeStamps, Icon: Star, color: '#E2C286' },
                        { label: 'Sets Earned', value: card.spinsRedeemed, Icon: Award, color: '#ff8ab8' },
                    ].map(({ label, value, Icon, color }) => (
                        <div key={label} className="card-panel" style={{ padding: '14px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                <Icon size={18} color={color} aria-hidden="true" />
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', margin: 0 }}>{value}</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11px', marginTop: '2px', marginBottom: 0 }}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* No card yet */}
            {!card && !loading && (
                <div className="card-panel" style={{ padding: '36px 24px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                        <CreditCard size={36} color="#ff8ab8" aria-hidden="true" />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '14px', marginBottom: '20px', lineHeight: 1.7 }}>
                        No stamps yet! Book your first appointment and start collecting digital stamps toward a complimentary nail set.
                    </p>
                    <Link href="/book" className="btn-primary">
                        Book Now <ChevronRight size={15} aria-hidden="true" />
                    </Link>
                </div>
            )}

            {/* Visit history */}
            {card?.stamps && card.stamps.length > 0 && (
                <div className="card-panel" style={{ padding: '20px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Sparkles size={15} color="#ff8ab8" aria-hidden="true" />
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                            Visit History
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {card.stamps.slice(0, 10).map((stamp, i) => (
                            <div key={stamp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,107,168,0.12))',
                                    border: '1px solid rgba(255,138,184,0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Star size={14} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#f4eef1', fontSize: '13.5px', fontWeight: 600, margin: 0 }}>
                                        Visit #{card.stamps.length - i}
                                    </p>
                                    {stamp.note && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px', margin: 0 }}>
                                            {stamp.note}
                                        </p>
                                    )}
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                    <Clock size={11} color="#ff8ab8" aria-hidden="true" />
                                    {new Date(stamp.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
