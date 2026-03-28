'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ChevronRight } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();
    
    // Don't show footer on admin or task paths
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/tasks') || pathname?.startsWith('/leave-review')) {
        return null;
    }

    return (
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '40px' }}>
            <style>{`
                .footer-inner {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 24px 20px;
                }
                .footer-brand { text-align: center; margin-bottom: 24px; }
                .footer-brand-name {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: 24px;
                    background: linear-gradient(135deg, #FF2D78, #FF6BA8, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.5px;
                    margin-bottom: 4px;
                }
                .footer-tagline {
                    font-family: 'Poppins', sans-serif;
                    color: #666;
                    font-size: 12px;
                }
                .footer-cta { display: flex; justify-content: center; margin-bottom: 24px; }
                .footer-contact-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                    margin-bottom: 22px;
                }
                .footer-contact-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 50px;
                    padding: 7px 13px;
                    font-family: 'Poppins', sans-serif;
                    color: #ccc;
                    font-size: 12px;
                    text-decoration: none;
                    transition: border-color 0.2s, color 0.2s;
                    white-space: nowrap;
                }
                .footer-contact-pill:hover { border-color: rgba(255,45,120,0.4); color: #FF2D78; }
                .footer-hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0 0 18px; }
                .footer-nav {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 2px 4px;
                    margin-bottom: 22px;
                }
                .footer-nav a {
                    font-family: 'Poppins', sans-serif;
                    color: #666;
                    font-size: 13px;
                    text-decoration: none;
                    padding: 5px 10px;
                    border-radius: 50px;
                    transition: color 0.2s, background 0.2s;
                }
                .footer-nav a:hover { color: #FF2D78; background: rgba(255,45,120,0.07); }
                .footer-payments {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 7px;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .footer-pay-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 8px;
                    height: 30px;
                    padding: 0 11px;
                    font-family: 'Poppins', sans-serif;
                    color: #bbb;
                    font-size: 11px;
                    font-weight: 500;
                }
                .footer-bottom {
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 14px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    text-align: center;
                    padding-bottom: calc(85px + env(safe-area-inset-bottom));
                }
                @media (min-width: 768px) {
                    .footer-bottom { padding-bottom: 20px; }
                }
                .footer-bottom p {
                    font-family: 'Poppins', sans-serif;
                    color: #444;
                    font-size: 11px;
                    margin: 0;
                }
                .footer-bottom a { color: #FF2D78; text-decoration: none; }
            `}</style>
            
            <div className="footer-inner">
                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-brand-name">Glitz &amp; Glamour</div>
                    <div className="footer-tagline">By JoJany Lavalle · Vista, CA 92084</div>
                </div>

                {/* Book CTA */}
                <div className="footer-cta">
                    <Link href="/book" className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                        Book Appointment <ChevronRight size={15} />
                    </Link>
                </div>

                {/* Contact pills */}
                <div className="footer-contact-row">
                    <a className="footer-contact-pill" href="https://maps.google.com/?q=812+Frances+Dr+Vista+CA+92084" target="_blank" rel="noopener">
                        <MapPin size={12} color="#FF2D78" />
                        812 Frances Dr, Vista CA
                    </a>
                    <a className="footer-contact-pill" href="tel:+17602905910">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.73 1.18 2 2 0 012.71 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.17a16 16 0 006.29 6.29l1.45-1.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.19v2.73z" /></svg>
                        +1 (760) 290-5910
                    </a>
                    <a className="footer-contact-pill" href="mailto:info@glitzandglamours.com">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        Email Us
                    </a>
                    <a className="footer-contact-pill" href="https://www.instagram.com/glitzandglamourstudio/" target="_blank" rel="noopener noreferrer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        Follow Us
                    </a>
                </div>

                <hr className="footer-hr" />

                {/* Nav */}
                <nav className="footer-nav">
                    {[
                        ['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], 
                        ['/book', 'Book'], ['/gallery', 'Gallery'], ['/reviews', 'Reviews'], 
                        ['/policy', 'Studio Policies'], ['/waiver', 'Liability Waiver'], 
                        ['/terms', 'Terms of Service'], ['/privacy', 'Privacy Policy']
                    ].map(([href, label]) => (
                        <Link key={href} href={href}>{label}</Link>
                    ))}
                </nav>

                {/* Payment methods */}
                <div className="footer-payments">
                    <div className="footer-pay-chip">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                        Cash
                    </div>
                    <a className="footer-pay-chip" href="https://venmo.com/jojanylavalle" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                        <svg width="30" height="11" viewBox="0 0 512 512" fill="#008CFF"><path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z" /></svg>
                        @jojanylavalle
                    </a>
                    <a className="footer-pay-chip" href="https://enroll.zellepay.com/qr-codes?data=eyJ0b2tlbiI6ImpvamFueWxhdmFsbGVAaWNsb3VkLmNvbSIsIm5hbWUiOiJKT0pBTlkifQ==" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                        <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#752EE1" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22C42,38.866,38.866,42,35,42z" /><path fill="#fff" d="M17.5,18.5h14c0.552,0,1-0.448,1-1V15c0-0.552-0.448-1-1-1h-14c-0.552,0-1,0.448-1,1v2.5C16.5,18.052,16.948,18.5,17.5,18.5z" /><path fill="#fff" d="M17,34.5h14.5c0.552,0,1-0.448,1-1V31c0-0.552-0.448-1-1-1H17c-0.552,0-1,0.448-1,1v2.5C16,34.052,16.448,34.5,17,34.5z" /><path fill="#fff" d="M16.578,30.938H22l10.294-12.839c0.178-0.222,0.019-0.552-0.266-0.552H26.5L16.275,30.298C16.065,30.553,16.247,30.938,16.578,30.938z" /></svg>
                        Zelle
                    </a>
                    <a className="footer-pay-chip" href="https://cash.app/$glamaddictbyjojo" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 32 32" fill="#00D632"><path d="M31.453 4.625c-0.688-1.891-2.177-3.375-4.068-4.063-1.745-0.563-3.333-0.563-6.557-0.563h-9.682c-3.198 0-4.813 0-6.531 0.531-1.896 0.693-3.385 2.188-4.068 4.083-0.547 1.734-0.547 3.333-0.547 6.531v9.693c0 3.214 0 4.802 0.531 6.536 0.688 1.891 2.177 3.375 4.068 4.063 1.734 0.547 3.333 0.547 6.536 0.547h9.703c3.214 0 4.813 0 6.536-0.531 1.896-0.688 3.391-2.182 4.078-4.078 0.547-1.734 0.547-3.333 0.547-6.536v-9.667c0-3.214 0-4.813-0.547-6.547zM23.229 10.802l-1.245 1.24c-0.25 0.229-0.635 0.234-0.891 0.010-1.203-1.010-2.724-1.568-4.292-1.573-1.297 0-2.589 0.427-2.589 1.615 0 1.198 1.385 1.599 2.984 2.198 2.802 0.938 5.12 2.109 5.12 4.854 0 2.99-2.318 5.042-6.104 5.266l-0.349 1.604c-0.063 0.302-0.328 0.516-0.635 0.516h-2.391l-0.12-0.010c-0.354-0.078-0.578-0.432-0.505-0.786l0.375-1.693c-1.438-0.359-2.76-1.083-3.844-2.094v-0.016c-0.25-0.25-0.25-0.656 0-0.906l1.333-1.292c0.255-0.234 0.646-0.234 0.896 0 1.214 1.146 2.839 1.786 4.521 1.76 1.734 0 2.891-0.734 2.891-1.896s-1.172-1.464-3.385-2.292c-2.349-0.839-4.573-2.026-4.573-4.802 0-3.224 2.677-4.797 5.854-4.943l0.333-1.641c0.063-0.302 0.333-0.516 0.641-0.51h2.37l0.135 0.016c0.344 0.078 0.573 0.411 0.495 0.76l-0.359 1.828c1.198 0.396 2.333 1.026 3.302 1.849l0.031 0.031c0.25 0.266 0.25 0.667 0 0.906z" /></svg>
                        $glamaddictbyjojo
                    </a>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom">
                    <p>© 2026 Glitz &amp; Glamour Studio · Vista, CA 92084</p>
                    <p>Powered by <a href="https://projekts.pk" rel="noopener" target="_blank">projekts.pk</a></p>
                </div>
            </div>
        </footer>
    );
}
