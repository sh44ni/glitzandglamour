'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Mail, Smartphone, Check, PartyPopper } from 'lucide-react';

type Booking = {
    id: string; guestName?: string; guestEmail?: string; guestPhone?: string;
    preferredDate: string; preferredTime: string; status: string; notes?: string; createdAt: string;
    userId?: string | null;
    user?: { name: string; email: string; phone?: string; image?: string | null; };
    service: { name: string; priceLabel: string; };
};

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
type Filter = typeof FILTERS[number];

const statusColor: Record<string, string> = {
    PENDING: '#FFB700', CONFIRMED: '#00D478', COMPLETED: '#FF2D78', CANCELLED: '#555',
};

const nextStatus: Partial<Record<string, string>> = {
    PENDING: 'CONFIRMED', CONFIRMED: 'COMPLETED',
};

const nextStatusLabel: Partial<Record<string, string>> = {
    PENDING: 'Confirm ✅', CONFIRMED: 'Mark Complete 🎉',
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<Filter>('ALL');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchBookings = useCallback(() => {
        const url = filter === 'ALL' ? '/api/admin/bookings' : `/api/admin/bookings?status=${filter}`;
        fetch(url).then(r => r.json()).then(d => {
            setBookings(d.bookings || []);
            setLoading(false);
        });
    }, [filter]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    async function updateStatus(bookingId: string, status: string) {
        setUpdating(bookingId);
        await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, status }),
        });
        await fetchBookings();
        setUpdating(null);
    }

    const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Bookings</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>{filtered.length} {filter === 'ALL' ? 'total' : filter.toLowerCase()} bookings</p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {FILTERS.map(f => (
                    <button key={f} onClick={() => { setFilter(f); setLoading(true); }}
                        style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                            padding: '7px 14px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s',
                            background: filter === f ? '#FF2D78' : 'rgba(255,255,255,0.05)',
                            color: filter === f ? '#fff' : '#666',
                            border: filter === f ? '1px solid #FF2D78' : '1px solid rgba(255,255,255,0.08)',
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div style={{ display: 'grid', gap: '12px' }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555' }}>No {filter.toLowerCase()} bookings</p>
                    </div>
                ) : (
                    filtered.map(b => {
                        const customerName = b.user?.name || b.guestName || 'Guest';
                        const customerEmail = b.user?.email || b.guestEmail || '—';
                        const customerPhone = b.user?.phone || b.guestPhone || '—';
                        const isGuest = !b.userId && !b.user;
                        return (
                            <div key={b.id} className="glass-card" style={{ padding: '18px 20px', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            {b.user?.image && (
                                                <img src={b.user.image} alt={customerName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                            )}
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '15px' }}>{customerName}</p>
                                            {isGuest && (
                                                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#666', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>
                                                    Guest
                                                </span>
                                            )}
                                            <span style={{
                                                background: `${statusColor[b.status]}22`, border: `1px solid ${statusColor[b.status]}44`,
                                                color: statusColor[b.status], borderRadius: '50px', padding: '3px 9px',
                                                fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                                            }}>{b.status}</span>
                                        </div>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                                            {b.service.name} — {b.service.priceLabel}
                                        </p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={13} /> {b.preferredDate} at {b.preferredTime}
                                        </p>
                                        <div style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {customerEmail}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={12} /> {customerPhone}</span>
                                        </div>
                                        {b.notes && (
                                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                                                Notes: {b.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                        {nextStatus[b.status] && (
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '12px', padding: '8px 14px', opacity: updating === b.id ? 0.7 : 1 }}
                                                disabled={updating === b.id}
                                                onClick={() => updateStatus(b.id, nextStatus[b.status]!)}
                                            >
                                                {updating === b.id ? '...' : nextStatusLabel[b.status]}
                                            </button>
                                        )}
                                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                                            <button
                                                className="btn-outline"
                                                style={{ fontSize: '11px', padding: '6px 12px', color: '#555', borderColor: 'rgba(255,255,255,0.1)' }}
                                                onClick={() => updateStatus(b.id, 'CANCELLED')}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
