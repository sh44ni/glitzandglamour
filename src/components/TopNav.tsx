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
            justify-content: space-between;
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

            {/* --- MOBILE NAV (Logo & Social) --- */}
            <div className="mobile-nav">
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <Image src="/logo.svg" alt="Glitz & Glamour" width={160} height={35} priority style={{ objectFit: 'contain' }} />
                </Link>
                <a href="https://www.instagram.com/glitzandglamourstudio/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,45,120,0.1)', color: '#FF2D78', transition: 'background 0.2s' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
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
                    <a href="https://www.instagram.com/glitzandglamourstudio/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', marginLeft: '8px', color: '#fff', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,45,120,0.15)', e.currentTarget.style.color = '#FF2D78')} onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = '#fff')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                </div>
            </div>
        </header>
    );
}
