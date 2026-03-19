'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { FaApple } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import UnverifiedBanner from '@/components/UnverifiedBanner';

const TOTAL_STAMPS = 10;

// CSS keyframe animations
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
  @keyframes shimmerSlide {
    0% { left: -60%; }
    100% { left: 130%; }
  }
  @keyframes goldPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(212,175,55,0.2); }
    50% { box-shadow: 0 0 60px rgba(212,175,55,0.45); }
  }
  @keyframes goldShimmer {
    0% { left: -60%; }
    100% { left: 130%; }
  }
  .bow-float { animation: bowFloat 3.5s ease-in-out infinite; }
  .bow-pulse { animation: bowPulse 2.8s ease-in-out infinite; }
  .stamp-earned { animation: stampPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  .card-swipe-container {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-dot {
    width: 8px; height: 8px; border-radius: 50%;
    transition: all 0.3s ease; cursor: pointer;
    border: none; padding: 0;
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
            opacity: earned ? 1 : 0.3,
            transform: earned ? 'scale(1)' : 'scale(0.9)',
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
                    : gold ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.04)',
                border: earned
                    ? isLast ? '2px solid rgba(255,215,0,0.6)' : gold ? '2px solid rgba(212,175,55,0.5)' : '2px solid rgba(255,45,120,0.5)'
                    : gold ? '2px dashed rgba(212,175,55,0.2)' : '2px dashed rgba(255,255,255,0.12)',
                boxShadow: earned
                    ? isLast ? '0 0 16px rgba(255,215,0,0.4), 0 4px 12px rgba(0,0,0,0.4)'
                        : gold ? '0 0 12px rgba(212,175,55,0.4), 0 4px 8px rgba(0,0,0,0.3)'
                            : '0 0 12px rgba(255,45,120,0.4), 0 4px 8px rgba(0,0,0,0.3)'
                    : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                {earned ? (
                    isLast ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="rgba(255,255,255,0.95)" />
                        </svg>
                    ) : (
                        <img src="/hellokitty-new.svg?v=3" alt="Hello Kitty stamp" width={36} height={36}
                            style={{ display: 'block', filter: gold ? 'drop-shadow(0 1px 4px rgba(212,175,55,0.5)) sepia(0.3) hue-rotate(10deg)' : 'drop-shadow(0 1px 4px rgba(0,0,0,0.35))' }} />
                    )
                ) : (
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', color: gold ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.08)', userSelect: 'none' }}>
                        {isLast ? '★' : '✦'}
                    </span>
                )}
            </div>
            <span style={{
                fontFamily: 'Poppins, sans-serif', fontSize: '9px', fontWeight: 600,
                color: earned ? (isLast ? '#FFD700' : gold ? '#D4AF37' : '#FF2D78') : gold ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.15)',
                letterSpacing: '0.3px',
            }}>
                {isLast ? '🎁' : index + 1}
            </span>
        </div>
    );
}

