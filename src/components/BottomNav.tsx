'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Sparkles, Star, CreditCard, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function BottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [pressed, setPressed] = useState<string | null>(null);
    const { t } = useTranslation();

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/tasks') || pathname?.startsWith('/sign')) return null;

    // Left side tabs
    const leftTabs = [
        { href: '/', label: t('nav.home'), Icon: Home },
        { href: '/services', label: t('nav.services'), Icon: Sparkles },
    ];

    // Right side tabs
    const rightTabs = [
        { href: '/special-events', label: 'Events', Icon: Star },
        { href: '/profile', label: t('nav.profile'), Icon: User },
    ];

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href);

    const TabItem = ({ href, label, Icon }: { href: string; label: string; Icon: React.ElementType }) => {
        const active = isActive(href);
        const isPressed = pressed === href;
        return (
            <Link
                href={href}
                prefetch
                className={`nav-tab${isPressed ? ' nav-tab-pressed' : ''}`}
                onTouchStart={() => setPressed(href)}
                onTouchEnd={() => setTimeout(() => setPressed(null), 300)}
                onMouseDown={() => setPressed(href)}
                onMouseUp={() => setTimeout(() => setPressed(null), 300)}
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                    padding: '8px 0', textDecoration: 'none', flex: 1, position: 'relative',
                    minWidth: 0,
                }}
            >
                {active && (
                    <span
                        className="nav-active-line"
                        style={{
                            position: 'absolute', top: 0, left: '20%', right: '20%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #FF2D78, transparent)',
                            borderRadius: '0 0 2px 2px',
                        }}
                    />
                )}
                {active && (
                    <span className="nav-glow-dot" style={{
                        position: 'absolute', bottom: '6px',
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: '#FF2D78',
                        boxShadow: '0 0 8px 2px rgba(255,45,120,0.7)',
                    }} />
                )}
                <span className="nav-icon" style={{ position: 'relative' }}>
                    {active && <span className="nav-sparkle-ring" />}
                    <Icon
                        size={20}
                        strokeWidth={active ? 2.5 : 1.75}
                        color={active ? '#FF2D78' : '#666'}
                    />
                </span>
                <span style={{
                    fontSize: '10px', fontWeight: active ? 700 : 400,
                    fontFamily: 'Poppins, sans-serif',
                    color: active ? '#FF2D78' : '#666',
                    letterSpacing: '0.3px',
                    lineHeight: 1,
                }}>
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <>
            <style>{`
                #bottom-nav { display: flex; }
                @media (min-width: 768px) {
                    #bottom-nav { display: none !important; }
                    #bottom-nav-spacer { display: none !important; }
                }
                .nav-tab {
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    user-select: none;
                }
                .nav-tab:active .nav-icon {
                    transform: scale(0.80);
                }
                .nav-icon {
                    transition: transform 160ms cubic-bezier(0.34,1.56,0.64,1);
                    will-change: transform;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes navPop {
                    0%   { transform: scale(1); }
                    40%  { transform: scale(0.76); }
                    100% { transform: scale(1); }
                }
                .nav-tab-pressed .nav-icon {
                    animation: navPop 280ms cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes activeSlide {
                    from { opacity: 0; transform: scaleX(0); }
                    to   { opacity: 1; transform: scaleX(1); }
                }
                .nav-active-line {
                    animation: activeSlide 220ms ease-out both;
                    transform-origin: center;
                }
                /* Sparkle ring on active icon */
                .nav-sparkle-ring {
                    position: absolute;
                    inset: -5px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,45,120,0.35);
                    animation: sparkleRing 2s ease-in-out infinite;
                    pointer-events: none;
                }
                @keyframes sparkleRing {
                    0%, 100% { transform: scale(1);   opacity: 0.35; }
                    50%       { transform: scale(1.25); opacity: 0;    }
                }
                /* Center Book button */
                .nav-book-btn {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    text-decoration: none;
                    flex-shrink: 0;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    user-select: none;
                }
                .nav-book-ring {
                    position: absolute;
                    width: 62px;
                    height: 62px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,45,120,0.25);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -58%);
                    animation: bookRingPulse 2.8s ease-in-out infinite;
                    pointer-events: none;
                }
                @keyframes bookRingPulse {
                    0%, 100% { transform: translate(-50%, -58%) scale(1);    opacity: 0.25; }
                    50%       { transform: translate(-50%, -58%) scale(1.18); opacity: 0;    }
                }
                .nav-book-circle {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF2D78 0%, #ff6ba8 50%, #c0185e 100%);
                    box-shadow:
                        0 4px 16px rgba(255,45,120,0.55),
                        0 0 0 2px rgba(255,45,120,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: translateY(-14px);
                    transition: transform 160ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 160ms ease;
                    position: relative;
                    overflow: hidden;
                }
                .nav-book-circle::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
                    pointer-events: none;
                }
                .nav-book-btn:active .nav-book-circle {
                    transform: translateY(-14px) scale(0.90);
                    box-shadow: 0 2px 8px rgba(255,45,120,0.4);
                }
                .nav-book-label {
                    font-family: 'Poppins', sans-serif;
                    font-size: 10px;
                    font-weight: 700;
                    color: #FF2D78;
                    letter-spacing: 0.5px;
                    transform: translateY(-2px);
                    text-transform: uppercase;
                }
                /* Shimmer sweep on book circle */
                @keyframes bookShimmer {
                    0%   { transform: translateX(-120%) skewX(-20deg); }
                    100% { transform: translateX(200%)  skewX(-20deg); }
                }
                .nav-book-circle::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%);
                    animation: bookShimmer 3.5s ease-in-out infinite;
                    border-radius: 50%;
                }
            `}</style>

            <nav
                id="bottom-nav"
                style={{
                    position: 'fixed',
                    bottom: 0, left: 0, right: 0,
                    zIndex: 99,
                    background: 'rgba(8,8,8,0.94)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    borderTop: '1px solid rgba(255,45,120,0.12)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    height: '64px',
                }}
            >
                {/* Left tabs */}
                {leftTabs.map(({ href, label, Icon }) => (
                    <TabItem key={href} href={href} label={label} Icon={Icon} />
                ))}

                {/* Center Book CTA */}
                <Link
                    href="/book"
                    className="nav-book-btn"
                    style={{ padding: '0 4px' }}
                >
                    <span className="nav-book-ring" />
                    <span className="nav-book-circle">
                        {/* Scissor / sparkle icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </span>
                    <span className="nav-book-label">Book</span>
                </Link>

                {/* Right tabs */}
                {rightTabs.map(({ href, label, Icon }) => (
                    <TabItem key={href} href={href} label={label} Icon={Icon} />
                ))}
            </nav>

            <div id="bottom-nav-spacer" style={{ height: '64px' }} />
        </>
    );
}
