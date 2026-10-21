'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Calendar, Clock, Sparkles, ChevronRight, CreditCard,
    CheckCircle2, AlertCircle, XCircle, Plus, FileText,
    ShieldCheck, User, Award
} from 'lucide-react';
import UnverifiedBanner from '@/components/UnverifiedBanner';

type Booking = {
    id: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
    notes?: string | null;
    createdAt: string;
    isPromoBooking?: boolean;
    promoPrice?: number | null;
    service: { name: string; priceLabel: string; category?: string };
};

type FilterTab = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: {
        label: 'Pending Confirmation',
        color: '#FFB700',
        bg: 'rgba(255, 183, 0, 0.14)',
        border: 'rgba(255, 183, 0, 0.38)',
    },
    CONFIRMED: {
        label: 'Confirmed',
        color: '#00D478',
        bg: 'rgba(0, 212, 120, 0.14)',
        border: 'rgba(0, 212, 120, 0.38)',
    },
    COMPLETED: {
        label: 'Completed',
        color: '#ff8ab8',
        bg: 'rgba(255, 45, 120, 0.16)',
        border: 'rgba(255, 138, 184, 0.38)',
    },
    CANCELLED: {
        label: 'Cancelled',
        color: '#dfd2d9',
        bg: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.2)',
    },
};

const MY_BOOKINGS_STYLES = `
    .bookings-shell {
        width: min(1020px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 28px 0 120px;
    }
    .bookings-hero-surface {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        background:
            radial-gradient(circle at 16% 0%, rgba(255, 45, 120, 0.17), transparent 52%),
            radial-gradient(circle at 86% 12%, rgba(226, 194, 134, 0.12), transparent 48%),
            linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
    }
    .bookings-hero-surface::before {
        content: '';
        position: absolute;
        top: 0;
        left: 8%;
        right: 8%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.6), transparent);
        pointer-events: none;
    }
    .bookings-card {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }
    .bookings-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 10%;
        right: 10%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.45), rgba(226, 194, 134, 0.35), transparent);
        pointer-events: none;
    }
    .bookings-card:hover {
        border-color: rgba(255, 138, 184, 0.34);
    }
    .bookings-feature-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
    .bookings-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
    }
    .bookings-filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 18px;
    }
    .bookings-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        border-radius: 999px;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    @media (max-width: 820px) {
        .bookings-feature-grid {
            grid-template-columns: minmax(0, 1fr);
        }
        .bookings-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
    @media (max-width: 560px) {
        .bookings-shell {
            width: calc(100% - 1.5rem);
            padding: 20px 0 110px;
        }
    }
`;