// ─── Bow decoration ──────────────────────────────────────────────────
function Bow({ size = 28, animClass = 'bow-float', delay = '0s', golden = false }: { size?: number; animClass?: string; delay?: string; golden?: boolean }) {
    return (
        <img src="/new_bowdesign.svg" alt="Bow" className={animClass} width={size} height={size}
            style={{ display: 'inline-block', animationDelay: delay, userSelect: 'none', objectFit: 'contain', filter: golden ? 'sepia(1) saturate(1.5) hue-rotate(5deg) brightness(1.2)' : undefined }}
            aria-hidden="true" />
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
            background: 'linear-gradient(145deg, #1a0a12 0%, #200d1a 40%, #160818 100%)',
            border: card?.spinAvailable ? '1.5px solid rgba(255,215,0,0.5)' : '1.5px solid rgba(255,45,120,0.25)',
            boxShadow: card?.spinAvailable ? '0 0 60px rgba(255,215,0,0.18), 0 20px 60px rgba(0,0,0,0.7)' : '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,45,120,0.08)',
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
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #FF2D78 40%, #FF6BA8 60%, transparent)' }} />
            {/* Sparkle dots */}
            {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute', left: `${8 + (i % 6) * 18}%`, top: `${15 + Math.floor(i / 6) * 60}%`,
                    width: '2px', height: '2px', borderRadius: '50%',
                    background: i % 3 === 0 ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.08)', pointerEvents: 'none',
                }} />
            ))}
            {/* Hello Kitty watermark */}
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', pointerEvents: 'none', userSelect: 'none' }}>
                <img src="/hellokitty-new.svg?v=3" alt="" aria-hidden="true" style={{ width: '140px', height: '140px', opacity: 0.15, display: 'block' }} />
            </div>

            <div style={{ padding: '24px 20px 28px', position: 'relative', zIndex: 1 }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-float" delay="0s" />
                        <Bow size={18} animClass="bow-pulse" delay="0.6s" />
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px', border: '2.5px solid rgba(255,45,120,0.6)', boxShadow: '0 0 20px rgba(255,45,120,0.35)', overflow: 'hidden', background: 'rgba(255,45,120,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {userImage ? (<img src={userImage} alt={session.user?.name || 'You'} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />) : (<span style={{ fontSize: '28px', fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700 }}>{session.user?.name?.charAt(0)?.toUpperCase() || '✦'}</span>)}
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1px' }}>{session.user?.name}</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Glam Member</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-pulse" delay="0.3s" />
                        <Bow size={18} animClass="bow-float" delay="0.9s" />
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,45,120,0.2), transparent)', marginBottom: '20px' }} />

                {/* Stamp count */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Stamps Collected</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '44px', color: card?.spinAvailable ? '#FFD700' : '#FF2D78', lineHeight: 1 }}>{currentStamps}</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '20px', color: '#aaa' }}>/</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '22px', color: '#ddd' }}>{TOTAL_STAMPS}</span>
                    </div>
                </div>

                {/* Stamps grid */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                    {Array.from({ length: TOTAL_STAMPS }).map((_, i) => (
                        <HelloKittyStamp key={i} earned={i < currentStamps} isLast={i === TOTAL_STAMPS - 1} index={i} total={TOTAL_STAMPS} />
                    ))}
                </div>

                {/* Progress to Nail Set */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: card?.spinAvailable ? 'linear-gradient(90deg, #FFD700, #FFA500)' : 'linear-gradient(90deg, #FF2D78, #FF6BA8)', borderRadius: '4px', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)', boxShadow: card?.spinAvailable ? '0 0 8px rgba(255,215,0,0.6)' : '0 0 6px rgba(255,45,120,0.5)' }} />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: card?.spinAvailable ? '#FFD700' : '#aaa', fontSize: '12px', textAlign: 'center', fontWeight: card?.spinAvailable ? 600 : 400 }}>
                        {card?.spinAvailable ? '🎉 Free nail set ready — visit us to redeem!' : remaining === 1 ? '💅 1 more visit and you unlock your free nail set!' : remaining <= 3 ? `🌸 So close! Just ${remaining} more visits for your free nail set` : `✨ ${remaining} more visits until your free nail set`}
                    </p>
                </div>

                {/* 🎂 Birthday progress section */}
                <div style={{ borderTop: '1px solid rgba(255,45,120,0.08)', paddingTop: '14px', marginBottom: '4px' }}>
                    {userDob ? (
                        (() => {
                            const days = daysUntilBirthday(userDob);
                            const bPct = birthdayProgress(userDob);
                            const isToday = days === 0;
                            return (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: isToday ? '#FF2D78' : '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                            🎂 Birthday Reward
                                        </span>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: isToday ? '#FFD700' : '#555', fontWeight: 600 }}>
                                            {isToday ? '🎉 Today!' : `${days}d`}
                                        </span>
                                    </div>
                                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden', marginBottom: '5px' }}>
                                        <div style={{
                                            height: '100%',
                                            width: isToday ? '100%' : `${bPct}%`,
                                            background: isToday ? 'linear-gradient(90deg, #FF2D78, #FFD700)' : 'linear-gradient(90deg, rgba(255,45,120,0.4), rgba(255,107,168,0.4))',
                                            borderRadius: '4px',
                                            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                                            boxShadow: isToday ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
                                        }} />
                                    </div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: isToday ? '#FFD700' : '#555', textAlign: 'center', fontWeight: isToday ? 600 : 400 }}>
                                        {isToday
                                            ? (birthdayInfo?.spinGranted || birthdayInfo?.alreadyGranted)
                                                ? '🌟 Happy Birthday! Your free spin the wheel is ready!'
                                                : '🎂 Happy Birthday!'
                                            : `Spin the wheel unlocks on your birthday`}
                                    </p>
                                </div>
                            );
                        })()
                    ) : (
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', textAlign: 'center' }}>
                            🎂 <a href="/profile" style={{ color: '#FF2D78', textDecoration: 'none', fontWeight: 600 }}>Add your birthday</a> to unlock an annual free spin
                        </p>
                    )}
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid rgba(255,45,120,0.1)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '10px', letterSpacing: '2px' }}>GLITZ &amp; GLAMOUR</p>
                        <p style={{ fontFamily: '"Courier New", monospace', color: '#777', fontSize: '11px', letterSpacing: '3px', marginTop: '2px' }}>•••• •••• •••• {(session.user?.email || '').slice(-4).toUpperCase() || '0001'}</p>
                    </div>
                    <div>{card?.spinAvailable ? <span style={{ fontSize: '24px' }}>🌟</span> : <Bow size={22} animClass="bow-pulse" delay="1s" />}</div>
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
    const stats = card?.referralStats;

    return (
        <div style={{
            position: 'relative', borderRadius: '28px', overflow: 'hidden',
            background: 'linear-gradient(145deg, #0a0806 0%, #0f0b05 40%, #0a0806 100%)',
            border: '1.5px solid rgba(212,175,55,0.35)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 50px rgba(212,175,55,0.12)',
            transition: 'all 0.5s ease', flexShrink: 0, width: '100%',
            filter: !isInsider ? 'blur(3px)' : 'none',
            userSelect: !isInsider ? 'none' : 'auto',
            pointerEvents: !isInsider ? 'none' : 'auto',
        }}>
            {/* Gold shimmer sweep */}
            <div style={{
                position: 'absolute', top: 0, left: shimmer ? '120%' : '-60%',
                width: '50%', height: '100%', zIndex: 2, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 30%, rgba(212,175,55,0.08) 50%, transparent 70%)',
                transition: shimmer ? 'left 0.8s ease' : 'none',
            }} />
            {/* Top gold glow line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #FFD700 60%, transparent)' }} />
            {/* Gold sparkle dots */}
            {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute', left: `${8 + (i % 6) * 18}%`, top: `${15 + Math.floor(i / 6) * 60}%`,
                    width: '2px', height: '2px', borderRadius: '50%',
                    background: i % 3 === 0 ? 'rgba(212,175,55,0.5)' : 'rgba(255,215,0,0.1)', pointerEvents: 'none',
                }} />
            ))}
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
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px', border: '2.5px solid rgba(212,175,55,0.7)', boxShadow: '0 0 20px rgba(212,175,55,0.4)', overflow: 'hidden', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {userImage ? (<img src={userImage} alt={session.user?.name || 'You'} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />) : (<span style={{ fontSize: '28px', fontFamily: 'Poppins, sans-serif', color: '#D4AF37', fontWeight: 700 }}>{session.user?.name?.charAt(0)?.toUpperCase() || '✦'}</span>)}
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1px' }}>{session.user?.name}</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#D4AF37', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>⭐ Glam Insider</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <Bow size={26} animClass="bow-pulse" delay="0.3s" golden />
                        <Bow size={18} animClass="bow-float" delay="0.9s" golden />
                    </div>
                </div>

                {/* Gold divider */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)', marginBottom: '20px' }} />

                {/* QR Code section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px', gap: '10px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Your Referral QR</p>
                    <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 0 24px rgba(212,175,55,0.3)' }}>
                        <QRCodeSVG
                            value={referralUrl}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#0a0806"
                            level="M"
                        />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', textAlign: 'center', maxWidth: '220px', lineHeight: 1.5 }}>
                        Share this QR. When your guest completes a booking, you earn a <strong style={{ color: '#D4AF37' }}>free nail set 💅</strong>
                    </p>
                    {/* Referral code text */}
                    {card?.referralCode && (
                        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '6px 16px' }}>
                            <p style={{ fontFamily: '"Courier New", monospace', color: '#D4AF37', fontSize: '13px', letterSpacing: '2px', fontWeight: 700 }}>{card.referralCode}</p>
                        </div>
                    )}
                </div>

                {/* Referral reward badge */}
                {rewards > 0 && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,215,0,0.08))', border: '1.5px solid rgba(212,175,55,0.4)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFD700', fontSize: '16px', marginBottom: '2px' }}>
                            💅 {rewards} Free Nail Set{rewards > 1 ? 's' : ''} Ready!
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px' }}>
                            Visit us to redeem your referral reward{rewards > 1 ? 's' : ''}.
                        </p>
                    </div>
                )}



                {/* Stamp count */}
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Stamps Collected</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '36px', color: '#D4AF37', lineHeight: 1 }}>{currentStamps}</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '18px', color: '#555' }}>/</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px', color: '#777' }}>{TOTAL_STAMPS}</span>
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
                    <div style={{ height: '6px', background: 'rgba(212,175,55,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #D4AF37, #FFD700)', borderRadius: '4px', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }} />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '12px', textAlign: 'center' }}>
