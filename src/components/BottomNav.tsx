'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Sparkles, CreditCard, User, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function BottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [pressed, setPressed] = useState<string | null>(null);
    const { t } = useTranslation();

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/tasks') || pathname?.startsWith('/sign')) return null;

    const tabs = [
        { href: '/', label: t('nav.home'), Icon: Home },
        { href: '/services', label: t('nav.services'), Icon: Sparkles },
        { href: '/blogs', label: t('nav.blog'), Icon: BookOpen },
        { href: '/card', label: t('nav.card'), Icon: CreditCard, requiresAuth: true },
        { href: '/profile', label: t('nav.profile'), Icon: User, requiresAuth: true },
    ];

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href);

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
                    transform: scale(0.82);
                }
                .nav-icon {
                    transition: transform 160ms cubic-bezier(0.34,1.56,0.64,1);
                    will-change: transform;
                }
                @keyframes navPop {
                    0% { transform: scale(1); }
                    40% { transform: scale(0.78); }
                    100% { transform: scale(1); }
                }
                .nav-tab-pressed .nav-icon {
                    animation: navPop 280ms cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes activeSlide {
                    from { opacity: 0; transform: scaleX(0); }
                    to { opacity: 1; transform: scaleX(1); }
                }
                .nav-active-line {
                    animation: activeSlide 200ms ease-out both;
                    transform-origin: center;
                }
            `}</style>

            <nav
                id="bottom-nav"
                style={{
                    position: 'fixed',
                    bottom: 0, left: 0, right: 0,
                    zIndex: 99,
                    background: 'rgba(10,10,10,0.92)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    height: '64px',
                }}
            >
                {tabs.map(({ href, label, Icon }) => {
                    const active = isActive(href);
                    const isPressed = pressed === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            prefetch
                            className={`nav-tab${isPressed ? ' nav-tab-pressed' : ''}`}
                            onTouchStart={() => setPressed(href)}
                            onTouchEnd={() => setTimeout(() => setPressed(null), 300)}
                            onMouseDown={() => setPressed(href)}
                            onMouseUp={() => setTimeout(() => setPressed(null), 300)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                                padding: '8px 20px', textDecoration: 'none', flex: 1, position: 'relative',
                            }}
                        >
                            {active && (
                                <span
                                    className="nav-active-line"
                                    style={{
                                        position: 'absolute', top: 0, left: '25%', right: '25%',
                                        height: '2px',
                                        background: 'linear-gradient(90deg, transparent, #FF2D78, transparent)',
                                        borderRadius: '0 0 2px 2px',
                                    }}
                                />
                            )}
                            {active && (
                                <span style={{
                                    position: 'absolute', bottom: '8px',
                                    width: '4px', height: '4px', borderRadius: '50%',
                                    background: '#FF2D78',
                                    boxShadow: '0 0 6px rgba(255,45,120,0.8)',
                                }} />
                            )}
                            <span className="nav-icon">
                                <Icon
                                    size={20}
                                    strokeWidth={active ? 2.5 : 1.75}
                                    color={active ? '#FF2D78' : '#888'}
                                />
                            </span>
                            <span style={{
                                fontSize: '10px', fontWeight: active ? 600 : 400,
                                fontFamily: 'Poppins, sans-serif',
                                color: active ? '#FF2D78' : '#888',
                                letterSpacing: '0.2px',
                            }}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div id="bottom-nav-spacer" style={{ height: '64px' }} />
        </>
    );
}