export default function MyBookingsPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>('ALL');

    useEffect(() => {
        if (!session) return;
        fetch('/api/bookings')
            .then(r => r.json())
            .then(d => {
                setBookings(d.bookings || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [session]);

    const upcoming = useMemo(
        () => bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED'),
        [bookings]
    );
    const completed = useMemo(
        () => bookings.filter(b => b.status === 'COMPLETED'),
        [bookings]
    );
    const cancelled = useMemo(
        () => bookings.filter(b => b.status === 'CANCELLED'),
        [bookings]
    );

    const filteredBookings = useMemo(() => {
        if (filter === 'UPCOMING') return upcoming;
        if (filter === 'COMPLETED') return completed;
        if (filter === 'CANCELLED') return cancelled;
        return bookings;
    }, [bookings, upcoming, completed, cancelled, filter]);

    // Immediate SSR-visible 2.0 Dark Glam Editorial Guest / Sign-In Concierge Preview when !session
    if (!session) {
        return (
            <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
                <style>{MY_BOOKINGS_STYLES}</style>
                <div className="bookings-shell">
                    <section className="bookings-hero-surface" style={{ padding: 'clamp(28px, 4.5vw, 48px)', marginBottom: '24px', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.14)',
                            border: '1px solid rgba(255, 138, 184, 0.35)',
                            marginBottom: '16px',
                        }}>
                            <Calendar size={13} color="#ff8ab8" aria-hidden="true" />
                            <span style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#ff8ab8',
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '2.2px',
                            }}>
                                Glitz &amp; Glamour Studio · Appointment Concierge
                            </span>
                        </div>

                        <div style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.22), rgba(226, 194, 134, 0.14))',
                            border: '1.5px solid rgba(255, 138, 184, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(255, 45, 120, 0.22)',
                        }}>
                            <Calendar size={30} color="#ff8ab8" strokeWidth={1.8} aria-hidden="true" />
                        </div>

                        <h1 style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#fff',
                            fontSize: 'clamp(26px, 4vw, 38px)',
                            fontWeight: 800,
                            letterSpacing: '-0.6px',
                            lineHeight: 1.15,
                            marginBottom: '12px',
                        }}>
                            My Appointments &amp; Bookings
                        </h1>

                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: 'clamp(14px, 1.8vw, 16px)',
                            maxWidth: '640px',
                            margin: '0 auto 28px',
                            lineHeight: 1.65,
                        }}>
                            Sign in to view your upcoming nail, hair, waxing, and facial reservations, check real-time studio confirmation status, and review your complete service history.
                        </p>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Link
                                href="/sign-in?callbackUrl=/my-bookings"
                                className="btn-primary"
                                style={{ padding: '14px 28px', fontSize: '15px' }}
                            >
                                Sign In to Your Studio Account
                                <ChevronRight size={16} aria-hidden="true" />
                            </Link>
                            <Link
                                href="/book"
                                className="btn-outline"
                                style={{
                                    padding: '13px 26px',
                                    fontSize: '15px',
                                    color: '#ff8ab8',
                                    borderColor: 'rgba(255, 138, 184, 0.5)',
                                    background: 'rgba(255, 45, 120, 0.06)',
                                }}
                            >
                                Book an Appointment
                            </Link>
                        </div>
                    </section>

                    {/* Editorial Preview of Booking Management Features */}
                    <section aria-label="Booking Management Features" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', margin: 0 }}>
                                Seamless Studio Reservation Tracking
                            </h2>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#E2C286', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Vista &amp; San Marcos
                            </span>
                        </div>

                        <div className="bookings-feature-grid">
                            <div className="bookings-card" style={{ padding: '24px 20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(0, 212, 120, 0.14)',
                                    border: '1px solid rgba(0, 212, 120, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <CheckCircle2 size={20} color="#00D478" aria-hidden="true" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                    Live Confirmation Status
                                </h3>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                    Track your requested date and time from initial studio review to confirmed reservation with instant SMS and email updates.
                                </p>
                            </div>

                            <div className="bookings-card" style={{ padding: '24px 20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(255, 45, 120, 0.16)',
                                    border: '1px solid rgba(255, 138, 184, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Sparkles size={20} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                    Complete Service Archive
                                </h3>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                    Keep a permanent log of your acrylic sets, Gel-X extensions, balayage sessions, and custom facials for effortless rebooking.
                                </p>
                            </div>

                            <div className="bookings-card" style={{ padding: '24px 20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(226, 194, 134, 0.14)',
                                    border: '1px solid rgba(226, 194, 134, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Award size={20} color="#E2C286" aria-hidden="true" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                    Automatic Stamp Credits
                                </h3>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>
                                    Every completed booking automatically adds a digital stamp to your Glamutta Loyalty Card toward a complimentary full nail set.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Guest Booking Lookup Note & Quick Links */}
                    <section className="bookings-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ShieldCheck size={20} color="#E2C286" aria-hidden="true" />
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', margin: 0 }}>
                                    Booked as a Guest?
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px', margin: 0 }}>
                                    Create a studio account using the same email address and your guest bookings will link automatically.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Link href="/sign-in?tab=signup&callbackUrl=/my-bookings" style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                color: '#ff8ab8', textDecoration: 'none', padding: '8px 16px',
                                borderRadius: '999px', border: '1px solid rgba(255, 138, 184, 0.35)',
                                background: 'rgba(255, 45, 120, 0.1)',
                            }}>
                                Link Guest Bookings
                            </Link>
                            <Link href="/policy" style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                color: '#f4eef1', textDecoration: 'none', padding: '8px 16px',
                                borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.16)',
                                background: 'rgba(255, 255, 255, 0.05)',
                            }}>
                                Studio Policies
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    const isUnverified = session && !(session.user as { emailVerified?: string | null })?.emailVerified;

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <style>{MY_BOOKINGS_STYLES}</style>
            <div className="bookings-shell" style={{ maxWidth: '820px' }}>
                {isUnverified && <UnverifiedBanner />}

                {/* Authenticated Header */}
                <section className="bookings-hero-surface" style={{ padding: 'clamp(24px, 3.5vw, 36px)', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '4px 12px', borderRadius: '999px',
                                background: 'rgba(255, 45, 120, 0.14)',
                                border: '1px solid rgba(255, 138, 184, 0.35)',
                                marginBottom: '10px',
                            }}>
                                <Sparkles size={12} color="#ff8ab8" aria-hidden="true" />
                                <span style={{
                                    fontFamily: 'Poppins, sans-serif', fontSize: '10.5px', fontWeight: 700,
                                    color: '#ff8ab8', textTransform: 'uppercase', letterSpacing: '1.8px',
                                }}>
                                    Reservation Dashboard
                                </span>
                            </div>
                            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(22px, 3.2vw, 30px)', color: '#fff', margin: '0 0 4px' }}>
                                My Appointments &amp; Bookings
                            </h1>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', margin: 0 }}>
                                Manage your upcoming studio appointments and review your service history.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Link href="/book" className="btn-primary" style={{ padding: '12px 22px', fontSize: '14px' }}>
                                <Plus size={16} aria-hidden="true" /> Book Appointment
                            </Link>
                            <Link href="/profile" className="btn-outline" style={{ padding: '11px 18px', fontSize: '13.5px', color: '#ff8ab8', borderColor: 'rgba(255, 138, 184, 0.45)' }}>
                                <User size={15} aria-hidden="true" /> Profile
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats Summary */}
                <div className="bookings-stats-grid" style={{ marginBottom: '20px' }}>
                    {[
                        { label: 'Total Bookings', value: bookings.length, Icon: Calendar, color: '#ff8ab8' },
                        { label: 'Upcoming', value: upcoming.length, Icon: Clock, color: '#FFB700' },
                        { label: 'Completed', value: completed.length, Icon: CheckCircle2, color: '#00D478' },
                        { label: 'Cancelled', value: cancelled.length, Icon: XCircle, color: '#dfd2d9' },
                    ].map(stat => (
                        <div key={stat.label} className="bookings-card" style={{ padding: '16px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                                <stat.Icon size={18} color={stat.color} aria-hidden="true" />
                            </div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', lineHeight: 1.1 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11.5px', color: '#dfd2d9', marginTop: '3px' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="bookings-filter-row" role="tablist" aria-label="Filter appointments by status">
                    {([
                        { key: 'ALL', label: 'All Reservations', count: bookings.length },
                        { key: 'UPCOMING', label: 'Upcoming', count: upcoming.length },
                        { key: 'COMPLETED', label: 'Completed', count: completed.length },
                        { key: 'CANCELLED', label: 'Cancelled', count: cancelled.length },
                    ] as const).map(tab => {
                        const active = filter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setFilter(tab.key)}
                                className="bookings-filter-btn"
                                style={{
                                    background: active ? 'rgba(255, 45, 120, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                    border: active ? '1px solid rgba(255, 138, 184, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                                    color: active ? '#ff8ab8' : '#e2d6dc',
                                }}
                            >
                                <span>{tab.label}</span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    background: active ? 'rgba(255, 45, 120, 0.28)' : 'rgba(255, 255, 255, 0.08)',
                                    color: active ? '#fff' : '#dfd2d9',
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: '116px', borderRadius: '22px' }} />
                        ))}
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredBookings.map(booking => {
                            const statusInfo = STATUS_META[booking.status] || {
                                label: booking.status,
                                color: '#dfd2d9',
                                bg: 'rgba(255, 255, 255, 0.08)',
                                border: 'rgba(255, 255, 255, 0.2)',
                            };
                            return (
                                <article
                                    key={booking.id}
                                    className="bookings-card"
                                    style={{ padding: '20px 22px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#fff', margin: 0 }}>
                                                    {booking.service?.name || 'Studio Appointment'}
                                                </h2>
                                                {booking.service?.priceLabel && (
                                                    <span style={{
                                                        fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', fontWeight: 700,
                                                        color: '#E2C286', background: 'rgba(226, 194, 134, 0.12)',
                                                        border: '1px solid rgba(226, 194, 134, 0.28)',
                                                        borderRadius: '999px', padding: '2px 10px',
                                                    }}>
                                                        {booking.service.priceLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#e2d6dc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={13} color="#ff8ab8" aria-hidden="true" />
                                                    {booking.preferredDate}
                                                </span>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#e2d6dc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={13} color="#E2C286" aria-hidden="true" />
                                                    {booking.preferredTime}
                                                </span>
                                            </div>
                                        </div>

                                        <span style={{
                                            background: statusInfo.bg,
                                            border: `1px solid ${statusInfo.border}`,
                                            color: statusInfo.color,
                                            borderRadius: '999px',
                                            padding: '5px 14px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '11.5px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {booking.notes && (
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '10px 14px',
                                            marginBottom: '12px',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px',
                                        }}>
                                            <FileText size={14} color="#dfd2d9" style={{ marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#dfd2d9', margin: 0, lineHeight: 1.5 }}>
                                                {booking.notes}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{
                                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                        paddingTop: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '10px',
                                    }}>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#c8b8c2' }}>
                                            Requested {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <Link href="/card" style={{
                                                fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', fontWeight: 600,
                                                color: '#E2C286', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            }}>
                                                <CreditCard size={13} aria-hidden="true" /> Loyalty Card
                                            </Link>
                                            <Link href="/book" style={{
                                                fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', fontWeight: 600,
                                                color: '#ff8ab8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            }}>
                                                Book Again <ChevronRight size={13} aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bookings-hero-surface" style={{ padding: '40px 24px', textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            margin: '0 auto 14px',
                            background: 'rgba(255, 45, 120, 0.16)',
                            border: '1px solid rgba(255, 138, 184, 0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AlertCircle size={26} color="#ff8ab8" aria-hidden="true" />
                        </div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '6px' }}>
                            {filter === 'ALL' ? 'No Appointments Yet' : `No ${filter.toLowerCase()} appointments`}
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', maxWidth: '440px', margin: '0 auto 22px', lineHeight: 1.6 }}>
                            Ready to schedule your next nail set, pedicure, hair color, waxing, or facial session? Book online in under a minute.
                        </p>
                        <Link href="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                            Book an Appointment <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