<<<<<<< HEAD
                        {remaining <= 0 ? '🎉 Free nail set ready!' : `✨ ${remaining} more visit${remaining > 1 ? 's' : ''} until your free nail set`}
=======
                        {remaining <= 0 ? '🎉 Free spin ready!' : `✨ ${remaining} more visit${remaining > 1 ? 's' : ''} until your free spin`}
>>>>>>> a7fa34923a476d02ba3492394f12a32694860ecf
                    </p>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#D4AF37', fontSize: '10px', letterSpacing: '2px', opacity: 0.7 }}>GLITZ &amp; GLAMOUR</p>
                        <p style={{ fontFamily: '"Courier New", monospace', color: '#444', fontSize: '11px', letterSpacing: '3px', marginTop: '2px' }}>•••• •••• •••• {(session.user?.email || '').slice(-4).toUpperCase() || '0001'}</p>
                    </div>
                    <Bow size={22} animClass="bow-pulse" delay="1s" golden />
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function CardPage() {
    const { data: session, status } = useSession();
    const [card, setCard] = useState<LoyaltyCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [shimmer, setShimmer] = useState(false);
    const [activeCard, setActiveCard] = useState(0); // 0 = MEMBER, 1 = INSIDER
    const [birthdayInfo, setBirthdayInfo] = useState<BirthdayInfo | null>(null);
    const [userDob, setUserDob] = useState<Date | null>(null);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        if (session) {
            fetch('/api/loyalty')
                .then(r => r.json())
                .then(d => { setCard(d.loyaltyCard); setLoading(false); })
                .catch(() => setLoading(false));
            // Check / grant birthday spin
            fetch('/api/birthday-check', { method: 'POST' })
                .then(r => r.json())
                .then(d => setBirthdayInfo(d))
                .catch(() => {});
            // Fetch user DOB for birthday progress bar
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

    if (status === 'loading' || (status === 'authenticated' && loading)) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '340px', height: '380px', borderRadius: '28px' }} />
        </div>
    );

    if (!session) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', zIndex: 1, position: 'relative' }}>
            <style>{`
                ${CARD_STYLES}
                @keyframes lockFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                @keyframes glowPulse { 0%,100%{box-shadow:0 0 30px rgba(255,45,120,0.2)} 50%{box-shadow:0 0 60px rgba(255,45,120,0.45)} }
                .lock-float { animation: lockFloat 2.5s ease-in-out infinite; }
                .card-glow { animation: glowPulse 3s ease-in-out infinite; }
            `}</style>
            <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Glitz &amp; Glamour</p>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', marginBottom: '6px' }}>Loyalty Card</h1>
