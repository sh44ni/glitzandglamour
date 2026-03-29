'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Send, Star, CheckCircle, Clock, Mail, MessageSquare, Sparkles } from 'lucide-react';

type Booking = {
    id: string;
    preferredDate: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    user?: { name: string; email: string; phone?: string };
    service: { name: string };
    review: null | { rating: number };
    reviewToken: null | { isFirstVisit: boolean; used: boolean };
    notifications: { sentAt: string; type: string }[];
};

function getClient(b: Booking) {
    return {
        name: b.user?.name || b.guestName || '—',
        email: b.user?.email || b.guestEmail || null,
        phone: (b.user as any)?.phone || b.guestPhone || null,
    };
}

type SendState = 'idle' | 'generating' | 'sending' | 'sent' | 'error';

type RowState = {
    state: SendState;
    includeDiscount: boolean;
    error?: string;
};

const S: React.CSSProperties = { fontFamily: 'Poppins, sans-serif' };

export default function ReviewGeneratorPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
    const [search, setSearch] = useState('');

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        const res = await fetch('/api/admin/review-generator');
        if (res.ok) {
            const d = await res.json();
            setBookings(d.bookings || []);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    function setRow(id: string, patch: Partial<RowState>) {
        setRowStates(prev => {
            const existing = prev[id] || { state: 'idle' as SendState, includeDiscount: false };
            return { ...prev, [id]: { ...existing, ...patch } };
        });
    }

    function getRow(id: string): RowState {
        return rowStates[id] || { state: 'idle', includeDiscount: false };
    }

    async function sendRequest(booking: Booking, channel: 'both' | 'email' | 'sms') {
        const row = getRow(booking.id);
        setRow(booking.id, { state: 'sending' });
        try {
            const res = await fetch('/api/admin/review-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: booking.id,
                    includeDiscount: row.includeDiscount,
                    channel,
                }),
            });
            if (res.ok) {
                setRow(booking.id, { state: 'sent' });
                load(true);
            } else {
                const d = await res.json();
                setRow(booking.id, { state: 'error', error: d.error || 'Failed' });
            }
        } catch {
            setRow(booking.id, { state: 'error', error: 'Network error' });
        }
    }

    const filtered = bookings.filter(b => {
        if (!search) return true;
        const c = getClient(b);
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || b.service.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    });

    const reviewed = bookings.filter(b => b.review).length;
    const pending = bookings.filter(b => !b.review).length;
    const sent = bookings.filter(b => b.notifications.length > 0 && !b.review).length;

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Review Requests</h1>
                    <p style={{ ...S, color: '#555', fontSize: '13px' }}>
                        Review requests are sent automatically on booking completion. Manually re-send or follow up here.
                    </p>
                </div>
                <button
                    onClick={() => load(true)}
                    disabled={refreshing}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', ...S, color: '#888', fontSize: '13px' }}
                >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Reviewed', value: reviewed, color: '#00D478', border: 'rgba(0,212,120,0.15)' },
                    { label: 'Request Sent', value: sent, color: '#FFB700', border: 'rgba(255,183,0,0.15)' },
                    { label: 'No Review Yet', value: pending, color: '#555', border: 'rgba(255,255,255,0.07)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.border}`, borderRadius: '14px', padding: '16px 18px' }}>
                        <p style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</p>
                        <p style={{ ...S, color: s.color, fontSize: '26px', fontWeight: 700 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Info note */}
            <div style={{ background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Sparkles size={14} color="#FF2D78" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ ...S, color: '#666', fontSize: '12px', lineHeight: 1.6 }}>
                    When you mark a booking <strong style={{ color: '#fff' }}>Complete</strong>, an AI-personalized review request is sent automatically via SMS + email. First-time clients receive a <strong style={{ color: '#FF2D78' }}>$10 off</strong> incentive. Use this page to follow up or re-send manually.
                </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="Search by name, service, or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', ...S, outline: 'none' }}
                />
            </div>

            {/* Table */}
            <div style={{ display: 'grid', gap: '8px' }}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ height: 70, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', animation: 'pulse 1.5s ease infinite' }} />
                    ))
                ) : filtered.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                        <p style={{ ...S, color: '#444', fontSize: '13px' }}>No completed bookings found.</p>
                    </div>
                ) : filtered.map(b => {
                    const client = getClient(b);
                    const row = getRow(b.id);
                    const hasReview = !!b.review;
                    const lastSent = b.notifications[0]?.sentAt;
                    const isFirstVisit = b.reviewToken?.isFirstVisit;
                    const sending = row.state === 'sending';

                    return (
                        <div key={b.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '14px', padding: '14px 16px',
                            display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                        }}>
                            {/* Client info */}
                            <div style={{ flex: 1, minWidth: '160px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                    <p style={{ ...S, fontWeight: 600, color: '#ddd', fontSize: '13px' }}>{client.name}</p>
                                    {isFirstVisit && (
                                        <span style={{ ...S, fontSize: '10px', fontWeight: 600, color: '#FF2D78', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '50px', padding: '1px 7px' }}>
                                            1st visit
                                        </span>
                                    )}
                                </div>
                                <p style={{ ...S, color: '#555', fontSize: '11px' }}>
                                    {b.service.name} · {b.preferredDate}
                                </p>
                                <p style={{ ...S, color: '#444', fontSize: '11px', marginTop: '2px' }}>
                                    {[client.email, client.phone].filter(Boolean).join(' · ') || 'No contact info'}
                                </p>
                            </div>

                            {/* Status */}
                            <div style={{ flexShrink: 0 }}>
                                {hasReview ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', fontWeight: 600, color: '#00D478', background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)', borderRadius: '50px', padding: '3px 10px' }}>
                                        <CheckCircle size={10} /> Reviewed
                                        {b.review?.rating && <><Star size={9} fill="#FFB700" color="#FFB700" /> {b.review.rating}</>}
                                    </span>
                                ) : lastSent ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', fontWeight: 600, color: '#FFB700', background: 'rgba(255,183,0,0.08)', border: '1px solid rgba(255,183,0,0.2)', borderRadius: '50px', padding: '3px 10px' }}>
                                        <Send size={10} /> Sent {new Date(lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', fontWeight: 600, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '3px 10px' }}>
                                        <Clock size={10} /> Pending
                                    </span>
                                )}
                            </div>

                            {/* $10 toggle */}
                            {!hasReview && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                                    <div
                                        onClick={() => setRow(b.id, { includeDiscount: !row.includeDiscount })}
                                        style={{ width: '32px', height: '18px', borderRadius: '50px', background: row.includeDiscount ? '#FF2D78' : 'rgba(255,255,255,0.08)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', border: `1px solid ${row.includeDiscount ? '#FF2D78' : 'rgba(255,255,255,0.12)'}`, flexShrink: 0 }}>
                                        <div style={{ position: 'absolute', top: '2px', left: row.includeDiscount ? '16px' : '2px', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', transition: 'left 0.15s' }} />
                                    </div>
                                    <span style={{ ...S, fontSize: '11px', color: '#555', whiteSpace: 'nowrap' }}>$10 off</span>
                                </label>
                            )}

                            {/* Send buttons */}
                            {!hasReview && (
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    {row.state === 'sent' ? (
                                        <span style={{ ...S, fontSize: '12px', color: '#00D478', fontWeight: 600 }}>Sent</span>
                                    ) : row.state === 'error' ? (
                                        <span style={{ ...S, fontSize: '11px', color: '#FF2D78' }}>{row.error}</span>
                                    ) : (
                                        <>
                                            {client.email && (
                                                <button
                                                    onClick={() => sendRequest(b, 'email')}
                                                    disabled={sending}
                                                    title="Send email"
                                                    style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '8px', padding: '6px 9px', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', color: '#FF2D78', fontWeight: 600, opacity: sending ? 0.5 : 1 }}
                                                >
                                                    <Mail size={11} /> Email
                                                </button>
                                            )}
                                            {client.phone && (
                                                <button
                                                    onClick={() => sendRequest(b, 'sms')}
                                                    disabled={sending}
                                                    title="Send SMS"
                                                    style={{ background: 'rgba(0,212,120,0.06)', border: '1px solid rgba(0,212,120,0.18)', borderRadius: '8px', padding: '6px 9px', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', color: '#00D478', fontWeight: 600, opacity: sending ? 0.5 : 1 }}
                                                >
                                                    <MessageSquare size={11} /> SMS
                                                </button>
                                            )}
                                            {client.email && client.phone && (
                                                <button
                                                    onClick={() => sendRequest(b, 'both')}
                                                    disabled={sending}
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 9px', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', color: '#aaa', fontWeight: 600, opacity: sending ? 0.5 : 1 }}
                                                >
                                                    {sending ? <RefreshCw size={11} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={11} />}
                                                    Both
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                input:focus { border-color: rgba(255,45,120,0.4) !important; }
            `}</style>
        </div>
    );
}
