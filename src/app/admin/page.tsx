'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    Clock, CheckCircle, TrendingUp, AlertCircle, ChevronRight, Calendar,
    RefreshCw, Phone, Mail, MessageSquare, Sparkles, Check, X,
    CalendarCheck, User, ShieldCheck, ArrowRight, Eye, ExternalLink,
    ChevronDown, Edit2, CheckCircle2, ChevronUp
} from 'lucide-react';
import AnalyticsSection from '@/components/admin/AnalyticsSection';
import BookingDetailModal from '@/components/admin/BookingDetailModal';
import AdminModal, { AdminModalHeader, AdminModalBody } from './AdminModal';
import { format12h } from '@/lib/formatTime';

type Booking = {
    id: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
    createdAt: string;
    notes?: string;
    isPromoBooking?: boolean;
    promoPrice?: number | null;
    additionalServiceIds?: string | null;
    inspoImageUrls?: string[];
    user?: {
        name: string;
        email: string;
        phone?: string;
        image?: string | null;
    };
    service: {
        name: string;
        priceLabel?: string;
        category?: string;
    };
    healthIntake?: {
        skinTypes?: string[];
        medications?: string;
        allergies?: string[];
        allergyNotes?: string;
        emergencyName?: string;
        emergencyPhone?: string;
    } | null;
};

const statusColor: Record<string, string> = {
    PENDING: '#FFB700',
    CONTACTED: '#FF8C42',
    IN_TALKS: '#38BDF8',
    CONFIRMED: '#00D478',
    COMPLETED: '#FF2D78',
    CANCELLED: '#666',
};