<<<<<<< HEAD
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px', marginBottom: '28px' }}>Earn a stamp every visit. 10 stamps = a free nail set 💅</p>
=======
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px', marginBottom: '28px' }}>Earn a stamp every visit. 10 stamps = a free service ✨</p>
>>>>>>> a7fa34923a476d02ba3492394f12a32694860ecf
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <div className="card-glow" style={{ background: 'linear-gradient(135deg, #1a0a12 0%, #2d0a1e 50%, #1a0a12 100%)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '24px', padding: '28px 20px', filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '16px' }}>
                            {Array.from({ length: 10 }, (_, i) => (<div key={i} style={{ width: '48px', height: '48px', borderRadius: '50%', background: i < 3 ? 'linear-gradient(135deg,#FF2D78,#FF6BA8)' : 'rgba(255,255,255,0.04)', border: i < 3 ? 'none' : '1.5px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{i < 3 ? '🐱' : ''}</div>))}
                        </div>
                        <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                            <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg,#FF2D78,#FF6BA8)', borderRadius: '4px' }} />
                        </div>
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,3,8,0.6)', backdropFilter: 'blur(2px)', borderRadius: '24px', gap: '10px' }}>
                        <div className="lock-float" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(255,45,120,0.2),rgba(255,45,120,0.05))', border: '1.5px solid rgba(255,45,120,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🔒</div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '15px' }}>Your card is waiting</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px', maxWidth: '200px', lineHeight: 1.5 }}>Sign in to unlock your stamps and rewards</p>
                    </div>
                </div>
                <Link href="/sign-in" className="btn-primary" style={{ display: 'block', fontSize: '15px', padding: '15px', borderRadius: '50px', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        Sign In to Unlock <img src="/new_bowdesign.svg" alt="Bow" width={20} height={20} style={{ objectFit: 'contain' }} />
                    </span>
                </Link>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '12px' }}>
                    No account? <Link href="/sign-in" style={{ color: '#FF2D78', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
                </p>
            </div>
        </div>
    );

    const currentStamps = card?.currentStamps ?? 0;
    const progressPct = Math.min((currentStamps / TOTAL_STAMPS) * 100, 100);
    const remaining = TOTAL_STAMPS - currentStamps;
    const isUnverified = session && !(session.user as { emailVerified?: string | null })?.emailVerified;
    const isInsider = card?.isInsider ?? false;
    const referralUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/sign-in?ref=${card?.referralCode || ''}`
        : `/sign-in?ref=${card?.referralCode || ''}`;

    return (
        <div style={{ minHeight: '100vh', padding: '32px 16px 120px', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <style>{CARD_STYLES}</style>
            {isUnverified && <UnverifiedBanner />}

            {/* Page title */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Glitz &amp; Glamour Studio</p>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '26px', color: '#fff', marginBottom: '2px' }}>Your Loyalty Cards</h1>
<<<<<<< HEAD
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px' }}>Collect 10 Hello Kitties · Earn a free nail set 💅</p>
=======
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px' }}>Collect 10 Hello Kitties · Earn a free spin 🎡</p>
>>>>>>> a7fa34923a476d02ba3492394f12a32694860ecf
            </div>

            {/* ─── SWIPEABLE CARD AREA ────────────────────────────────── */}
            <div style={{ overflow: 'hidden', borderRadius: '28px', marginBottom: '14px', position: 'relative' }}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div className="card-swipe-container" style={{ transform: `translateX(${activeCard === 0 ? '0%' : '-100%'})` }}>
                    {/* Slot 1: GLAM MEMBER */}
                    <div style={{ minWidth: '100%' }}>
                        <GlamMemberCard card={card} session={session} shimmer={shimmer} currentStamps={currentStamps} progressPct={progressPct} remaining={remaining} birthdayInfo={birthdayInfo} userDob={userDob} />
                    </div>
                    {/* Slot 2: GLAM INSIDER */}
                    <div style={{ minWidth: '100%', position: 'relative' }}>
                        <GlamInsiderCard card={card} session={session} isInsider={isInsider} referralUrl={referralUrl} shimmer={shimmer} currentStamps={currentStamps} progressPct={progressPct} remaining={remaining} />
                        {/* Lock overlay for non-insiders */}
                        {!isInsider && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,3,2,0.75)', backdropFilter: 'blur(4px)', borderRadius: '28px', gap: '12px', padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px' }}>🔒</div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#D4AF37', fontSize: '17px', lineHeight: 1.3 }}>Glam Insider Card</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px', lineHeight: 1.6, maxWidth: '240px' }}>
                                    This card is issued to our special customers. Keep visiting and we&apos;ll invite you when the time is right ✨
                                </p>
                                <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50px', padding: '8px 20px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#D4AF37', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>⭐ By Invitation Only</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Card dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <button className="card-dot" id="card-dot-member"
                    onClick={() => setActiveCard(0)}
                    style={{ background: activeCard === 0 ? '#FF2D78' : 'rgba(255,255,255,0.15)', transform: activeCard === 0 ? 'scale(1.2)' : 'scale(1)' }}
                    aria-label="Show Glam Member card" />
                <button className="card-dot" id="card-dot-insider"
                    onClick={() => setActiveCard(1)}
                    style={{ background: activeCard === 1 ? '#D4AF37' : 'rgba(255,255,255,0.15)', transform: activeCard === 1 ? 'scale(1.2)' : 'scale(1)' }}
                    aria-label="Show Glam Insider card" />
            </div>

            {/* Card label */}
            <p style={{ fontFamily: 'Poppins, sans-serif', color: activeCard === 0 ? '#FF2D78' : '#D4AF37', fontSize: '11px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px', transition: 'color 0.3s' }}>
                {activeCard === 0 ? '💗 Glam Member' : '⭐ Glam Insider'}
            </p>

            {/* Insider referral stats — shown below card when on Insider tab */}
            {activeCard === 1 && isInsider && card?.referralStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px', transition: 'opacity 0.3s' }}>
                    {[
                        { label: 'Referrals', value: card.referralStats.totalReferrals, emoji: '👥' },
                        { label: 'Completed', value: card.referralStats.completedReferrals, emoji: '✅' },
                        { label: 'Rewards', value: card.referralRewards ?? 0, emoji: '💅' },
                    ].map(({ label, value, emoji }) => (
                        <div key={label} style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', padding: '14px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{emoji}</div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#D4AF37', fontSize: '22px' }}>{value}</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '10px', marginTop: '2px' }}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Wallet buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/wallet');
                                const data = await res.json();
                                if (data.saveUrl) window.location.href = data.saveUrl;
                                else alert('Failed to generate Wallet pass: ' + data.error);
                            } catch { alert('Error connecting to Server.'); }
                        }}
                        style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0 20px', borderRadius: '24px', height: '48px', fontFamily: 'Product Sans, Roboto, sans-serif', fontSize: '15px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s', width: '220px', justifyContent: 'center' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2">
                            <path d="M510.992 192.735V107.73c0-49.084-36.4-89.087-81.06-89.087H82.082C37.398 19.09 1 59.093 1 107.73v85.004c0 8.634 6.212 15.462 14.069 15.462h481.876c7.856 0 14.047-6.828 14.047-15.462z" fill="#34a853" />
                            <path d="M510.992 267.298V182.74c0-49.107-36.4-89.11-81.06-89.11H82.082C37.398 93.63 1 133.633 1 182.74v85.004c0 8.634 6.212 15.462 14.069 15.462h481.876c7.856-.47 14.047-7.274 14.047-15.908z" fill="#fbbc04" />
                            <path d="M510.992 342.308v-85.005c0-49.106-36.4-89.11-81.06-89.11H82.082C37.398 168.193 1 208.197 1 257.303v85.005c0 8.634 6.212 15.438 14.069 15.438h481.876c7.856-.446 14.047-7.273 14.047-15.438z" fill="#ea4335" />
                            <path d="M325.282 301.39L1 218.66v187.278c0 49.106 36.399 89.11 81.081 89.11h347.851c44.66 0 81.06-40.004 81.06-89.11V215.024l-77.345 61.823c-31.425 24.988-70.728 34.091-108.365 24.542z" fill="#4285f4" />
                        </svg>
                        Add to Google Wallet
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button disabled style={{ background: '#000', border: 'none', color: '#555', height: '48px', padding: '0 20px', borderRadius: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontSize: '15px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'not-allowed', opacity: 0.6 }}>
                            <FaApple size={24} /> Add to Apple Wallet
                        </button>
                        <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#FF2D78', color: 'white', fontSize: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(255,45,120,0.4)', zIndex: 2 }}>Coming Soon</span>
                    </div>
                </div>
            </div>

            {/* Nail Set ready banner (10 stamps) */}
            {card?.spinAvailable && (
                <div style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.1), rgba(255,107,168,0.06))', border: '1.5px solid rgba(255,45,120,0.4)', borderRadius: '18px', padding: '20px', marginBottom: '16px', textAlign: 'center', boxShadow: '0 0 30px rgba(255,45,120,0.1)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💅</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FF2D78', fontSize: '17px', marginBottom: '4px' }}>Free Nail Set Unlocked!</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', lineHeight: 1.6 }}>
                        Come in on your next visit and redeem your free nail set 💗
                    </p>
                </div>
            )}

            {/* Birthday spin banner */}
            {card?.birthdaySpinAvailable && (
                <div style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.06))', border: '1.5px solid rgba(255,215,0,0.4)', borderRadius: '18px', padding: '20px', marginBottom: '16px', textAlign: 'center', boxShadow: '0 0 30px rgba(255,215,0,0.1)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎡</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFD700', fontSize: '17px', marginBottom: '4px' }}>Birthday Spin Unlocked! 🎂</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', lineHeight: 1.6 }}>
                        Come in and we&apos;ll spin the wheel together for a fun birthday surprise <img src="/new_bowdesign.svg" alt="Bow" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }} />
                    </p>
                </div>
            )}

            {/* Stats row */}
            {card && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {[
                        { label: 'Total Visits', value: card.stamps.length, emoji: '💅' },
                        { label: 'All-Time Stamps', value: card.lifetimeStamps, emoji: <img src="/new_bowdesign.svg" alt="Bow" width={20} height={20} style={{ objectFit: 'contain' }} /> },
                        { label: 'Nail Sets Earned', value: card.spinsRedeemed, emoji: '🌸' },
                    ].map(({ label, value, emoji }) => (
                        <div key={label} style={{ background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.1)', borderRadius: '14px', padding: '14px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{emoji}</div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px' }}>{value}</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '10px', marginTop: '2px' }}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* No card yet */}
            {!card && (
                <div style={{ background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.12)', borderRadius: '18px', padding: '36px 24px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                        <img src="/new_bowdesign.svg" alt="Bow" width={48} height={48} style={{ objectFit: 'contain' }} />
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', marginBottom: '20px', lineHeight: 1.7 }}>
                        No stamps yet! Book your first appointment and start collecting Hello Kitties 🌸
                    </p>
                    <Link href="/book" className="btn-primary">Book Now →</Link>
                </div>
            )}

            {/* Visit history */}
            {card?.stamps && card.stamps.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '20px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '16px' }}>🌸</span>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visit History</p>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {card.stamps.slice(0, 10).map((stamp, i) => (
                            <div key={stamp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,107,168,0.1))', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🐱</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px', fontWeight: 500 }}>Visit #{card.stamps.length - i}</p>
                                    {stamp.note && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '12px' }}>{stamp.note}</p>}
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                    <Clock size={10} color="#555" />
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
