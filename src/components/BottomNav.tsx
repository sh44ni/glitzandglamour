'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Sparkles, CreditCard, User, Image as ImageIcon } from 'lucide-react';

const tabs = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/services', label: 'Services', Icon: Sparkles },
    { href: '/gallery', label: 'Gallery', Icon: ImageIcon },
    { href: '/card', label: 'Card', Icon: CreditCard, requiresAuth: true },
    { href: '/profile', label: 'Profile', Icon: User, requiresAuth: true },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (pathname?.startsWith('/admin')) return null;

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href);

    return (
        <>
            {/* Inline media query: nav visible only on mobile */}
            <style>{`
        #bottom-nav {
          display: flex;
        }
        @media (min-width: 768px) {
          #bottom-nav { display: none !important; }
          #bottom-nav-spacer { display: none !important; }
        }
      `}</style>

            <nav
                id="bottom-nav"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 99,
                    background: 'rgba(10,10,10,0.94)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    height: '64px',
                }}
            >
                {tabs.map(({ href, label, Icon, requiresAuth }) => {
                    const active = isActive(href);
                    const dest = requiresAuth && !session ? '/sign-in' : href;
                    return (
                        <Link key={href} href={dest}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                                padding: '8px 20px', textDecoration: 'none', flex: 1, position: 'relative',
                            }}>
                            {active && (
                                <span style={{
                                    position: 'absolute', top: 0, left: '25%', right: '25%',
                                    height: '2px', background: 'linear-gradient(90deg, transparent, #FF2D78, transparent)',
                                    borderRadius: '0 0 2px 2px',
                                }} />
                            )}
                            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} color={active ? '#FF2D78' : '#aaa'} />
                            <span style={{
                                fontSize: '10px', fontWeight: active ? 600 : 400,
                                fontFamily: 'Poppins, sans-serif',
                                color: active ? '#FF2D78' : '#aaa',
                                letterSpacing: '0.2px',
                            }}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Spacer so content doesn't hide behind nav */}
            <div id="bottom-nav-spacer" style={{ height: '64px' }} />
        </>
    );
}
