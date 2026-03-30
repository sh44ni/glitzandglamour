'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Star, CheckCircle, Clock, Send, Mail, MessageSquare, Copy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Booking = {
    id: string;
    preferredDate: string;
    user: { name: string; email: string; phone?: string } | null;
    service: { name: string };
    review: { rating: number; text: string; createdAt: string } | null;
    reviewToken: { isFirstVisit: boolean; used: boolean; expiresAt: string } | null;
    notifications: { sentAt: string; type: string; status: string }[];
};

const S: React.CSSProperties = { fontFamily: 'Poppins, sans-serif' };
const pill = (color: string, bg: string, border: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600,
    color, background: bg, border: `1px solid ${border}`,
    borderRadius: '50px', padding: '2px 8px', whiteSpace: 'nowrap',
});
const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '14px 16px',
};

// ─── Manual Generator Section ─────────────────────────────────────────────────

function ManualGenerator() {
    const [name, setName] = useState('');
    const [service, setService] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [includeDiscount, setIncludeDiscount] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [smsText, setSmsText] = useState('');
    const [emailText, setEmailText] = useState('');
    const [reviewUrl, setReviewUrl] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendingSms, setSendingSms] = useState(false);
    const [sentEmail, setSentEmail] = useState(false);
    const [sentSms, setSentSms] = useState(false);
    const [copied, setCopied] = useState<'sms' | 'email' | 'link' | null>(null);
    const [error, setError] = useState('');

    async function generate() {
        if (!name.trim()) { setError('Enter client name first'); return; }
        setError('');
        setGenerating(true);
        setSmsText(''); setEmailText(''); setReviewUrl('');
        setSentEmail(false); setSentSms(false);
        try {
            const res = await fetch('/api/admin/review-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manualClient: { name: name.trim(), phone, email, service: service.trim() }, includeDiscount, generateOnly: true }),
            });
            const d = await res.json();
            if (d.generated) { setSmsText(d.sms); setEmailText(d.email); setReviewUrl(d.reviewUrl || ''); }
        } catch { setError('Generation failed — check connection'); }
        setGenerating(false);
    }

    async function sendSms() {
        if (!phone.trim() || !smsText.trim()) return;
        setSendingSms(true);
        // For manual, call Pingram directly via a lightweight endpoint
        try {
            const res = await fetch('/api/admin/review-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manualClient: { name: name.trim(), phone, email },
                    channel: 'sms',
                    includeDiscount,
                    customSms: smsText,
                }),
            });
            if (res.ok) setSentSms(true);
        } catch { }
        setSendingSms(false);
    }

    async function sendEmail() {
        if (!email.trim() || !emailText.trim()) return;
        setSendingEmail(true);
        try {
            const res = await fetch('/api/admin/review-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manualClient: { name: name.trim(), phone, email },
                    channel: 'email',
                    includeDiscount,
                    customEmail: emailText,
                }),
            });
            if (res.ok) setSentEmail(true);
        } catch { }
        setSendingEmail(false);
    }

    async function copy(type: 'sms' | 'email' | 'link') {
        const text = type === 'sms' ? smsText : type === 'email' ? emailText : reviewUrl;
        await navigator.clipboard.writeText(text).catch(() => {});
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
        padding: '9px 13px', color: '#fff', fontSize: '13px', ...S, outline: 'none',
    };
    const taStyle: React.CSSProperties = {
        ...inputStyle, resize: 'vertical', lineHeight: 1.6,
    };

    return (
        <div style={{ ...card, borderColor: 'rgba(255,45,120,0.15)' }}>
            <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '16px' }}>
                Manual Message Generator
            </p>
            <p style={{ ...S, color: '#555', fontSize: '12px', marginBottom: '16px' }}>
                For walk-in or non-account clients. Enter their details, generate an AI message, edit it, then send.
            </p>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '10px', marginBottom: '14px' }}>
                <div>
                    <label style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Client Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah" style={inputStyle} />
                </div>
                <div>
                    <label style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Service</label>
                    <input value={service} onChange={e => setService(e.target.value)} placeholder="e.g. Acrylic Full Set" style={inputStyle} />
                </div>
                <div>
                    <label style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Phone</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 760 555 0000" style={inputStyle} />
                </div>
                <div>
                    <label style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@email.com" style={inputStyle} />
                </div>
            </div>

            {/* $10 toggle + generate */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div
                        onClick={() => setIncludeDiscount(v => !v)}
                        style={{ width: '34px', height: '19px', borderRadius: '50px', background: includeDiscount ? '#FF2D78' : 'rgba(255,255,255,0.08)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', border: `1px solid ${includeDiscount ? '#FF2D78' : 'rgba(255,255,255,0.12)'}` }}
                    >
                        <div style={{ position: 'absolute', top: '2px', left: includeDiscount ? '17px' : '2px', width: '13px', height: '13px', background: '#fff', borderRadius: '50%', transition: 'left 0.15s' }} />
                    </div>
                    <span style={{ ...S, fontSize: '12px', color: includeDiscount ? '#FF2D78' : '#555', fontWeight: 600 }}>Include $10 off incentive</span>
                </label>

                <button
                    onClick={generate}
                    disabled={generating || !name.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: generating ? 'rgba(255,45,120,0.3)' : 'linear-gradient(135deg,#FF2D78,#c0155a)', border: 'none', borderRadius: '9px', cursor: generating || !name.trim() ? 'not-allowed' : 'pointer', ...S, fontSize: '12px', fontWeight: 600, color: '#fff', opacity: !name.trim() ? 0.4 : 1 }}
                >
                    <Sparkles size={13} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                    {generating ? 'Generating…' : 'Generate with AI'}
                </button>

                {error && <span style={{ ...S, fontSize: '12px', color: '#FF2D78' }}>{error}</span>}
            </div>

            {/* Generated messages */}
            {(smsText || emailText) && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {/* Review Link */}
                    {reviewUrl && (
                        <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '9px', padding: '10px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ ...S, color: '#FF2D78', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>🔗 Review Link (embedded in messages)</label>
                                <button onClick={() => copy('link')} style={{ display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', color: copied === 'link' ? '#00D478' : '#FF2D78', background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '7px', padding: '4px 9px', cursor: 'pointer' }}>
                                    <Copy size={10} />{copied === 'link' ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                            <p style={{ ...S, fontSize: '11px', color: '#777', marginTop: '5px', wordBreak: 'break-all' }}>{reviewUrl}</p>
                        </div>
                    )}
                    {/* SMS */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <MessageSquare size={11} color="#00D478" /> SMS · {smsText.length}/160
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => copy('sms')} style={{ display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '4px 9px', cursor: 'pointer' }}>
                                    <Copy size={10} />{copied === 'sms' ? 'Copied' : 'Copy'}
                                </button>
                                {phone && (
                                    <button onClick={sendSms} disabled={sendingSms || sentSms} style={{ display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', fontWeight: 600, color: sentSms ? '#00D478' : '#00D478', background: sentSms ? 'rgba(0,212,120,0.08)' : 'rgba(0,212,120,0.06)', border: `1px solid ${sentSms ? 'rgba(0,212,120,0.35)' : 'rgba(0,212,120,0.18)'}`, borderRadius: '7px', padding: '4px 9px', cursor: sentSms ? 'default' : 'pointer', opacity: sendingSms ? 0.6 : 1 }}>
                                        {sendingSms ? <RefreshCw size={10} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={10} />}
                                        {sentSms ? 'Sent' : 'Send SMS'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea rows={3} value={smsText} onChange={e => setSmsText(e.target.value)} style={{ ...taStyle, borderColor: smsText.length > 160 ? 'rgba(255,45,120,0.5)' : 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Email */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ ...S, color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Mail size={11} color="#FF2D78" /> Email body
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => copy('email')} style={{ display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '4px 9px', cursor: 'pointer' }}>
                                    <Copy size={10} />{copied === 'email' ? 'Copied' : 'Copy'}
                                </button>
                                {email && (
                                    <button onClick={sendEmail} disabled={sendingEmail || sentEmail} style={{ display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', fontWeight: 600, color: sentEmail ? '#FF2D78' : '#FF2D78', background: sentEmail ? 'rgba(255,45,120,0.1)' : 'rgba(255,45,120,0.06)', border: `1px solid ${sentEmail ? 'rgba(255,45,120,0.35)' : 'rgba(255,45,120,0.18)'}`, borderRadius: '7px', padding: '4px 9px', cursor: sentEmail ? 'default' : 'pointer', opacity: sendingEmail ? 0.6 : 1 }}>
                                        {sendingEmail ? <RefreshCw size={10} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Mail size={10} />}
                                        {sentEmail ? 'Sent' : 'Send Email'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea rows={4} value={emailText} onChange={e => setEmailText(e.target.value)} style={taStyle} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Account Clients Tracking Table ──────────────────────────────────────────

function TrackingTable() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        const res = await fetch('/api/admin/review-generator');
        if (res.ok) {
            const d = await res.json();
            setBookings(d.bookings || []);
        }
        setLoading(false); setRefreshing(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = bookings.filter(b => {
        if (!search) return true;
        const q = search.toLowerCase();
        return b.user?.name.toLowerCase().includes(q) || b.service.name.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
    });

    const reviewed = bookings.filter(b => b.review).length;
    const sent = bookings.filter(b => b.notifications.length > 0).length;
    const pending = bookings.filter(b => !b.review && b.notifications.length === 0).length;

    return (
        <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                    { label: 'Reviewed', value: reviewed, color: '#00D478' },
                    { label: 'Request Sent', value: sent, color: '#FFB700' },
                    { label: 'Not Sent', value: pending, color: '#444' },
                ].map(s => (
                    <div key={s.label} style={{ ...card, padding: '12px 14px' }}>
                        <p style={{ ...S, color: '#555', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>{s.label}</p>
                        <p style={{ ...S, color: s.color, fontSize: '22px', fontWeight: 700 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search + refresh */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                    type="text" placeholder="Search by name, email or service…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', padding: '8px 13px', color: '#fff', fontSize: '13px', ...S, outline: 'none' }}
                />
                <button onClick={() => load(true)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <RefreshCw size={13} color="#555" style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
            </div>

            {/* Rows */}
            <div style={{ display: 'grid', gap: '6px' }}>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ height: 62, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', animation: 'pulse 1.4s ease infinite' }} />
                    ))
                ) : filtered.length === 0 ? (
                    <div style={{ ...card, textAlign: 'center', padding: '32px' }}>
                        <p style={{ ...S, color: '#444', fontSize: '13px' }}>No completed account bookings yet.</p>
                    </div>
                ) : filtered.map(b => {
                    const lastSent = b.notifications[0]?.sentAt;
                    const hasReview = !!b.review;
                    const isExpanded = expanded === b.id;

                    // status
                    let statusEl;
                    if (hasReview) {
                        statusEl = (
                            <span style={pill('#00D478', 'rgba(0,212,120,0.08)', 'rgba(0,212,120,0.22)')}>
                                <CheckCircle size={9} />
                                {b.review!.rating}★ Reviewed
                            </span>
                        );
                    } else if (lastSent) {
                        statusEl = (
                            <span style={pill('#FFB700', 'rgba(255,183,0,0.08)', 'rgba(255,183,0,0.22)')}>
                                <Send size={9} />
                                Sent {new Date(lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        );
                    } else {
                        statusEl = (
                            <span style={pill('#555', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)')}>
                                <Clock size={9} /> Pending
                            </span>
                        );
                    }

                    return (
                        <div key={b.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : b.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                {/* info */}
                                <div style={{ flex: 1, minWidth: '140px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                        <p style={{ ...S, fontWeight: 600, color: '#ddd', fontSize: '13px' }}>{b.user?.name}</p>
                                        {b.reviewToken?.isFirstVisit && (
                                            <span style={pill('#FF2D78', 'rgba(255,45,120,0.09)', 'rgba(255,45,120,0.2)')}>1st visit</span>
                                        )}
                                    </div>
                                    <p style={{ ...S, color: '#555', fontSize: '11px' }}>
                                        {b.service.name} · {b.preferredDate} · {b.user?.email}
                                    </p>
                                </div>
                                {statusEl}
                                {/* notification count */}
                                {b.notifications.length > 0 && (
                                    <span style={{ ...S, fontSize: '11px', color: '#444' }}>
                                        {b.notifications.length} request{b.notifications.length > 1 ? 's' : ''} sent
                                    </span>
                                )}
                                <div style={{ color: '#444', flexShrink: 0 }}>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                    {/* Notification log */}
                                    {b.notifications.length > 0 && (
                                        <div>
                                            <p style={{ ...S, color: '#555', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>Notification Log</p>
                                            {b.notifications.map((n, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                                    {n.type === 'email' ? <Mail size={11} color="#FF2D78" /> : <MessageSquare size={11} color="#00D478" />}
                                                    <span style={{ ...S, fontSize: '11px', color: '#666' }}>{n.type} · {new Date(n.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span style={{ ...S, fontSize: '10px', color: n.status === 'sent' ? '#00D478' : '#FF2D78', fontWeight: 600 }}>{n.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Review */}
                                    {b.review && (
                                        <div style={{ background: 'rgba(0,212,120,0.04)', border: '1px solid rgba(0,212,120,0.12)', borderRadius: '9px', padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={11} fill={i < b.review!.rating ? '#FFB700' : 'transparent'} color={i < b.review!.rating ? '#FFB700' : '#333'} />
                                                ))}
                                                <span style={{ ...S, color: '#555', fontSize: '10px', marginLeft: '4px' }}>{new Date(b.review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ ...S, color: '#999', fontSize: '12px', lineHeight: 1.5 }}>"{b.review.text}"</p>
                                        </div>
                                    )}
                                    {/* Review link status */}
                                    {b.reviewToken && !b.review && (() => {
                                        const isExpired = new Date(b.reviewToken.expiresAt) < new Date();
                                        const isUsed = b.reviewToken.used;
                                        const isActive = !isExpired && !isUsed;
                                        // Build the review URL using the token stored in the type
                                        // We need to fetch the actual token — for now show status + link to generate
                                        return (
                                            <div style={{ background: isActive ? 'rgba(255,45,120,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '9px', padding: '8px 12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                                    <div>
                                                        <span style={{ ...S, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: isActive ? '#FF2D78' : '#444' }}>
                                                            🔗 Review Link · {isUsed ? 'submitted' : isExpired ? 'expired' : 'active'}
                                                        </span>
                                                        <p style={{ ...S, fontSize: '11px', color: '#555', marginTop: '3px' }}>
                                                            Expires {new Date(b.reviewToken.expiresAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <button
                                                            onClick={async () => {
                                                                // Generate / fetch the review link for this booking
                                                                const res = await fetch('/api/admin/review-generator', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ bookingId: b.id, generateOnly: true }),
                                                                });
                                                                const d = await res.json();
                                                                if (d.reviewUrl) {
                                                                    await navigator.clipboard.writeText(d.reviewUrl).catch(() => {});
                                                                    setCopiedLink(b.id);
                                                                    setTimeout(() => setCopiedLink(null), 2500);
                                                                }
                                                            }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', ...S, fontSize: '11px', fontWeight: 600, color: copiedLink === b.id ? '#00D478' : '#FF2D78', background: copiedLink === b.id ? 'rgba(0,212,120,0.08)' : 'rgba(255,45,120,0.08)', border: `1px solid ${copiedLink === b.id ? 'rgba(0,212,120,0.25)' : 'rgba(255,45,120,0.2)'}`, borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                                                        >
                                                            <Copy size={10} />{copiedLink === b.id ? 'Copied!' : 'Copy Link'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReviewGeneratorPage() {
    const [tab, setTab] = useState<'tracking' | 'manual'>('tracking');

    const tabBtn = (t: typeof tab, label: string): React.CSSProperties => ({
        ...S, fontSize: '13px', fontWeight: 600, padding: '8px 18px',
        borderRadius: '9px', border: 'none',
        background: tab === t ? 'rgba(255,45,120,0.12)' : 'transparent',
        color: tab === t ? '#FF2D78' : '#555',
        cursor: 'pointer', transition: 'all 0.15s',
        outline: tab === t ? '1px solid rgba(255,45,120,0.25)' : 'none',
    });

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Review Requests</h1>
                <p style={{ ...S, color: '#555', fontSize: '13px' }}>
                    Auto-sent when booking is marked complete. Track account clients or generate for walk-ins.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '11px', padding: '4px', width: 'fit-content' }}>
                <button style={tabBtn('tracking', 'Account Clients')} onClick={() => setTab('tracking')}>Account Clients</button>
                <button style={tabBtn('manual', 'Manual Generator')} onClick={() => setTab('manual')}>Manual Generator</button>
            </div>

            {tab === 'tracking' ? <TrackingTable /> : <ManualGenerator />}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                input:focus, textarea:focus { border-color: rgba(255,45,120,0.35) !important; outline: none; }
            `}</style>
        </div>
    );
}
