'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function TopNav() {
    const pathname = usePathname();
    const { t, locale, setLocale } = useTranslation();

    if (pathname?.startsWith('/admin')) return null;

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
        <>
        <div className="topnav-spacer" aria-hidden="true" />
        <header className="topnav-shell">
            <style>{`
                .topnav-spacer {
                    height: 64px;
                    pointer-events: none;
                }
                .topnav-shell {
                    position: fixed;
                    top: calc(env(safe-area-inset-top, 0px) + 12px);
                    left: 0;
                    right: 0;
                    z-index: 100;
                    padding: 0 clamp(12px, 3vw, 32px);
                    pointer-events: none;
                }
                .topnav-pill {
                    pointer-events: auto;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 8px 12px 8px 20px;
                    background: rgba(12, 10, 12, 0.94);
                    border: 1.5px solid rgba(255, 255, 255, 0.16);
                    border-radius: 999px;
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 45, 135, 0.1);
                }
                .topnav-logo {
                    display: inline-flex;
                    align-items: center;
                    text-decoration: none;
                    flex-shrink: 0;
                    min-height: 44px;
                }
                .topnav-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .topnav-link {
                    display: none;
                    align-items: center;
                    justify-content: center;
                    min-height: 44px;
                    padding: 8px 14px;
                    border-radius: 999px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: #d8d8d8;
                    text-decoration: none;
                    transition: color 0.2s ease, background 0.2s ease;
                    white-space: nowrap;
                }
                .topnav-link:hover {
                    color: #FF6BA8;
                    background: rgba(255, 45, 135, 0.1);
                }
                .topnav-link.is-active {
                    color: #ff2d87;
                }
                .topnav-book-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 44px;
                    padding: 9px 20px;
                    border-radius: 999px;
                    background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.22);
                    color: #ffffff;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 13.5px;
                    text-decoration: none;
                    white-space: nowrap;
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                .topnav-book-btn:hover {
                    transform: translate(-2px, -2px);
                    box-shadow: 6px 6px 0 #ff2d87;
                }
                .lang-switch-capsule {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    padding: 3px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1.5px solid rgba(255, 255, 255, 0.14);
                    border-radius: 999px;
                    flex-shrink: 0;
                }
                .lang-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 32px;
                    padding: 0 10px;
                    border-radius: 999px;
                    border: none;
                    background: transparent;
                    color: #9a8d94;
                    font-family: 'Poppins', sans-serif;
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    line-height: 1;
                    cursor: pointer;
                    transition: color 0.18s ease, background 0.18s ease;
                    white-space: nowrap;
                }
                .lang-pill-btn:hover:not(.is-active) {
                    color: #ffffff;
                }
                .lang-pill-btn.is-active {
                    background: rgba(255, 255, 255, 0.12);
                    color: #ffffff;
                }
                .topnav-ig {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1.5px solid rgba(255, 255, 255, 0.16);
                    color: #ffffff;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                }
                .topnav-ig:hover {
                    background: rgba(255, 45, 135, 0.16);
                    border-color: #ff2d87;
                    color: #ff2d87;
                    transform: translate(-2px, -2px);
                    box-shadow: 4px 4px 0 #ff2d87;
                }
                @media (min-width: 900px) {
                    .topnav-link {
                        display: inline-flex;
                    }
                    .topnav-pill {
                        padding: 10px 16px 10px 26px;
                    }
                }
                @media (max-width: 480px) {
                    .topnav-pill {
                        padding: 6px 10px 6px 14px;
                        gap: 8px;
                    }
                    .topnav-book-btn {
                        padding: 8px 14px;
                        font-size: 12.5px;
                    }
                    .lang-pill-btn {
                        padding: 4px 8px;
                        font-size: 11px;
                        gap: 4px;
                        min-height: 30px;
                    }
                    .lang-switch-capsule {
                        min-height: 36px;
                    }
                }
            `}</style>

            <nav className="topnav-pill" aria-label="Primary navigation">
                <a href="/" className="topnav-logo">
                    <img
                        src="/logo-sm.webp"
                        alt="Glitz & Glamour"
                        width={62}
                        height={36}
                        fetchPriority="high"
                        decoding="sync"
                        style={{ objectFit: 'contain', height: '36px', width: '62px' }}
                    />
                </a>

                <div className="topnav-right">
                    {links.map(({ href, label, isButton }) =>
                        isButton ? (
                            <a key={href} href={href} className="topnav-book-btn">
                                {label}
                            </a>
                        ) : (
                            <a
                                key={href}
                                href={href}
                                className={`topnav-link ${pathname === href ? 'is-active' : ''}`}
                            >
                                {label}
                            </a>
                        )
                    )}

                    {/* Minimal Language Switcher */}
                    <div className="lang-switch-capsule" role="group" aria-label="Language selector">
                        <button
                            type="button"
                            onClick={() => setLocale('en')}
                            className={`lang-pill-btn ${locale === 'en' ? 'is-active' : ''}`}
                            aria-pressed={locale === 'en'}
                            aria-label="EN — Switch language to English"
                        >
                            {localeLabel('en')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setLocale('es')}
                            className={`lang-pill-btn ${locale === 'es' ? 'is-active' : ''}`}
                            aria-pressed={locale === 'es'}
                            aria-label="ES — Cambiar idioma a Español"
                        >
                            {localeLabel('es')}
                        </button>
                    </div>

                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/glitzandglamourstudio/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="topnav-ig"
                        aria-label="Follow us on Instagram"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>
            </nav>
        </header>
        </>
    );
}
