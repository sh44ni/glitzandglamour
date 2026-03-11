'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Award, Star, Sparkles, Trash2, Crown, Users, StickyNote, ImageIcon, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

type CustomerNote = {
    id: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;
};

type Customer = {
    id: string; name: string; email: string; phone?: string; createdAt: string; image?: string | null;
    loyaltyCard?: {
        currentStamps: number; lifetimeStamps: number; spinAvailable: boolean; spinsRedeemed: number;
        isInsider?: boolean; referralCode?: string; referralRewards?: number;
        stamps: { id: string; earnedAt: string; note?: string; }[];
        referralStats?: { totalReferrals: number; pendingRewards: number; completedReferrals: number };
    };
    bookings: { id: string; preferredDate: string; service: { name: string; }; status: string; }[];
    notes: CustomerNote[];
    _count: { bookings: number; };
};

type Tab = 'info' | 'notes' | 'bookings';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Customer | null>(null);
    const [acting, setActing] = useState(false);
    const [stampNote, setStampNote] = useState('');
    const [showStampNote, setShowStampNote] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('info');

    // Notes state
    const [noteText, setNoteText] = useState('');
    const [noteImage, setNoteImage] = useState<File | null>(null);
    const [noteImagePreview, setNoteImagePreview] = useState<string | null>(null);
    const [savingNote, setSavingNote] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    // Collapse state for insider section on mobile
    const [showInsider, setShowInsider] = useState(true);

    const fetchCustomers = useCallback(() => {
        fetch('/api/admin/customers').then(r => r.json()).then(d => {
            setCustomers(d.customers || []);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    async function doAction(customerId: string, action: string, note?: string) {
        setActing(true);
        await fetch('/api/admin/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, action, note }),
        });
        const fresh = await fetch('/api/admin/customers').then(r => r.json());
        setCustomers(fresh.customers || []);
        const refreshed = (fresh.customers || []).find((c: Customer) => c.id === customerId);
        setSelected(refreshed || null);
        setActing(false);
        setShowStampNote(false);
        setStampNote('');
    }

    async function deleteCustomer(customerId: string) {
        if (!window.confirm('⚠️ Delete this customer?\n\nAll data will be permanently removed. This cannot be undone.')) return;
        setActing(true);
        try {
            const res = await fetch(`/api/admin/customers?id=${customerId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) { setSelected(null); fetchCustomers(); }
            else alert(data.error || 'Failed to delete customer');
        } catch { alert('An error occurred.'); }
        finally { setActing(false); }
    }

    function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setNoteImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setNoteImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function clearImage() {
        setNoteImage(null);
        setNoteImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    }

    async function saveNote() {
        if (!selected || !noteText.trim()) return;
        setSavingNote(true);
        try {
            let imageUrl: string | null = null;
            if (noteImage) {
                const fd = new FormData();
                fd.append('file', noteImage);
                const up = await fetch('/api/admin/customers/note-image', { method: 'POST', body: fd });
                const upData = await up.json();
                if (upData.url) imageUrl = upData.url;
            }
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: selected.id, action: 'add-note', noteText, imageUrl }),
            });
            const data = await res.json();
            if (data.success) {
                const fresh = await fetch('/api/admin/customers').then(r => r.json());
                setCustomers(fresh.customers || []);
                const refreshed = (fresh.customers || []).find((c: Customer) => c.id === selected.id);
                setSelected(refreshed || null);
                setNoteText('');
                clearImage();
            }
        } finally { setSavingNote(false); }
    }

    async function deleteNote(noteId: string) {
        if (!selected) return;
        setDeletingNoteId(noteId);
        try {
            await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: selected.id, action: 'delete-note', noteId }),
            });
            const fresh = await fetch('/api/admin/customers').then(r => r.json());
            setCustomers(fresh.customers || []);
            const refreshed = (fresh.customers || []).find((c: Customer) => c.id === selected.id);
            setSelected(refreshed || null);
        } finally { setDeletingNoteId(null); }
    }

    function openCustomer(c: Customer) {
        setSelected(c);
        setActiveTab('info');
        setShowStampNote(false);
        setNoteText('');
        clearImage();
    }

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const S: React.CSSProperties = {
        fontFamily: 'Poppins, sans-serif',
    };

    return (
        <div style={{ maxWidth: '860px' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Customers</h1>
                <p style={{ ...S, color: '#555', fontSize: '13px' }}>{customers.length} registered accounts</p>
            </div>

            <input className="input" placeholder="Search by name or email…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...S, marginBottom: '14px' }} />

            {/* Customer List */}
            <div style={{ display: 'grid', gap: '8px' }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '66px', borderRadius: '14px' }} />)
                ) : filtered.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <p style={{ ...S, color: '#555' }}>No customers found</p>
                    </div>
                ) : filtered.map(c => (
                    <button key={c.id} onClick={() => openCustomer(c)}
                        style={{ background: selected?.id === c.id ? 'rgba(255,45,120,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected?.id === c.id ? 'rgba(255,45,120,0.28)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', padding: '13px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Avatar */}
                            {c.image
                                ? <img src={c.image} alt={c.name} style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                                : <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...S, fontWeight: 700, color: '#fff', fontSize: '15px' }}>{c.name.charAt(0)}</div>
                            }
                            {/* Name + email */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '13px' }}>{c.name}</p>
                                    {c.loyaltyCard?.isInsider && <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#D4AF37' }}>⭐ INSIDER</span>}
                                </div>
                                <p style={{ ...S, color: '#555', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                            </div>
                            {/* Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                                <span style={{ ...S, display: 'flex', alignItems: 'center', gap: '3px', color: '#FF2D78', fontSize: '11px', fontWeight: 600 }}>
                                    <Star size={10} fill="#FF2D78" /> {c.loyaltyCard?.currentStamps ?? 0}/10
                                </span>
                                <span style={{ ...S, color: '#555', fontSize: '11px' }}>{c._count.bookings} visits</span>
                                {c.notes?.length > 0 && <span style={{ ...S, display: 'flex', alignItems: 'center', gap: '3px', color: '#666', fontSize: '10px' }}><StickyNote size={9} /> {c.notes.length}</span>}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* ─── Customer Detail Modal ─── */}
            {selected && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>

                    <div style={{ width: '100%', maxWidth: '520px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#111', borderRadius: '24px 24px 0 0', border: '1px solid rgba(255,45,120,0.2)', borderBottom: 'none', overflow: 'hidden' }}>

                        {/* ── Sticky Header ── */}
                        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
                            {/* Top row: avatar + name + close/delete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                {selected.image
                                    ? <img src={selected.image} alt={selected.name} style={{ width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                                    : <div style={{ width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...S, fontWeight: 700, color: '#fff', fontSize: '18px' }}>{selected.name.charAt(0)}</div>
                                }
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                                        <h2 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '16px', lineHeight: 1.2 }}>{selected.name}</h2>
                                        {selected.loyaltyCard?.isInsider && <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '50px', padding: '2px 8px', fontSize: '9px', ...S, fontWeight: 700, color: '#D4AF37' }}>⭐ INSIDER</span>}
                                    </div>
                                    <p style={{ ...S, color: '#555', fontSize: '11px', marginTop: '2px' }}>Since {new Date(selected.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                    <button onClick={() => deleteCustomer(selected.id)} disabled={acting}
                                        style={{ background: 'rgba(255,45,60,0.1)', border: '1px solid rgba(255,45,60,0.3)', color: '#ff6b6b', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', ...S, fontWeight: 600 }}>
                                        <Trash2 size={12} /> Delete
                                    </button>
                                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '0' }}>
                                {([
                                    { key: 'info', label: 'Info' },
                                    { key: 'notes', label: `Notes${selected.notes?.length ? ` (${selected.notes.length})` : ''}` },
                                    { key: 'bookings', label: `Visits (${selected._count.bookings})` },
                                ] as { key: Tab; label: string }[]).map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', ...S, fontSize: '12px', fontWeight: 600, transition: 'all 0.18s', background: activeTab === tab.key ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'transparent', color: activeTab === tab.key ? '#fff' : '#555' }}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 24px' }}>

                            {/* ── TAB: INFO ── */}
                            {activeTab === 'info' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                    {/* Contact Details — vertical rows, no overflow */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                                        {[
                                            { label: 'Email', val: selected.email },
                                            { label: 'Phone', val: selected.phone || '—' },
                                        ].map((row, i) => (
                                            <div key={row.label} style={{ padding: '11px 14px', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <span style={{ ...S, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0, minWidth: '48px', paddingTop: '1px' }}>{row.label}</span>
                                                <span style={{ ...S, color: '#ddd', fontSize: '13px', wordBreak: 'break-all', flex: 1 }}>{row.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Loyalty Stats — 2-col grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {[
                                            { label: 'Total Visits', val: String(selected._count.bookings) },
                                            { label: 'Lifetime Stamps', val: String(selected.loyaltyCard?.lifetimeStamps ?? 0) },
                                            { label: 'Current Stamps', val: `${selected.loyaltyCard?.currentStamps ?? 0}/10`, pink: true },
                                            { label: 'Spin Badges', val: String(selected.loyaltyCard?.spinsRedeemed ?? 0) },
                                        ].map(({ label, val, pink }) => (
                                            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px' }}>
                                                <p style={{ ...S, color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px' }}>{label}</p>
                                                <p style={{ ...S, color: pink ? '#FF2D78' : '#fff', fontSize: '18px', fontWeight: 700 }}>{val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Spin Banner */}
                                    {selected.loyaltyCard?.spinAvailable && (
                                        <div style={{ background: 'rgba(255,45,120,0.08)', border: '1.5px solid rgba(255,45,120,0.35)', borderRadius: '14px', padding: '14px 16px', textAlign: 'center' }}>
                                            <p style={{ ...S, fontWeight: 700, color: '#FF2D78', fontSize: '14px', marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <Sparkles size={15} /> Free Spin Pending!
                                            </p>
                                            <p style={{ ...S, color: '#777', fontSize: '12px', marginBottom: '12px' }}>Mark as redeemed after they spin.</p>
                                            <button className="btn-primary" disabled={acting} onClick={() => doAction(selected.id, 'redeem-spin')} style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                {acting ? 'Processing…' : <><Award size={13} /> Mark Spin Redeemed</>}
                                            </button>
                                        </div>
                                    )}

                                    {/* Card Tier */}
                                    <div>
                                        <button onClick={() => setShowInsider(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px', ...S, fontWeight: 600, color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Card Tier {showInsider ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        </button>
                                        {showInsider && (selected.loyaltyCard?.isInsider ? (
                                            <div style={{ background: 'rgba(212,175,55,0.07)', border: '1.5px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <div>
                                                        <p style={{ ...S, fontWeight: 700, color: '#D4AF37', fontSize: '14px' }}>⭐ Glam Insider Active</p>
                                                        {selected.loyaltyCard?.referralCode && <p style={{ fontFamily: 'monospace', color: '#777', fontSize: '11px', marginTop: '2px' }}>Code: {selected.loyaltyCard.referralCode}</p>}
                                                    </div>
                                                    <button onClick={() => doAction(selected.id, 'revoke-insider')} disabled={acting}
                                                        style={{ background: 'rgba(255,45,60,0.1)', border: '1px solid rgba(255,45,60,0.3)', color: '#ff7070', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', ...S, fontSize: '12px', fontWeight: 600 }}>
                                                        {acting ? '…' : 'Revoke'}
                                                    </button>
                                                </div>
                                                {selected.loyaltyCard?.referralStats && (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginTop: '10px' }}>
                                                        {[
                                                            { label: 'Referrals', value: selected.loyaltyCard.referralStats.totalReferrals },
                                                            { label: 'Completed', value: selected.loyaltyCard.referralStats.completedReferrals },
                                                            { label: 'Rewards', value: selected.loyaltyCard.referralRewards ?? 0 },
                                                        ].map(s => (
                                                            <div key={s.label} style={{ background: 'rgba(212,175,55,0.06)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                                                                <p style={{ ...S, fontWeight: 700, color: '#D4AF37', fontSize: '18px' }}>{s.value}</p>
                                                                <p style={{ ...S, color: '#666', fontSize: '10px' }}>{s.label}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {(selected.loyaltyCard?.referralRewards ?? 0) > 0 && (
                                                    <button onClick={() => doAction(selected.id, 'redeem-reward')} disabled={acting}
                                                        style={{ marginTop: '10px', width: '100%', background: 'linear-gradient(135deg,#D4AF37,#FFD700)', color: '#1a1200', border: 'none', borderRadius: '10px', padding: '10px', ...S, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                                                        {acting ? '…' : `💅 Redeem Free Nail Set (${selected.loyaltyCard?.referralRewards} left)`}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <div>
                                                    <p style={{ ...S, fontWeight: 600, color: '#777', fontSize: '13px' }}>💗 Glam Member</p>
                                                    <p style={{ ...S, color: '#444', fontSize: '11px', marginTop: '2px' }}>Promote to unlock referral QR</p>
                                                </div>
                                                <button onClick={() => doAction(selected.id, 'grant-insider')} disabled={acting}
                                                    style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.1))', border: '1.5px solid rgba(212,175,55,0.4)', color: '#D4AF37', cursor: 'pointer', padding: '8px 14px', borderRadius: '10px', ...S, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Crown size={13} /> {acting ? '…' : 'Grant Insider'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Manual stamp */}
                                    <div>
                                        {!showStampNote ? (
                                            <button className="btn-outline" style={{ width: '100%', fontSize: '13px', padding: '10px' }} onClick={() => setShowStampNote(true)}>
                                                + Add Stamp Manually
                                            </button>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px' }}>
                                                <label className="label" style={{ ...S }}>Reason (required)</label>
                                                <input type="text" className="input" placeholder="e.g. System error, goodwill gesture…"
                                                    value={stampNote} onChange={e => setStampNote(e.target.value)}
                                                    style={{ ...S, marginBottom: '10px' }} />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-outline" style={{ flex: 1, fontSize: '13px', padding: '8px' }} onClick={() => { setShowStampNote(false); setStampNote(''); }}>Cancel</button>
                                                    <button className="btn-primary" style={{ flex: 2, fontSize: '13px', padding: '8px' }}
                                                        disabled={!stampNote || acting} onClick={() => doAction(selected.id, 'add-stamp', stampNote)}>
                                                        {acting ? '…' : 'Add Stamp'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: NOTES ── */}
                            {activeTab === 'notes' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Add Note Form */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
                                        <textarea
                                            placeholder="Write a note… (preferences, allergies, style notes)"
                                            value={noteText}
                                            onChange={e => setNoteText(e.target.value)}
                                            rows={3}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', ...S, fontSize: '13px', padding: '10px 12px', resize: 'vertical', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                                        />
                                        {/* Image preview */}
                                        {noteImagePreview && (
                                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                                                <img src={noteImagePreview} alt="Preview" onClick={() => setLightboxImg(noteImagePreview)}
                                                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'zoom-in' }} />
                                                <button onClick={clearImage}
                                                    style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'rgba(200,0,40,0.9)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImagePick} style={{ display: 'none' }} />
                                            <button onClick={() => imageInputRef.current?.click()}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', ...S, fontSize: '12px', color: '#777', flexShrink: 0 }}>
                                                <ImageIcon size={13} /> Photo
                                            </button>
                                            <button onClick={saveNote} disabled={!noteText.trim() || savingNote}
                                                style={{ flex: 1, background: noteText.trim() ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', cursor: !noteText.trim() || savingNote ? 'not-allowed' : 'pointer', ...S, fontSize: '13px', fontWeight: 600, color: noteText.trim() ? '#fff' : '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                                                {savingNote ? 'Saving…' : <><Plus size={14} /> Save Note</>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notes List */}
                                    {selected.notes?.length > 0 ? selected.notes.map(n => (
                                        <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '13px 14px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ ...S, color: '#ccc', fontSize: '13px', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</p>
                                                    <p style={{ ...S, color: '#3a3a3a', fontSize: '10px', marginTop: '6px' }}>
                                                        {new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button onClick={() => deleteNote(n.id)} disabled={deletingNoteId === n.id}
                                                    style={{ background: 'rgba(255,45,60,0.07)', border: '1px solid rgba(255,45,60,0.18)', borderRadius: '7px', padding: '5px 7px', cursor: 'pointer', color: '#ff6b6b', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                                    {deletingNoteId === n.id ? '…' : <Trash2 size={12} />}
                                                </button>
                                            </div>
                                            {n.imageUrl && (
                                                <img src={n.imageUrl} alt="Attachment" onClick={() => setLightboxImg(n.imageUrl!)}
                                                    style={{ marginTop: '10px', width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', cursor: 'zoom-in', display: 'block' }} />
                                            )}
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                            <StickyNote size={30} color="#2a2a2a" />
                                            <p style={{ ...S, color: '#333', fontSize: '13px', marginTop: '8px' }}>No notes yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: BOOKINGS ── */}
                            {activeTab === 'bookings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selected.bookings.length > 0 ? selected.bookings.map(b => (
                                        <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ ...S, color: '#ddd', fontSize: '13px', fontWeight: 500 }}>{b.service.name}</p>
                                                <p style={{ ...S, color: '#555', fontSize: '11px', marginTop: '3px' }}>{b.preferredDate}</p>
                                            </div>
                                            <span style={{ ...S, color: b.status === 'COMPLETED' ? '#FF2D78' : '#555', fontSize: '11px', fontWeight: 700, flexShrink: 0, background: b.status === 'COMPLETED' ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${b.status === 'COMPLETED' ? 'rgba(255,45,120,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '6px', padding: '3px 8px' }}>
                                                {b.status}
                                            </span>
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                            <p style={{ ...S, color: '#333', fontSize: '13px' }}>No bookings yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {lightboxImg && (
                <div onClick={() => setLightboxImg(null)}
                    style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}>
                    <button onClick={() => setLightboxImg(null)}
                        style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <X size={18} />
                    </button>
                    <img src={lightboxImg} alt="Full size" style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', borderRadius: '12px' }} onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