const STATUS_OPTIONS = ['PENDING', 'CONTACTED', 'IN_TALKS', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
const statusLabel = (s: string) => (s === 'IN_TALKS' ? 'In Talks' : s.charAt(0) + s.slice(1).toLowerCase());


function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

/* ──────────────────────────────────────────────────────────────────────────
   Move to… Stage Dropdown (matches bookings page flow)
   ────────────────────────────────────────────────────────────────────────── */
function DashboardStatusDropdown({
    currentStatus,
    disabled,
    onSelect,
}: {
    currentStatus: string;
    disabled?: boolean;
    onSelect: (status: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        if (disabled) return;
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // 5 options * ~36px = 180px + padding = ~195px
            setDropUp(spaceBelow < 220);
        }
        setOpen((o) => !o);
    };

    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const color = statusColor[currentStatus] || '#888';
    const options = STATUS_OPTIONS.filter((s) => s !== currentStatus);

    return (
        <div ref={ref} style={{ position: 'relative', zIndex: open ? 100 : 'auto' }}>
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    color,
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                <span>Move to…</span>
                <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onMouseDown={() => setOpen(false)} />
                    <div
                        style={{
                            position: 'absolute',
                            ...(dropUp ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
                            right: 0,
                            zIndex: 9999,
                            background: '#1a1a24',
                            border: '1px solid rgba(255, 255, 255, 0.14)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            minWidth: '150px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                            animation: 'adminModalScaleIn 0.15s ease',
                        }}
                    >
                        {options.map((s) => {
                            const c = statusColor[s] || '#888';
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        onSelect(s);
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '9px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        color: '#eee',
                                        textAlign: 'left',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 45, 120, 0.1)')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }} />
                                    {statusLabel(s)}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Inline Confirm Panel (verify date & time before finalizing, as in old flow)
   ────────────────────────────────────────────────────────────────────────── */
function DashboardConfirmPanel({
    booking,
    onDone,
    onCancel,
}: {
    booking: Booking;
    onDone: (newDate: string, newTime: string) => Promise<void>;
    onCancel: () => void;
}) {
    const [date, setDate] = useState(booking.preferredDate);
    const [time, setTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    async function handleConfirm() {
        setSaving(true);
        await onDone(date, time);
        setSaving(false);
    }

    return (
        <div
            style={{
                marginTop: '10px',
                paddingTop: '12px',
                borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px',
                borderRadius: '12px',
            }}
        >
            {booking.isPromoBooking && booking.promoPrice && (
                <div
                    style={{
                        background: 'rgba(255, 45, 120, 0.1)',
                        border: '1px solid rgba(255, 45, 120, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span style={{ fontSize: '16px' }}>🌸</span>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF6BA8', fontSize: '11px', margin: 0 }}>
                        <strong>April Promo:</strong> Fixed ${booking.promoPrice} for this client.
                    </p>
                </div>
            )}

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#aaa', margin: '0 0 8px' }}>
                Verify date &amp; time before sending the confirmation notice:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                    <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#888', display: 'block', marginBottom: '3px' }}>
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            padding: '6px 8px',
                        }}
                    />
                </div>
                <div>
                    <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#888', display: 'block', marginBottom: '3px' }}>
                        Time
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            padding: '6px 8px',
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                    onClick={onCancel}
                    disabled={saving}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#bbb',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        cursor: 'pointer',
                    }}
                >
                    Back
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={saving}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #00D478 0%, #00A859 100%)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    {saving ? 'Confirming…' : 'Confirm Appointment ✅'}
                </button>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN ADMIN DASHBOARD
   ────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
    const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [now, setNow] = useState<Date>(new Date());

    // Expand/collapse controls (limit to 2 by default)
    const [expandedPending, setExpandedPending] = useState(false);
    const [expandedToday, setExpandedToday] = useState(false);

    const fetchBookings = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setRefreshing(true);
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            setBookings(data.bookings || []);
        } catch (e) {
            console.error('Failed to fetch bookings', e);
        } finally {
            setLoading(false);
            if (showRefreshIndicator) {
                setTimeout(() => setRefreshing(false), 500);
            }
        }
    };

    useEffect(() => {
        fetchBookings();
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Status update handler (wired into the real stages flow)
    const updateBookingStatus = async (bookingId: string, status: string, newDate?: string, newTime?: string) => {
        setUpdatingId(bookingId);
        try {
            const payload: Record<string, string> = { bookingId, status };
            if (newDate) payload.newDate = newDate;
            if (newTime) payload.newTime = newTime;

            const res = await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setBookings((prev) =>
                    prev.map((b) =>
                        b.id === bookingId
                            ? {
                                  ...b,
                                  status,
                                  ...(newDate ? { preferredDate: newDate } : {}),
                                  ...(newTime ? { preferredTime: newTime } : {}),
                              }
                            : b
                    )
                );
                if (inspectBooking?.id === bookingId) {
                    setInspectBooking((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  status,
                                  ...(newDate ? { preferredDate: newDate } : {}),
                                  ...(newTime ? { preferredTime: newTime } : {}),
                              }
                            : null
                    );
                }

                const stageMsg =
                    status === 'CONFIRMED'
                        ? 'Booking confirmed & client notified via SMS/email! ✨'
                        : status === 'COMPLETED'
                        ? 'Appointment completed & review request sent! 💅'
                        : status === 'CONTACTED'
                        ? 'Status updated to Contacted 📞'
                        : status === 'IN_TALKS'
                        ? 'Status updated to In Talks 💬'
                        : `Status updated to ${statusLabel(status)}`;

                setToast(stageMsg);
                setTimeout(() => setToast(null), 3500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
            setConfirmingId(null);
            setCompletingBooking(null);
        }
    };

    const todayStr = useMemo(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const todaysBookings = useMemo(() => {
        return bookings.filter((b) => b.preferredDate === todayStr);
    }, [bookings, todayStr]);

    // Active requests needing attention: PENDING, CONTACTED, or IN_TALKS
    const needsAttention = useMemo(() => {
        return bookings.filter(
            (b) => b.status === 'PENDING' || b.status === 'CONTACTED' || b.status === 'IN_TALKS'
        );
    }, [bookings]);

    const pendingOnly = useMemo(() => {
        return bookings.filter((b) => b.status === 'PENDING');
    }, [bookings]);

    const confirmed = useMemo(() => {
        return bookings.filter((b) => b.status === 'CONFIRMED');
    }, [bookings]);

    const completed = useMemo(() => {
        return bookings.filter((b) => b.status === 'COMPLETED');
    }, [bookings]);

    // Limit to 2 items unless expanded
    const displayedAttention = expandedPending ? needsAttention : needsAttention.slice(0, 2);
    const displayedToday = expandedToday ? todaysBookings : todaysBookings.slice(0, 2);

    return (
        <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <style>{`
                @keyframes pulseBadge {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 45, 120, 0.5); }
                    70% { transform: scale(1.03); box-shadow: 0 0 0 8px rgba(255, 45, 120, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 45, 120, 0); }
                }
                @keyframes spinFast {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .liquid-card-hover {
                    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease;
                }
                .liquid-card-hover:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 32px -4px rgba(255, 45, 120, 0.22), 0 4px 12px rgba(0,0,0,0.5);
                    border-color: rgba(255, 45, 120, 0.4) !important;
                }
            `}</style>

            {/* ── Toast Notification ── */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        top: '24px',
                        right: '24px',
                        zIndex: 9999,
                        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.95), rgba(204, 30, 90, 0.95))',
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(255, 45, 120, 0.4), 0 2px 10px rgba(0,0,0,0.3)',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <Check size={16} strokeWidth={2.5} />
                    <span>{toast}</span>
                </div>
            )}

            {/* ── Executive Command Header ── */}
            <div
                style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(28, 28, 38, 0.65) 0%, rgba(16, 16, 24, 0.75) 100%)',
                    backdropFilter: 'blur(28px) saturate(190%)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: '1px solid rgba(255, 45, 120, 0.2)',
                    borderRadius: '24px',
                    padding: '24px 28px',
                    marginBottom: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '10%',
                        width: '240px',
                        height: '140px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,45,120,0.18) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Left: Greeting & Studio Info */}
                <div style={{ position: 'relative', zIndex: 2, minWidth: '240px' }}>
                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 800,
                            color: '#fff',
                            fontSize: 'clamp(22px, 3.2vw, 28px)',
                            letterSpacing: '-0.3px',
                            margin: '0 0 4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {getGreeting()}, Jojo <span style={{ fontSize: '22px' }}>✨</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', margin: 0, fontWeight: 400 }}>
                        Welcome to Glitz & Glamour Studio — here's your overview and appointments for today.
                    </p>
                </div>

                {/* Right: Date, Clock & Instant Refresh */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                    <div
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                        }}
                    >
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF6BA8', fontWeight: 500 }}>
                            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                    </div>

                    <button
                        onClick={() => fetchBookings(true)}
                        disabled={refreshing}
                        className="liquid-card-hover"
                        style={{
                            padding: '10px 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.16) 0%, rgba(255, 45, 120, 0.04) 100%)',
                            border: '1px solid rgba(255, 45, 120, 0.35)',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 16px rgba(255, 45, 120, 0.15)',
                        }}
                    >
                        <RefreshCw
                            size={14}
                            color="#FF2D78"
                            style={{
                                animation: refreshing ? 'spinFast 0.6s linear infinite' : 'none',
                            }}
                        />
                        <span>{refreshing ? 'Syncing…' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* ── Hero KPI Liquid Deck (4 Living Cards) ── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                    marginBottom: '28px',
                }}
            >
                {/* 1. Today's Appointments */}
                <div
                    className="liquid-card-hover"
                    style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(24, 24, 34, 0.6) 0%, rgba(14, 14, 22, 0.7) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(79, 195, 247, 0.25)',
                        borderRadius: '22px',
                        padding: '20px',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.2) 0%, rgba(79, 195, 247, 0.06) 100%)',
                                border: '1px solid rgba(79, 195, 247, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(79, 195, 247, 0.15)',
                            }}
                        >
                            <Calendar size={18} color="#4FC3F7" strokeWidth={2.2} />
                        </div>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                color: '#4FC3F7',
                                background: 'rgba(79, 195, 247, 0.12)',
                                border: '1px solid rgba(79, 195, 247, 0.25)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                            }}
                        >
                            Today
                        </span>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '28px', color: '#fff', lineHeight: 1, margin: 0 }}>
                            {todaysBookings.length}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '6px 0 2px' }}>
                            Appointments Today
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', margin: 0 }}>
                            {todaysBookings.filter((b) => b.status === 'CONFIRMED').length} confirmed on calendar
                        </p>
                    </div>
                </div>

                {/* 2. Needs Action (Active Triage) */}
                <div
                    className="liquid-card-hover"
                    style={{
                        position: 'relative',
                        background: needsAttention.length > 0
                            ? 'linear-gradient(135deg, rgba(45, 18, 28, 0.75) 0%, rgba(20, 12, 18, 0.8) 100%)'
                            : 'linear-gradient(135deg, rgba(24, 24, 34, 0.6) 0%, rgba(14, 14, 22, 0.7) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: `1px solid ${needsAttention.length > 0 ? '#FF2D78' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '22px',
                        padding: '20px',
                        overflow: 'hidden',
                        animation: needsAttention.length > 0 ? 'pulseBadge 3s infinite' : 'none',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: needsAttention.length > 0
                                    ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.3) 0%, rgba(255, 45, 120, 0.1) 100%)'
                                    : 'rgba(255, 255, 255, 0.04)',
                                border: `1px solid ${needsAttention.length > 0 ? '#FF2D78' : 'rgba(255, 255, 255, 0.08)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: needsAttention.length > 0 ? '0 4px 14px rgba(255, 45, 120, 0.25)' : 'none',
                            }}
                        >
                            <AlertCircle size={18} color={needsAttention.length > 0 ? '#FF2D78' : '#777'} strokeWidth={2.2} />
                        </div>
                        {needsAttention.length > 0 && (
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#FF2D78',
                                    background: 'rgba(255, 45, 120, 0.15)',
                                    border: '1px solid rgba(255, 45, 120, 0.35)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF2D78', display: 'inline-block' }} />
                                Needs Attention
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '28px', color: needsAttention.length > 0 ? '#FF2D78' : '#fff', lineHeight: 1, margin: 0 }}>
                            {needsAttention.length}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '6px 0 2px' }}>
                            Unconfirmed Requests
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', margin: 0 }}>
                            {pendingOnly.length} pending · {needsAttention.length - pendingOnly.length} in progress
                        </p>
                    </div>
                </div>

                {/* 3. Confirmed Bookings */}
                <div
                    className="liquid-card-hover"
                    style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(24, 24, 34, 0.6) 0%, rgba(14, 14, 22, 0.7) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(0, 212, 120, 0.25)',
                        borderRadius: '22px',
                        padding: '20px',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(0, 212, 120, 0.2) 0%, rgba(0, 212, 120, 0.06) 100%)',
                                border: '1px solid rgba(0, 212, 120, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0, 212, 120, 0.15)',
                            }}
                        >
                            <CheckCircle size={18} color="#00D478" strokeWidth={2.2} />
                        </div>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                color: '#00D478',
                                background: 'rgba(0, 212, 120, 0.12)',
                                border: '1px solid rgba(0, 212, 120, 0.25)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                            }}
                        >
                            Confirmed
                        </span>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '28px', color: '#fff', lineHeight: 1, margin: 0 }}>
                            {confirmed.length}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '6px 0 2px' }}>
                            Confirmed Bookings
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', margin: 0 }}>
                            Locked in on studio calendar
                        </p>
                    </div>
                </div>

                {/* 4. Completed Appointments */}
                <div
                    className="liquid-card-hover"
                    style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(24, 24, 34, 0.6) 0%, rgba(14, 14, 22, 0.7) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(183, 110, 121, 0.25)',
                        borderRadius: '22px',
                        padding: '20px',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(183, 110, 121, 0.2) 0%, rgba(183, 110, 121, 0.06) 100%)',
                                border: '1px solid rgba(183, 110, 121, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(183, 110, 121, 0.15)',
                            }}
                        >
                            <TrendingUp size={18} color="#B76E79" strokeWidth={2.2} />
                        </div>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                color: '#B76E79',
                                background: 'rgba(183, 110, 121, 0.12)',
                                border: '1px solid rgba(183, 110, 121, 0.25)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                            }}
                        >
                            Completed
                        </span>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '28px', color: '#fff', lineHeight: 1, margin: 0 }}>
                            {completed.length}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '6px 0 2px' }}>
                            Fulfilled Services
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', margin: 0 }}>
                            Total services delivered
                        </p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
               LIVE OPERATIONAL DISPATCH DECK (Bento 2 Columns)
               ══════════════════════════════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px', position: 'relative', zIndex: 30 }}>
                {/* ── Left Column: Needs Attention (Limited to 2 with expand button) ── */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.65) 0%, rgba(14, 14, 20, 0.75) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: needsAttention.length > 0 ? '1px solid rgba(255, 45, 120, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '24px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        zIndex: 25,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 45, 120, 0.15)',
                                    border: '1px solid rgba(255, 45, 120, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AlertCircle size={16} color="#FF2D78" />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', margin: 0 }}>
                                    Needs Your Attention
                                </h2>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', margin: 0 }}>
                                    {needsAttention.length} active client request{needsAttention.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/bookings"
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                color: '#FF6BA8',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600,
                            }}
                        >
                            All Bookings <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Pending / In-progress List */}
                    {needsAttention.length === 0 ? (
                        <div
                            style={{
                                flex: 1,
                                minHeight: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px dashed rgba(255, 255, 255, 0.08)',
                                borderRadius: '18px',
                                textAlign: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 212, 120, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '10px',
                                }}
                            >
                                <Check size={20} color="#00D478" strokeWidth={2.5} />
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#eee', fontSize: '13px', margin: '0 0 4px' }}>
                                All caught up, Jojo!
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '11px', margin: 0 }}>
                                No pending bookings require review right now.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {displayedAttention.map((b) => {
                                const clientName = b.user?.name || b.guestName || 'Guest Client';
                                const phone = b.user?.phone || b.guestPhone;
                                const isUpdating = updatingId === b.id;
                                const isConfirmingThis = confirmingId === b.id;
                                const color = statusColor[b.status] || '#FF2D78';

                                return (
                                    <div
                                        key={b.id}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(32, 24, 32, 0.6) 0%, rgba(20, 18, 24, 0.7) 100%)',
                                            border: `1px solid ${b.status === 'PENDING' ? 'rgba(255, 45, 120, 0.28)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            borderRadius: '16px',
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                {/* Client Initials Avatar */}
                                                <div
                                                    style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #FF2D78 0%, #B76E79 100%)',
                                                        color: '#fff',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        fontWeight: 700,
                                                        fontSize: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {clientName.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <p
                                                            style={{
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontWeight: 600,
                                                                color: '#fff',
                                                                fontSize: '13px',
                                                                margin: 0,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {clientName}
                                                        </p>
                                                        {/* Stage badge */}
                                                        <span
                                                            style={{
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                padding: '2px 7px',
                                                                borderRadius: '8px',
                                                                background: `${color}18`,
                                                                border: `1px solid ${color}35`,
                                                                color: color,
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            {statusLabel(b.status)}
                                                        </span>
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: '#FF6BA8',
                                                            fontSize: '12px',
                                                            margin: '2px 0 0',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {b.service?.name} {b.service?.priceLabel ? `· ${b.service.priceLabel}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date / Time Chip */}
                                            <div
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    borderRadius: '10px',
                                                    padding: '4px 10px',
                                                    textAlign: 'right',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                                    {format12h(b.preferredTime)}
                                                </p>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#888', margin: 0 }}>
                                                    {b.preferredDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notes preview if present */}
                                        {b.notes && (
                                            <p
                                                style={{
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '11px',
                                                    color: '#aaa',
                                                    background: 'rgba(0, 0, 0, 0.25)',
                                                    padding: '6px 10px',
                                                    borderRadius: '8px',
                                                    margin: 0,
                                                    fontStyle: 'italic',
                                                }}
                                            >
                                                &ldquo;{b.notes}&rdquo;
                                            </p>
                                        )}

                                        {/* Stage Action Bar (Wired into the real multi-stage booking flow) */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px',
                                                marginTop: '2px',
                                                paddingTop: '10px',
                                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                            }}
                                        >
                                            {/* Contact & Inspect shortcuts */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {phone && (
                                                    <a
                                                        href={`tel:${phone}`}
                                                        title={`Call ${phone}`}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255, 255, 255, 0.04)',
                                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#aaa',
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        <Phone size={13} />
                                                    </a>
                                                )}
                                                {phone && (
                                                    <a
                                                        href={`sms:${phone}`}
                                                        title={`Text ${phone}`}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255, 255, 255, 0.04)',
                                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#aaa',
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        <MessageSquare size={13} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setInspectBooking(b)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255, 255, 255, 0.04)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                        color: '#aaa',
                                                        fontSize: '11px',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    }}
                                                >
                                                    <Eye size={12} /> Inspect
                                                </button>
                                            </div>

                                            {/* Stage Transitions & Confirm Triggers */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {/* Move to… Dropdown */}
                                                <DashboardStatusDropdown
                                                    currentStatus={b.status}
                                                    disabled={isUpdating}
                                                    onSelect={(newStatus) => {
                                                        if (newStatus === 'CONFIRMED') {
                                                            setConfirmingId(b.id);
                                                        } else {
                                                            updateBookingStatus(b.id, newStatus);
                                                        }
                                                    }}
                                                />

                                                {/* Stage-appropriate primary button */}
                                                {b.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => updateBookingStatus(b.id, 'CONTACTED')}
                                                        disabled={isUpdating}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255, 140, 66, 0.15)',
                                                            border: '1px solid rgba(255, 140, 66, 0.35)',
                                                            color: '#FF8C42',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Mark Contacted 📞
                                                    </button>
                                                )}

                                                {b.status === 'CONTACTED' && (
                                                    <button
                                                        onClick={() => updateBookingStatus(b.id, 'IN_TALKS')}
                                                        disabled={isUpdating}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(56, 189, 248, 0.15)',
                                                            border: '1px solid rgba(56, 189, 248, 0.35)',
                                                            color: '#38BDF8',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        In Talks 💬
                                                    </button>
                                                )}

                                                {/* Confirm Button (Reveals Confirm Panel to adjust/verify Date & Time) */}
                                                <button
                                                    onClick={() => setConfirmingId(isConfirmingThis ? null : b.id)}
                                                    disabled={isUpdating}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, #00D478 0%, #00A859 100%)',
                                                        border: 'none',
                                                        color: '#fff',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        boxShadow: '0 2px 10px rgba(0, 212, 120, 0.25)',
                                                    }}
                                                >
                                                    <Check size={12} strokeWidth={2.8} /> Confirm…
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline Confirm Panel */}
                                        {isConfirmingThis && (
                                            <DashboardConfirmPanel
                                                booking={b}
                                                onDone={async (newDate, newTime) => {
                                                    await updateBookingStatus(b.id, 'CONFIRMED', newDate, newTime);
                                                }}
                                                onCancel={() => setConfirmingId(null)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Expand / Collapse Button for Needs Attention (Limit to 2) */}
                    {needsAttention.length > 2 && (
                        <div style={{ marginTop: '14px', textAlign: 'center' }}>
                            <button
                                onClick={() => setExpandedPending(!expandedPending)}
                                style={{
                                    width: '100%',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#FF6BA8',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 45, 120, 0.08)';
                                }}
                                onMouseOut={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.03)';
                                }}
                            >
                                {expandedPending ? (
                                    <>
                                        Show less <ChevronUp size={14} />
                                    </>
                                ) : (
                                    <>
                                        Show {needsAttention.length - 2} more ({needsAttention.length} total) <ChevronDown size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Today's Studio Schedule (Limited to 2 with expand button) ── */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.65) 0%, rgba(14, 14, 20, 0.75) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '24px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'rgba(79, 195, 247, 0.15)',
                                    border: '1px solid rgba(79, 195, 247, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CalendarCheck size={16} color="#4FC3F7" />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff', margin: 0 }}>
                                    Today&apos;s Studio Schedule
                                </h2>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', margin: 0 }}>
                                    {todaysBookings.length} client appointment{todaysBookings.length === 1 ? '' : 's'} for today
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/calendar"
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                color: '#4FC3F7',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600,
                            }}
                        >
                            Open Calendar <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Today Items List */}
                    {todaysBookings.length === 0 ? (
                        <div
                            style={{
                                flex: 1,
                                minHeight: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px dashed rgba(255, 255, 255, 0.08)',
                                borderRadius: '18px',
                                textAlign: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: 'rgba(79, 195, 247, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '10px',
                                }}
                            >
                                <Calendar size={20} color="#4FC3F7" strokeWidth={2.2} />
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#eee', fontSize: '13px', margin: '0 0 4px' }}>
                                No appointments booked for today
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '11px', margin: 0 }}>
                                Ideal time for studio prep, social media content, or walk-ins.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {displayedToday.map((b) => {
                                const clientName = b.user?.name || b.guestName || 'Guest';
                                const isCompleted = b.status === 'COMPLETED';
                                const isConfirmed = b.status === 'CONFIRMED';
                                const isUpdating = updatingId === b.id;

                                return (
                                    <div
                                        key={b.id}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${isConfirmed ? 'rgba(0, 212, 120, 0.25)' : isCompleted ? 'rgba(255, 45, 120, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                                            borderRadius: '16px',
                                            padding: '14px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                            {/* Time Pill */}
                                            <div
                                                style={{
                                                    background: 'rgba(255, 45, 120, 0.12)',
                                                    border: '1px solid rgba(255, 45, 120, 0.25)',
                                                    color: '#FF6BA8',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontWeight: 700,
                                                    fontSize: '11px',
                                                    padding: '6px 10px',
                                                    borderRadius: '10px',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {format12h(b.preferredTime)}
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {clientName}
                                                </p>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '11px', margin: '2px 0 0' }}>
                                                    {b.service?.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Complete Action with confirmation modal */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <span
                                                style={{
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    padding: '3px 8px',
                                                    borderRadius: '8px',
                                                    letterSpacing: '0.4px',
                                                    background: isCompleted
                                                        ? 'rgba(255, 45, 120, 0.15)'
                                                        : isConfirmed
                                                        ? 'rgba(0, 212, 120, 0.15)'
                                                        : 'rgba(255, 183, 0, 0.15)',
                                                    color: isCompleted
                                                        ? '#FF2D78'
                                                        : isConfirmed
                                                        ? '#00D478'
                                                        : '#FFB700',
                                                    border: `1px solid ${isCompleted ? 'rgba(255, 45, 120, 0.3)' : isConfirmed ? 'rgba(0, 212, 120, 0.3)' : 'rgba(255, 183, 0, 0.3)'}`,
                                                }}
                                            >
                                                {statusLabel(b.status)}
                                            </span>

                                            {!isCompleted && (
                                                <button
                                                    onClick={() => setCompletingBooking(b)}
                                                    disabled={isUpdating}
                                                    title="Mark Finished (Confirms review request & stamp)"
                                                    style={{
                                                        padding: '5px 11px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255, 45, 120, 0.15)',
                                                        border: '1px solid rgba(255, 45, 120, 0.3)',
                                                        color: '#FF6BA8',
                                                        fontSize: '11px',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {isUpdating ? '…' : 'Done ✓'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Expand / Collapse Button for Today's Schedule (Limit to 2) */}
                    {todaysBookings.length > 2 && (
                        <div style={{ marginTop: '14px', textAlign: 'center' }}>
                            <button
                                onClick={() => setExpandedToday(!expandedToday)}
                                style={{
                                    width: '100%',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#4FC3F7',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.08)';
                                }}
                                onMouseOut={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.03)';
                                }}
                            >
                                {expandedToday ? (
                                    <>
                                        Show less <ChevronUp size={14} />
                                    </>
                                ) : (
                                    <>
                                        Show {todaysBookings.length - 2} more ({todaysBookings.length} total) <ChevronDown size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
               ANALYTICS & BUSINESS INTELLIGENCE SECTION
               ══════════════════════════════════════════════════════════════════════ */}
            {!loading && (
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <AnalyticsSection />
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
               MARK COMPLETE CONFIRMATION MODAL (Touch-Safe, matches old flow)
               ══════════════════════════════════════════════════════════════════════ */}
            {completingBooking && (
                <AdminModal onClose={() => setCompletingBooking(null)} maxWidth={460} zIndex={400}>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>
                                    Confirm Completion
                                </p>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                                    Mark this booking as complete?
                                </h2>
                            </div>
                            <button
                                onClick={() => setCompletingBooking(null)}
                                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#aaa' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                                {completingBooking.user?.name || completingBooking.guestName || 'Guest'}
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF2D78', fontWeight: 500, margin: '0 0 6px' }}>
                                {completingBooking.service.name} {completingBooking.service.priceLabel ? `— ${completingBooking.service.priceLabel}` : ''}
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', margin: 0 }}>
                                {completingBooking.preferredDate} at {format12h(completingBooking.preferredTime)}
                            </p>
                        </div>

                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', lineHeight: 1.5, marginBottom: '18px' }}>
                            Completing marks the appointment as done, triggers the automatic Google review invitation via SMS &amp; email, and issues a loyalty stamp to the customer.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="btn-primary"
                                onClick={() => updateBookingStatus(completingBooking.id, 'COMPLETED')}
                                style={{ fontSize: '14px', padding: '12px 18px', width: '100%', justifyContent: 'center' }}
                            >
                                Yes, Mark Complete 🎉
                            </button>
                            <button
                                onClick={() => setCompletingBooking(null)}
                                className="btn-outline"
                                style={{ fontSize: '13px', padding: '10px 16px', width: '100%', justifyContent: 'center' }}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
               DETAILED APPLE LIQUID BOOKING INSPECTION MODAL (Deep Triage)
               ══════════════════════════════════════════════════════════════════════ */}
            {inspectBooking && (
                <BookingDetailModal
                    booking={inspectBooking as any}
                    onClose={() => setInspectBooking(null)}
                    onBookingUpdated={(b) => {
                        setInspectBooking(b as Booking);
                        setBookings((prev) => prev.map((x) => (x.id === b.id ? (b as Booking) : x)));
                    }}
                    onStatusChange={async (bookingId, newStatus) => {
                        await updateBookingStatus(bookingId, newStatus);
                        setInspectBooking((prev) => (prev && prev.id === bookingId ? { ...prev, status: newStatus } : prev));
                    }}
                    onConfirmAppointment={async (bookingId, date, time) => {
                        await updateBookingStatus(bookingId, 'CONFIRMED', date, time);
                    }}
                    onCompleteAppointment={(b) => {
                        setInspectBooking(null);
                        setCompletingBooking(b as Booking);
                    }}
                />
            )}
        </div>
    );
}
