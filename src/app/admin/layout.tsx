'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, CalendarDays, Calendar as CalendarIcon, Users, Settings, LogOut, GalleryHorizontal, MoreHorizontal, Image as ImageIcon } from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
    { href: '/admin/calendar', label: 'Calendar', Icon: CalendarIcon },
    { href: '/admin/slider', label: 'Slider', Icon: GalleryHorizontal },
    { href: '/admin/gallery', label: 'Gallery', Icon: ImageIcon },
    { href: '/admin/bookings', label: 'Bookings', Icon: CalendarDays },
    { href: '/admin/customers', label: 'Customers', Icon: Users },
    { href: '/admin/manage', label: 'Manage', Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on route change
    useEffect(() => {
        setShowMoreMenu(false);
    }, [pathname]);

    const isActive = (item: typeof navItems[0]) =>
        item.exact ? pathname === item.href : pathname?.startsWith(item.href);

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <>
            <style>{`
        #admin-sidebar { display: none; }
        #admin-mobile-nav { display: flex; }
        @media (min-width: 768px) {
          #admin-sidebar { display: flex !important; }
          #admin-mobile-nav { display: none !important; }
          #admin-main { padding-bottom: 32px !important; }
        }
      `}</style>

            <div style={{ minHeight: '100dvh', display: 'flex', background: '#0A0A0A' }}>
                {/* Desktop Sidebar */}
                <aside id="admin-sidebar" style={{
                    width: '220px', flexShrink: 0, flexDirection: 'column',
                    background: 'rgba(255,255,255,0.02)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
                }}>
                    <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{
                            fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '16px',
                            background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            marginBottom: '2px',
                        }}>G&G Admin</div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '11px' }}>JoJany Lavalle</p>
                    </div>

                    <nav style={{ flex: 1, padding: '16px 12px' }}>
                        {navItems.map(item => {
                            const active = isActive(item);
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                                    marginBottom: '2px',
                                    background: active ? 'rgba(255,45,120,0.1)' : 'transparent',
                                    border: active ? '1px solid rgba(255,45,120,0.18)' : '1px solid transparent',
                                    transition: 'all 0.2s',
                                }}>
                                    <item.Icon size={16} strokeWidth={active ? 2.5 : 1.75} color={active ? '#FF2D78' : '#555'} />
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? '#FF2D78' : '#555' }}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ padding: '16px' }}>
                        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} style={{
                            width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '13px',
                            transition: 'all 0.2s',
                        }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.25)'; (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#444'; }}>
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', overflowX: 'hidden' }}>
                    <main id="admin-main" style={{ flex: 1, padding: 'clamp(16px, 4vw, 24px) clamp(8px, 2vw, 20px)', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
                        {children}
                    </main>

                    {/* Mobile bottom nav */}
                    <nav id="admin-mobile-nav" style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99,
                        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        justifyContent: 'space-around', alignItems: 'center',
                        minHeight: '64px', padding: '8px 4px calc(8px + env(safe-area-inset-bottom))',
                    }}>
                        {navItems.slice(0, 3).map(item => {
                            const active = isActive(item);
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                                    padding: '6px 12px', textDecoration: 'none', flex: 1,
                                }}>
                                    <item.Icon size={18} strokeWidth={active ? 2.5 : 1.75} color={active ? '#FF2D78' : '#555'} />
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: active ? '#FF2D78' : '#555', fontWeight: active ? 600 : 400 }}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* More Button */}
                        <div ref={menuRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 12px', flex: 1, cursor: 'pointer', position: 'relative' }} onClick={() => setShowMoreMenu(!showMoreMenu)}>
                            <MoreHorizontal size={18} strokeWidth={showMoreMenu ? 2.5 : 1.75} color={showMoreMenu ? '#FF2D78' : '#555'} />
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: showMoreMenu ? '#FF2D78' : '#555', fontWeight: showMoreMenu ? 600 : 400 }}>
                                More
                            </span>

                            {/* Popup Menu */}
                            {showMoreMenu && (
                                <div style={{
                                    position: 'absolute', bottom: 'calc(100% + 10px)', right: '10px',
                                    background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                    padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
                                    minWidth: '140px', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', zIndex: 100
                                }}>
                                    {navItems.slice(3).map(item => {
                                        const active = isActive(item);
                                        return (
                                            <Link key={item.href} href={item.href} style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
                                                background: active ? 'rgba(255,45,120,0.1)' : 'transparent',
                                                transition: 'all 0.2s',
                                            }}>
                                                <item.Icon size={16} strokeWidth={active ? 2.5 : 1.75} color={active ? '#FF2D78' : '#bbb'} />
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: active ? 600 : 400, color: active ? '#FF2D78' : '#eee' }}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}
