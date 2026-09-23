'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, CalendarDays, Calendar as CalendarIcon, Users, Settings, LogOut, GalleryHorizontal, MoreHorizontal, Image as ImageIcon, X, MessageSquare, MessageCircle, Bell, BookOpen, CreditCard, Tag, FileSignature, ShieldBan, Megaphone, Smartphone, Sparkles } from 'lucide-react';

async function adminSignOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
}

const navItems = [
    { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
    { href: '/admin/bookings', label: 'Bookings', Icon: CalendarDays },
    { href: '/admin/calendar', label: 'Calendar', Icon: CalendarIcon },
    { href: '/admin/customers', label: 'Clients', Icon: Users },
    { href: '/admin/blocklist', label: 'Blocklist', Icon: ShieldBan },
    { href: '/admin/blogs', label: 'Blogs', Icon: BookOpen },
    { href: '/admin/reviews', label: 'Reviews', Icon: MessageSquare },
    { href: '/admin/codes', label: 'Discount Codes', Icon: Tag },
    { href: '/admin/contracts', label: 'Special Events', Icon: FileSignature },
    { href: '/admin/chats', label: 'AI Chats', Icon: MessageCircle },
    { href: '/admin/notifications', label: 'Notifications', Icon: Bell },
    { href: '/admin/campaigns', label: 'SMS Campaigns', Icon: Megaphone },
    { href: '/admin/push-notifications', label: 'Push Notifications', Icon: Smartphone },
    { href: '/admin/slider', label: 'Slider', Icon: GalleryHorizontal },
    { href: '/admin/gallery', label: 'Gallery', Icon: ImageIcon },
    { href: '/admin/wallet', label: 'Wallet Push', Icon: CreditCard },
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
        @keyframes slideUpAdmin {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        @keyframes pulseDot {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(2.2); opacity: 0; }
            100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

            <div style={{ minHeight: '100dvh', display: 'flex', background: '#0A0A0E' }}>
                {/* Desktop Sidebar with Apple Liquid Glass Look */}
                <aside id="admin-sidebar" style={{
                    width: '236px', flexShrink: 0, flexDirection: 'column',
                    background: 'rgba(16, 16, 22, 0.72)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
                    zIndex: 40,
                }}>
                    {/* Brand Header */}
                    <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <Link href="/admin" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            <Image
                                src="/logo.svg"
                                alt="Glitz & Glamour Studio"
                                width={145}
                                height={38}
                                priority
                                style={{ objectFit: 'contain', width: 'auto', height: '34px', filter: 'drop-shadow(0 2px 8px rgba(255,45,120,0.25))' }}
                            />
                        </Link>
                    </div>

                    <nav style={{ flex: 1, padding: '16px 12px' }}>
                        {navItems.map(item => {
                            const active = isActive(item);
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', borderRadius: '12px', textDecoration: 'none',
                                    marginBottom: '3px',
                                    background: active ? 'linear-gradient(135deg, rgba(255,45,120,0.18) 0%, rgba(255,45,120,0.06) 100%)' : 'transparent',
                                    border: active ? '1px solid rgba(255,45,120,0.3)' : '1px solid transparent',
                                    boxShadow: active ? '0 4px 14px rgba(255,45,120,0.15)' : 'none',
                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}>
                                    <item.Icon size={16} strokeWidth={active ? 2.5 : 1.75} color={active ? '#FF2D78' : '#666'} />
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 450, color: active ? '#FF2D78' : '#888' }}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ padding: '14px 16px' }}>
                        <button onClick={adminSignOut} style={{
                            width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '10px 14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '12px', fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.3)'; (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#666'; }}>
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', overflowX: 'hidden' }}>
                    <main id="admin-main" style={{ flex: 1, padding: 'clamp(16px, 4vw, 24px) clamp(8px, 2vw, 20px)', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
                        {children}
                    </main>

                    {/* Mobile bottom nav */}
                    <nav id="admin-mobile-nav" style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
                        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        justifyContent: 'space-around', alignItems: 'center',
                        minHeight: '64px', padding: '8px 4px',
                    }}>
                        {navItems.slice(0, 4).map(item => {
                            const active = isActive(item);
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                    padding: '6px', textDecoration: 'none', flex: 1,
                                    opacity: active ? 1 : 0.7,
                                }}>
                                    <item.Icon size={20} strokeWidth={active ? 2.5 : 2} color={active ? '#FF2D78' : '#aaa'} />
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: active ? '#FF2D78' : '#aaa', fontWeight: active ? 600 : 500 }}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Menu Button */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '6px', flex: 1, cursor: 'pointer', opacity: showMoreMenu ? 1 : 0.7 }} onClick={() => setShowMoreMenu(true)}>
                            <MoreHorizontal size={20} strokeWidth={showMoreMenu ? 2.5 : 2} color={showMoreMenu ? '#FF2D78' : '#aaa'} />
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: showMoreMenu ? '#FF2D78' : '#aaa', fontWeight: showMoreMenu ? 600 : 500 }}>
                                Menu
                            </span>
                        </div>
                    </nav>

                    {/* Mobile Full Screen Menu Overlay */}
                    {showMoreMenu && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 100,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                        }}>
                            <div style={{
                                background: '#111', borderTop: '1px solid rgba(255,255,255,0.1)',
                                borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                                padding: '24px 20px calc(24px + env(safe-area-inset-bottom))',
                                animation: 'slideUpAdmin 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Image
                                            src="/logo.svg"
                                            alt="Glitz & Glamour Studio"
                                            width={110}
                                            height={28}
                                            priority
                                            style={{ objectFit: 'contain', width: 'auto', height: '26px' }}
                                        />
                                    </div>
                                    <button onClick={() => setShowMoreMenu(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <X size={16} color="#aaa" />
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {navItems.slice(4).map(item => {
                                        const active = isActive(item);
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setShowMoreMenu(false)} style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '14px 16px', borderRadius: '12px', textDecoration: 'none',
                                                background: active ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${active ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                            }}>
                                                <item.Icon size={18} strokeWidth={active ? 2.5 : 2} color={active ? '#FF2D78' : '#bbb'} />
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: active ? 600 : 500, color: active ? '#FF2D78' : '#eee' }}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                    <button onClick={adminSignOut} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                                        background: 'rgba(255,255,255,0.03)', cursor: 'pointer', marginTop: '8px', color: '#ccc'
                                    }}>
                                        <LogOut size={18} />
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 500 }}>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
