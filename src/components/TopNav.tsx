'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function TopNav() {
    const pathname = usePathname();
    const { t, locale, setLocale } = useTranslation();

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/tasks')) return null;

    const links = [
        { href: '/', label: t('nav.home') },
        { href: '/services', label: t('nav.services') },
        { href: '/gallery', label: t('nav.gallery') },
        { href: '/blogs', label: t('nav.blog') },
        { href: '/reviews', label: t('nav.reviews') },
        { href: '/special-events', label: t('nav.events') },
        { href: '/book', label: t('nav.bookNow'), isButton: true },
    ];

    const localeCode = (l: Locale) => (l === 'en' ? 'US' : 'MX');
    const localeLabel = (l: Locale) => (l === 'en' ? 'EN' : 'ES');

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
        .mobile-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            height: 56px;
        }
        .mobile-nav-logo {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            text-decoration: none;
        }
        .mobile-nav-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .mobile-nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,45,120,0.1);
            color: #FF2D78;
        }
        .lang-toggle {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.14);
            border-radius: 50px;
            padding: 5px 10px 5px 8px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
            font-weight: 700;
            color: #ddd;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
            white-space: nowrap;
            line-height: 1;
            appearance: none;
        }
        .lang-toggle:hover {
            background: rgba(255,45,120,0.14);
            border-color: rgba(255,45,120,0.4);
            color: #FF2D78;
        }
        .lang-toggle:active {
            transform: scale(0.95);
        }
        .lang-select-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .lang-caret {
            position: absolute;
            right: 10px;
            pointer-events: none;
            color: #777;
            font-size: 11px;
            line-height: 1;
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

            {/* --- MOBILE NAV --- */}
            <div className="mobile-nav">
                <Link href="/" className="mobile-nav-logo">
                    <Image
                        src="/logo.svg"
                        alt="Glitz & Glamour"
                        width={120}
                        height={69}
                        priority
                        style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
                    />
                </Link>
                <div className="mobile-nav-actions">
                    {/* Language Dropdown */}
                    <div className="lang-select-wrap" aria-label="Language selector">
                        <ReactCountryFlag
                            countryCode={localeCode(locale)}
                            svg
                            style={{ width: '18px', height: '13px', borderRadius: '2px' }}
                            aria-hidden
                        />
                        <select
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as Locale)}
                            className="lang-toggle"
                            aria-label="Select language"
                            style={{ paddingRight: '26px' }}
                        >
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                        </select>
                        <span className="lang-caret" aria-hidden>▾</span>
                    </div>
                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/glitzandglamourstudio/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-nav-icon"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>
            </div>

            {/* --- DESKTOP NAV --- */}
            <div className="desktop-nav">
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <Image src="/logo.svg" alt="Glitz & Glamour" width={180} height={40} priority style={{ objectFit: 'contain' }} />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {links.map(({ href, label, isButton }) =>
                        isButton ? (
                            <Link key={href} href={href} style={{
                                fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px',
                                padding: '9px 22px', borderRadius: '50px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)',
                                color: '#fff', textDecoration: 'none', transition: 'all 0.2s ease', marginLeft: '8px',
                            }}>
                                {label}
                            </Link>
                        ) : (
                            <Link key={href} href={href} style={{
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

                    {/* Language Dropdown */}
                    <div className="lang-select-wrap" style={{ marginLeft: '8px' }} aria-label="Language selector">
                        <ReactCountryFlag
                            countryCode={localeCode(locale)}
                            svg
                            style={{ width: '18px', height: '13px', borderRadius: '2px' }}
                            aria-hidden
                        />
                        <select
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as Locale)}
                            className="lang-toggle"
                            aria-label="Select language"
                            style={{ paddingRight: '26px' }}
                        >
                            <option value="en">{localeLabel('en')}</option>
                            <option value="es">{localeLabel('es')}</option>
                        </select>
                        <span className="lang-caret" aria-hidden>▾</span>
                    </div>

                    {/* Instagram */}
                    <a href="https://www.instagram.com/glitzandglamourstudio/" target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)', marginLeft: '4px',
                            color: '#fff', transition: 'all 0.2s',
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,120,0.15)'; (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>
            </div>
        </header>
    );
}
