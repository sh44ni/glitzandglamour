'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Star, Mail, MessageSquare, Send, RefreshCw, Sparkles,
    CheckCircle, Clock, User, ChevronDown, Zap
} from 'lucide-react';

type Booking = {
    id: string;
    preferredDate: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    user?: { name: string; email: string; phone?: string };
    service: { name: string };
    review: null | { id: string; rating: number; text: string };
    reviewToken: null | { isFirstVisit: boolean; used: boolean };
    notifications: { sentAt: string; status: string; type: string }[];
};

type GeneratedMsg = { sms: string; email: string; reviewUrl: string; isFirstVisit: boolean };

function getCustomer(b: Booking) {
    return {
        name: b.user?.name || b.guestName || 'Guest',
        email: b.user?.email || b.guestEmail,
        phone: b.user?.phone || b.guestPhone,
    };
}

export default function ReviewGeneratorPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [selectedId, setSelectedId] = useState('');
    const [selected, setSelected] = useState<Booking | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Generator state
    const [includeDiscount, setIncludeDiscount] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState<GeneratedMsg | null>(null);
    const [customSms, setCustomSms] = useState('');
    const [editedEmail, setEditedEmail] = useState('');

    // Send state
    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendingSms, setSendingSms] = useState(false);
    const [sendResults, setSendResults] = useState<Record<string, string>>({});

    const loadBookings = useCallback(async () => {
        setLoadingList(true);
        const res = await fetch('/api/admin/review-generator');
        if (res.ok) {
            const d = await res.json();
            setBookings(d.bookings || []);
        }
        setLoadingList(false);
    }, []);

    useEffect(() => { loadBookings(); }, [loadBookings]);

    function selectBooking(b: Booking) {
        setSelected(b);
        setSelectedId(b.id);
        setDropdownOpen(false);
        setGenerated(null);
        setCustomSms('');
        setEditedEmail('');
        setSendResults({});
        // Auto-set discount toggle based on first visit
        setIncludeDiscount(b.reviewToken?.isFirstVisit ?? false);
    }

    async function generateMessages() {
        if (!selected) return;
        setGenerating(true);
        setGenerated(null);
        try {
            const res = await fetch('/api/admin/review-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: selected.id,
                    includeDiscount,
                    generateOnly: true,
                }),
            });
            const d = await res.json();
            if (d.generated) {
                setGenerated(d);
                setCustomSms(d.sms);
                setEditedEmail(d.email);
            }
        } catch { }
        setGenerating(false);
    }

    async function sendChannel(channel: 'email' | 'sms' | 'both') {
        if (!selected) return;
        const isSms = channel === 'sms' || channel === 'both';
        const isEmail = channel === 'email' || channel === 'both';
        if (isSms) setSendingSms(true);
        if (isEmail) setSendingEmail(true);

        try {
            const res = await fetch('/api/admin/review-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: selected.id,
                    includeDiscount,
                    channel,
                    customMessage: channel !== 'email' ? customSms : undefined,
                }),
            });
            const d = await res.json();
            if (d.success) {
                const newResults: Record<string, string> = { ...sendResults };
                if (isEmail) newResults.email = d.results?.email?.sent ? 'sent' : d.results?.email?.reason || 'failed';
                if (isSms) newResults.sms = d.results?.sms?.sent ? 'sent' : d.results?.sms?.reason || 'failed';
                setSendResults(newResults);
                // Reload list after send
                loadBookings();
            }
        } catch { }

        if (isSms) setSendingSms(false);
        if (isEmail) setSendingEmail(false);
    }

    const customer = selected ? getCustomer(selected) : null;
    const hasSentReview = selected?.notifications && selected.notifications.length > 0;
    const hasReviewed = !!selected?.review;

    const pStyle: React.CSSProperties = {
        fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', lineHeight: 1.6,
    };
    const labelStyle: React.CSSProperties = {
        fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '11px',
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'block', marginBottom: '8px',
    };
    const textareaStyle: React.CSSProperties = {
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
        padding: '14px', color: '#fff', fontSize: '14px',
        fontFamily: 'Poppins, sans-serif', lineHeight: 1.6,
        resize: 'vertical', outline: 'none', transition: 'border-color 0.2s',
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff',
                    fontSize: '22px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <Sparkles size={20} color="#FF2D78" /> Review Requests
                </h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>
                    AI-powered personalized review request generator
                </p>
            </div>

            {/* ─── Stats Row ───────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px', marginBottom: '28px' }}>
                {[
                    { label: 'Completed', value: bookings.length, color: '#FF2D78', icon: <Star size={16} color="#FF2D78" /> },
                    { label: 'Reviewed', value: bookings.filter(b => b.review).length, color: '#00D478', icon: <CheckCircle size={16} color="#00D478" /> },
                    { label: 'Pending Review', value: bookings.filter(b => !b.review).length, color: '#FFB700', icon: <Clock size={16} color="#FFB700" /> },
                    { label: 'Request Sent', value: bookings.filter(b => b.notifications.length > 0).length, color: '#888', icon: <Send size={16} color="#888" /> },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '16px 18px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            {s.icon}
                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                        </div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', color: s.color, fontSize: '26px', fontWeight: 800 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '20px' }}>

                {/* ─── Booking Selector ───────────────────────── */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: '20px',
                }}>
                    <label style={labelStyle}>Select Completed Booking</label>

                    {/* Custom dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(o => !o)}
                            style={{
                                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'rgba(255,255,255,0.04)', border: `1px solid ${dropdownOpen ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '12px', padding: '12px 14px', cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                                color: selected ? '#fff' : '#555', transition: 'border-color 0.2s',
                            }}
                        >
                            {selected ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} color="#FF2D78" />
                                    <span>{customer?.name}</span>
                                    <span style={{ color: '#555', fontSize: '12px' }}>— {selected.service.name}</span>
                                    <span style={{ color: '#444', fontSize: '11px' }}>({selected.preferredDate})</span>
                                </span>
                            ) : (
                                loadingList ? 'Loading…' : '— Select a booking —'
                            )}
                            <ChevronDown size={15} color="#555" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                        </button>

                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                                background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '14px', maxHeight: '300px', overflowY: 'auto',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                            }}>
                                {bookings.length === 0 ? (
                                    <div style={{ padding: '16px', fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>
                                        No completed bookings yet.
                                    </div>
                                ) : bookings.map(b => {
                                    const c = getCustomer(b);
                                    const reviewed = !!b.review;
                                    const sent = b.notifications.length > 0;
                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => selectBooking(b)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '12px 16px', background: selectedId === b.id ? 'rgba(255,45,120,0.08)' : 'transparent',
                                                border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', fontWeight: 500 }}>
                                                    {c.name} · <span style={{ color: '#666' }}>{b.service.name}</span>
                                                </div>
                                                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', marginTop: '2px' }}>
                                                    {b.preferredDate} {c.email && `· ${c.email}`}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                {reviewed && <span style={{ background: 'rgba(0,212,120,0.15)', color: '#00D478', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Reviewed</span>}
                                                {!reviewed && sent && <span style={{ background: 'rgba(255,183,0,0.12)', color: '#FFB700', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Sent</span>}
                                                {!reviewed && !sent && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#555', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Pending</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {selected && (
                    <>
                        {/* ─── Client Info + Status ─────────────────── */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px', padding: '20px',
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px',
                        }}>
                            <div>
                                <span style={labelStyle}>Client</span>
                                <p style={{ ...pStyle, color: '#fff', fontWeight: 600, fontSize: '14px' }}>{customer?.name}</p>
                                {customer?.email && <p style={{ ...pStyle, fontSize: '12px' }}>{customer.email}</p>}
                                {customer?.phone && <p style={{ ...pStyle, fontSize: '12px' }}>{customer.phone}</p>}
                            </div>
                            <div>
                                <span style={labelStyle}>Service</span>
                                <p style={{ ...pStyle, color: '#FF2D78', fontWeight: 600, fontSize: '14px' }}>{selected.service.name}</p>
                                <p style={{ ...pStyle, fontSize: '12px' }}>{selected.preferredDate}</p>
                            </div>
                            <div>
                                <span style={labelStyle}>Status</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                                        color: hasReviewed ? '#00D478' : '#FFB700',
                                        background: hasReviewed ? 'rgba(0,212,120,0.1)' : 'rgba(255,183,0,0.1)',
                                        border: `1px solid ${hasReviewed ? 'rgba(0,212,120,0.25)' : 'rgba(255,183,0,0.25)'}`,
                                        borderRadius: '50px', padding: '4px 10px', width: 'fit-content',
                                    }}>
                                        {hasReviewed ? <><CheckCircle size={12} /> Reviewed</> : <><Clock size={12} /> No Review Yet</>}
                                    </div>
                                    {selected.reviewToken?.isFirstVisit && (
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                                            color: '#FF2D78', background: 'rgba(255,45,120,0.1)',
                                            border: '1px solid rgba(255,45,120,0.25)', borderRadius: '50px',
                                            padding: '4px 10px', width: 'fit-content',
                                        }}>
                                            🎁 First Visit
                                        </div>
                                    )}
                                    {hasSentReview && (
                                        <p style={{ ...pStyle, fontSize: '11px' }}>
                                            Last sent: {new Date(selected.notifications[0].sentAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ─── Generator ─────────────────────────────── */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px', padding: '20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={16} color="#FFB700" /> AI Message Generator
                                </h3>

                                {/* $10 Toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px', fontWeight: 600 }}>
                                        Include $10 off
                                    </span>
                                    <div
                                        onClick={() => setIncludeDiscount(v => !v)}
                                        style={{
                                            width: '40px', height: '22px', borderRadius: '50px',
                                            background: includeDiscount ? '#FF2D78' : 'rgba(255,255,255,0.1)',
                                            position: 'relative', cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            border: `1px solid ${includeDiscount ? '#FF2D78' : 'rgba(255,255,255,0.15)'}`,
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', top: '2px',
                                            left: includeDiscount ? '20px' : '2px',
                                            width: '16px', height: '16px',
                                            background: '#fff', borderRadius: '50%',
                                            transition: 'left 0.2s',
                                        }} />
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={generateMessages}
                                disabled={generating}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: generating ? 'rgba(255,45,120,0.3)' : 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                                    border: 'none', borderRadius: '12px',
                                    color: '#fff', fontFamily: 'Poppins, sans-serif',
                                    fontSize: '14px', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s', marginBottom: '20px',
                                }}
                            >
                                {generating ? (
                                    <><RefreshCw size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Generating with AI…</>
                                ) : (
                                    <><Sparkles size={16} /> Generate Personalized Messages</>
                                )}
                            </button>

                            {generated && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {/* SMS Preview */}
                                    <div>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <MessageSquare size={13} color="#00D478" /> SMS Message
                                            <span style={{ color: `${customSms.length > 160 ? '#FF2D78' : '#555'}`, marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                                                {customSms.length}/160
                                            </span>
                                        </label>
                                        <textarea
                                            value={customSms}
                                            onChange={e => setCustomSms(e.target.value)}
                                            rows={4}
                                            style={textareaStyle}
                                        />
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => sendChannel('sms')}
                                                disabled={sendingSms || !customer?.phone}
                                                style={{
                                                    flex: 1, padding: '10px',
                                                    background: sendResults.sms === 'sent'
                                                        ? 'rgba(0,212,120,0.1)' : 'rgba(0,212,120,0.08)',
                                                    border: `1px solid ${sendResults.sms === 'sent' ? 'rgba(0,212,120,0.4)' : 'rgba(0,212,120,0.2)'}`,
                                                    borderRadius: '10px', cursor: !customer?.phone ? 'not-allowed' : 'pointer',
                                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                                    color: sendResults.sms === 'sent' ? '#00D478' : '#00D478',
                                                    fontWeight: 600, opacity: sendingSms || !customer?.phone ? 0.5 : 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                }}
                                            >
                                                {sendingSms ? <RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <MessageSquare size={13} />}
                                                {sendResults.sms === 'sent' ? 'SMS Sent ✓' : !customer?.phone ? 'No Phone' : 'Send SMS'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email Preview */}
                                    <div>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={13} color="#FF2D78" /> Email Message (body copy)
                                        </label>
                                        <textarea
                                            value={editedEmail}
                                            onChange={e => setEditedEmail(e.target.value)}
                                            rows={4}
                                            style={textareaStyle}
                                        />
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => sendChannel('email')}
                                                disabled={sendingEmail || !customer?.email}
                                                style={{
                                                    flex: 1, padding: '10px',
                                                    background: sendResults.email === 'sent'
                                                        ? 'rgba(255,45,120,0.1)' : 'rgba(255,45,120,0.08)',
                                                    border: `1px solid ${sendResults.email === 'sent' ? 'rgba(255,45,120,0.4)' : 'rgba(255,45,120,0.2)'}`,
                                                    borderRadius: '10px', cursor: !customer?.email ? 'not-allowed' : 'pointer',
                                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                                    color: '#FF2D78', fontWeight: 600,
                                                    opacity: sendingEmail || !customer?.email ? 0.5 : 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                }}
                                            >
                                                {sendingEmail ? <RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Mail size={13} />}
                                                {sendResults.email === 'sent' ? 'Email Sent ✓' : !customer?.email ? 'No Email' : 'Send Email'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Send Both */}
                                    <button
                                        onClick={() => sendChannel('both')}
                                        disabled={sendingEmail || sendingSms}
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: 'rgba(255,45,120,0.12)',
                                            border: '1px solid rgba(255,45,120,0.3)',
                                            borderRadius: '12px', cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                                            color: '#FF2D78', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            opacity: sendingEmail || sendingSms ? 0.5 : 1,
                                        }}
                                    >
                                        <Send size={15} /> Send Both SMS + Email
                                    </button>

                                    {/* Review Link */}
                                    {generated.reviewUrl && (
                                        <div style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '10px', padding: '10px 14px',
                                        }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', display: 'block', marginBottom: '4px' }}>Review Link</span>
                                            <span style={{ fontFamily: 'Courier New, monospace', fontSize: '11px', color: '#777', wordBreak: 'break-all' }}>{generated.reviewUrl}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ─── All Completed Bookings Table ────────────────────── */}
            <div style={{ marginTop: '32px' }}>
                <h3 style={{
                    fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '16px', fontWeight: 700,
                    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    📋 All Completed Bookings
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                    {loadingList ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', animation: 'pulse 1.5s ease infinite' }} />
                        ))
                    ) : bookings.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444' }}>No completed bookings yet.</p>
                        </div>
                    ) : bookings.map(b => {
                        const c = getCustomer(b);
                        const reviewed = !!b.review;
                        const sent = b.notifications.length > 0;
                        const isFirst = b.reviewToken?.isFirstVisit;

                        return (
                            <div
                                key={b.id}
                                onClick={() => selectBooking(b)}
                                style={{
                                    background: selectedId === b.id ? 'rgba(255,45,120,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedId === b.id ? 'rgba(255,45,120,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#ddd', fontWeight: 600 }}>{c.name}</span>
                                        {isFirst && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#FF2D78', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '50px', padding: '1px 7px' }}>1st Visit</span>}
                                    </div>
                                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#555', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <span>💅 {b.service.name}</span>
                                        <span>📅 {b.preferredDate}</span>
                                        {c.email && <span>✉ {c.email}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                                    {reviewed && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00D478', background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.2)', borderRadius: '50px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={10} /> Reviewed</span>}
                                    {!reviewed && sent && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#FFB700', background: 'rgba(255,183,0,0.1)', border: '1px solid rgba(255,183,0,0.2)', borderRadius: '50px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}><Send size={10} /> Sent</span>}
                                    {!reviewed && !sent && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '3px 10px' }}>Pending</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                textarea:focus { border-color: rgba(255,45,120,0.4) !important; }
            `}</style>
        </div>
    );
}
