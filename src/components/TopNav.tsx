'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Image from 'next/image';

const links = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/book', label: 'Book Now', isButton: true },
];

export default function TopNav() {
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return null;

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(10,10,10,0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <style>{`
        /* Mobile logo center */
        .mobile-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px 20px;
        }
        .desktop-nav {
            display: none;
        }
        @media (min-width: 768px) {
            .mobile-nav { display: none; }
            .desktop-nav {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 40px;
            }
        }
      `}</style>

            {/* --- MOBILE NAV (Logo only) --- */}
            <div className="mobile-nav">
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <Image src="/logo.svg" alt="Glitz & Glamour" width={160} height={35} priority style={{ objectFit: 'contain' }} />
                </Link>
            </div>

            {/* --- DESKTOP NAV --- */}
            <div className="desktop-nav">
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <Image src="/logo.svg" alt="Glitz & Glamour" width={180} height={40} priority style={{ objectFit: 'contain' }} />
                </Link>

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {links.map(({ href, label, isButton }) =>
                        isButton ? (
                            <Link key={href} href={href}
                                style={{
                                    fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px',
                                    padding: '9px 22px', borderRadius: '50px',
                                    background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)',
                                    color: '#fff', textDecoration: 'none', transition: 'all 0.2s ease',
                                }}>
                                {label}
                            </Link>
                        ) : (
                            <Link key={href} href={href}
                                style={{
                                    color: pathname === href ? '#FF2D78' : '#666',
                                    textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                                    fontFamily: 'Poppins, sans-serif', padding: '8px 14px',
                                    borderRadius: '8px', transition: 'color 0.2s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.color = '#FF2D78')}
                                onMouseOut={e => (e.currentTarget.style.color = pathname === href ? '#FF2D78' : '#666')}
                            >
                                {label}
                            </Link>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
