'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Award, Star, Sparkles, Trash2, Crown, Users, StickyNote, ImageIcon, X, Plus, ChevronDown, ChevronUp, FileSignature, ShieldCheck, Download, Smartphone, Camera, Cake, Mail, Globe, UserCircle } from 'lucide-react';
import AdminModal, { AdminLightbox } from '../AdminModal';

type CustomerNote = {
    id: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;
};

type BookingConsent = {
    id: string;
    consentType: string;
    granted: boolean;
    label: string;
    ip?: string | null;
    userAgent?: string | null;
    createdAt: string;
};

type Customer = {
    id: string; name: string; email: string; phone?: string; createdAt: string; image?: string | null;
    dateOfBirth?: string | null;
    loyaltyCard?: {
        currentStamps: number; lifetimeStamps: number; spinAvailable: boolean; spinsRedeemed: number;
        birthdaySpinAvailable?: boolean;
        isInsider?: boolean; referralCode?: string; referralRewards?: number;
        stamps: { id: string; earnedAt: string; note?: string; }[];
        referralStats?: { totalReferrals: number; pendingRewards: number; completedReferrals: number };
    };
    bookings: { id: string; preferredDate: string; service: { name: string; }; status: string; healthIntake?: any; consents?: BookingConsent[] }[];
    notes: CustomerNote[];
    _count: { bookings: number; };
    googleId?: string | null;
    appleId?: string | null;
    password?: string | null;
    isSpecialEventClient?: boolean;
    hasSmsConsent?: boolean;
    hasPhotoConsent?: boolean;
    isGuest?: boolean;
};

type Tab = 'info' | 'notes' | 'bookings' | 'health' | 'consents';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Customer | null>(null);
    const [acting, setActing] = useState(false);
    const [stampNote, setStampNote] = useState('');
    const [showStampNote, setShowStampNote] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [editDob, setEditDob] = useState('');
    const [savingDob, setSavingDob] = useState(false);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    const [healthForm, setHealthForm] = useState<any>(null);
    const [loadingHealth, setLoadingHealth] = useState(false);
    const [savingHealth, setSavingHealth] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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

    // List filter state
    type ListFilter = '' | 'sms_leads' | 'photo_consent' | 'se_clients';
    const [listFilter, setListFilter] = useState<ListFilter>('');
    const [counts, setCounts] = useState<{ smsLeads: number; photoConsent: number; seClients: number } | null>(null);
    const [exporting, setExporting] = useState(false);

    const fetchCustomers = useCallback((q?: string, f?: string) => {
        const qs = (q || '').trim();
        const params = new URLSearchParams();
        if (qs) params.set('q', qs);
        if (f) params.set('filter', f);
        const url = params.toString() ? `/api/admin/customers?${params}` : '/api/admin/customers';
        fetch(url).then(r => r.json()).then(d => {
            setCustomers(d.customers || []);
            if (d.counts) setCounts(d.counts);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        const t = window.setTimeout(() => fetchCustomers(search, listFilter), 180);
        return () => window.clearTimeout(t);
    }, [fetchCustomers, search, listFilter]);

    useEffect(() => {
        if (activeTab === 'health' && selected) {
            setLoadingHealth(true);
            fetch(`/api/admin/customers/health?userId=${selected.id}`)
                .then(r => r.json())
                .then(d => {
                    setHealthForm(d.healthForm || { data: { skinTypes: [], healthQ: {}, medications: '', allergies: [], allergyNotes: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '' }, logs: [] });
                    setLoadingHealth(false);
                });
        }
    }, [activeTab, selected]);

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
        setEditDob(c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '');
        setExpandedBookingId(null);
    }

    const filtered = customers;

    async function exportCSV() {
        if (!listFilter) return;
        setExporting(true);
        try {
            const res = await fetch(`/api/admin/customers/export?type=${listFilter}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || `${listFilter}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    }

    const S: React.CSSProperties = {
        fontFamily: 'Poppins, sans-serif',
    };

    return (
        <div style={{ maxWidth: '860px' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Clients</h1>
                <p style={{ ...S, color: '#555', fontSize: '13px' }}>{customers.length} registered accounts</p>
            </div>

            <input className="input" placeholder="Search by name, email, or phone…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...S, marginBottom: '14px' }} />

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
                {([
                    { key: '', label: 'All', icon: null, count: null },
                    { key: 'sms_leads', label: 'SMS Leads', icon: <Smartphone size={11} style={{ marginRight: '3px' }} />, count: counts?.smsLeads },
                    { key: 'photo_consent', label: 'Photo', icon: <Camera size={11} style={{ marginRight: '3px' }} />, count: counts?.photoConsent },
                    { key: 'se_clients', label: 'SE Clients', icon: <FileSignature size={11} style={{ marginRight: '3px' }} />, count: counts?.seClients },
                ] as { key: ListFilter; label: string; icon: React.ReactNode; count: number | null | undefined }[]).map(tab => (
                    <button key={tab.key} onClick={() => { setListFilter(tab.key); setLoading(true); }}
                        style={{
                            ...S, fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '50px',
                            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                            background: listFilter === tab.key ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.05)',
                            color: listFilter === tab.key ? '#fff' : '#666',
                            display: 'inline-flex', alignItems: 'center',
                        }}>
                        {tab.icon}{tab.label}{tab.count != null ? ` (${tab.count})` : ''}
                    </button>
                ))}

                {listFilter && (
                    <button onClick={exportCSV} disabled={exporting}
                        style={{
                            ...S, fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '50px',
                            cursor: exporting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', border: 'none',
                            background: 'rgba(0,212,120,0.1)', color: '#00D478',
                            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            opacity: exporting ? 0.6 : 1,
                        }}>
                        <Download size={12} /> {exporting ? 'Exporting…' : 'Export CSV'}
                    </button>
                )}
            </div>

            {/* Customer List */}
            <div style={{ display: 'grid', gap: '8px' }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '66px', borderRadius: '14px' }} />)
                ) : filtered.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <p style={{ ...S, color: '#555' }}>No customers found</p>
                    </div>
                ) : filtered.map(c => (
                    <button key={c.id} onClick={() => !c.isGuest && openCustomer(c)}
                        style={{ background: selected?.id === c.id ? 'rgba(255,45,120,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected?.id === c.id ? 'rgba(255,45,120,0.28)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', padding: '13px 16px', cursor: c.isGuest ? 'default' : 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s', opacity: c.isGuest ? 0.85 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Avatar */}
                            {c.isGuest
                                ? <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCircle size={20} color="#555" /></div>
                                : c.image
                                    ? <img src={c.image} alt={c.name} style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                                    : <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...S, fontWeight: 700, color: '#fff', fontSize: '15px' }}>{c.name.charAt(0)}</div>
                            }
                            {/* Name + email */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '13px' }}>{c.name}</p>
                                    {c.isGuest && <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#666', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><UserCircle size={8} /> Guest</span>}
                                    {!c.isGuest && c.loyaltyCard?.isInsider && <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#D4AF37', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Crown size={8} /> INSIDER</span>}
                                    {c.isSpecialEventClient && <span style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#c084fc', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><FileSignature size={8} /> SE Client</span>}
                                    {(c as any).hasSmsConsent && <span style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Smartphone size={8} /> SMS</span>}
                                    {(c as any).hasPhotoConsent && <span style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Camera size={8} /> Photo</span>}
                                    {!c.isGuest && !c.dateOfBirth && <span title="Missing date of birth" style={{ background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.35)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#ff6b6b', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Cake size={8} /> No DOB</span>}
                                    {c.googleId && <span style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.35)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#4285F4', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Globe size={8} /> Google</span>}
                                    {c.appleId && <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><ShieldCheck size={8} /> Apple</span>}
                                    {c.password && !c.googleId && !c.appleId && <span style={{ background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.35)', borderRadius: '50px', padding: '1px 6px', fontSize: '9px', ...S, fontWeight: 700, color: '#FF2D78', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Mail size={8} /> Direct</span>}
                                </div>
                                <p style={{ ...S, color: '#555', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                            </div>
                            {/* Stats */}
                            {!c.isGuest && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                                    <span style={{ ...S, display: 'flex', alignItems: 'center', gap: '3px', color: '#FF2D78', fontSize: '11px', fontWeight: 600 }}>
                                        <Star size={10} fill="#FF2D78" /> {c.loyaltyCard?.currentStamps ?? 0}/10
                                    </span>
                                    <span style={{ ...S, color: '#555', fontSize: '11px' }}>{c._count.bookings} visits</span>
                                    {c.notes?.length > 0 && <span style={{ ...S, display: 'flex', alignItems: 'center', gap: '3px', color: '#666', fontSize: '10px' }}><StickyNote size={9} /> {c.notes.length}</span>}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {selected && (
                <AdminModal onClose={() => setSelected(null)} maxWidth={520}>
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>

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
                                        {selected.loyaltyCard?.isInsider && <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '50px', padding: '2px 8px', fontSize: '9px', ...S, fontWeight: 700, color: '#D4AF37', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Crown size={9} /> INSIDER</span>}
                                        {selected.isSpecialEventClient && <span style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '50px', padding: '2px 8px', fontSize: '9px', ...S, fontWeight: 700, color: '#c084fc', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><FileSignature size={8} /> SE Client</span>}
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
                                    { key: 'health', label: 'Health' },
                                    { key: 'consents', label: 'Consents' },
                                ] as { key: Tab; label: string }[]).map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', ...S, fontSize: '11px', fontWeight: 600, transition: 'all 0.18s', background: activeTab === tab.key ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'transparent', color: activeTab === tab.key ? '#fff' : '#555' }}>
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
                                        {/* DOB row with inline edit */}
                                        <div style={{ padding: '11px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ ...S, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0, minWidth: '48px' }}>DOB</span>
                                            {selected.dateOfBirth ? (
                                                <span style={{ ...S, color: '#ddd', fontSize: '13px', flex: 1 }}>
                                                    {new Date(selected.dateOfBirth).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            ) : (
                                                <span style={{ ...S, color: '#ff6b6b', fontSize: '12px', flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}><Cake size={12} /> Missing</span>
                                            )}
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                                                <input
                                                    type="date"
                                                    value={editDob}
                                                    onChange={e => setEditDob(e.target.value)}
                                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', ...S, fontSize: '12px', padding: '4px 8px', colorScheme: 'dark' }}
                                                />
                                                <button
                                                    disabled={!editDob || savingDob}
                                                    onClick={async () => {
                                                        if (!editDob) return;
                                                        setSavingDob(true);
                                                        await fetch('/api/admin/customers', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ customerId: selected.id, action: 'set-dob', dob: editDob }),
                                                        });
                                                        const fresh = await fetch('/api/admin/customers').then(r => r.json());
                                                        setCustomers(fresh.customers || []);
                                                        const refreshed = (fresh.customers || []).find((c: Customer) => c.id === selected.id);
                                                        setSelected(refreshed || null);
                                                        setSavingDob(false);
                                                    }}
                                                    style={{ background: editDob ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editDob ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', padding: '4px 10px', ...S, fontSize: '11px', fontWeight: 600, color: editDob ? '#FF2D78' : '#444', cursor: editDob ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                                                >
                                                    {savingDob ? '…' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
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

                                    {/* Nail Set Banner (10 stamps) */}
                                    {selected.loyaltyCard?.spinAvailable && (
                                        <div style={{ background: 'rgba(255,45,120,0.08)', border: '1.5px solid rgba(255,45,120,0.35)', borderRadius: '14px', padding: '14px 16px', textAlign: 'center' }}>
                                            <p style={{ ...S, fontWeight: 700, color: '#FF2D78', fontSize: '14px', marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <Sparkles size={15} /> Free Nail Set Pending!
                                            </p>
                                            <p style={{ ...S, color: '#777', fontSize: '12px', marginBottom: '12px' }}>Mark as redeemed after their free nail set.</p>
                                            <button className="btn-primary" disabled={acting} onClick={() => doAction(selected.id, 'redeem-spin')} style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                {acting ? 'Processing…' : <><Award size={13} /> Mark Nail Set Redeemed</>}
                                            </button>
                                        </div>
                                    )}

                                    {/* Birthday Spin Banner */}
                                    {selected.loyaltyCard?.birthdaySpinAvailable && (
                                        <div style={{ background: 'rgba(255,215,0,0.07)', border: '1.5px solid rgba(255,215,0,0.3)', borderRadius: '14px', padding: '14px 16px', textAlign: 'center' }}>
                                            <p style={{ ...S, fontWeight: 700, color: '#FFD700', fontSize: '14px', marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <Sparkles size={15} /> Birthday Spin Pending!
                                            </p>
                                            <p style={{ ...S, color: '#777', fontSize: '12px', marginBottom: '12px' }}>Birthday reward — mark as redeemed after they spin the wheel.</p>
                                            <button disabled={acting} onClick={() => doAction(selected.id, 'redeem-birthday-spin')}
                                                style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,165,0,0.1))', border: '1.5px solid rgba(255,215,0,0.4)', color: '#FFD700', cursor: 'pointer', padding: '8px 18px', borderRadius: '10px', ...S, fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                {acting ? '…' : <><Sparkles size={13} /> Mark Birthday Spin Redeemed</>}
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
                                                        <p style={{ ...S, fontWeight: 700, color: '#D4AF37', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Crown size={14} /> Glam Insider Active</p>
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
                                                        {acting ? '…' : <><Award size={13} /> Redeem Free Nail Set ({selected.loyaltyCard?.referralRewards} left)</>}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <div>
                                                    <p style={{ ...S, fontWeight: 600, color: '#777', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><Star size={13} /> Glam Member</p>
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
                                        <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                                            <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ ...S, color: '#ddd', fontSize: '13px', fontWeight: 500 }}>{b.service.name}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                                        <p style={{ ...S, color: '#555', fontSize: '11px' }}>{b.preferredDate}</p>
                                                        {b.healthIntake && Object.keys(b.healthIntake).length > 0 && (
                                                            <button 
                                                                onClick={() => setExpandedBookingId(expandedBookingId === b.id ? null : b.id)}
                                                                style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '4px', color: '#FF2D78', fontSize: '9px', padding: '2px 6px', cursor: 'pointer', ...S, fontWeight: 600 }}>
                                                                {expandedBookingId === b.id ? 'HIDE HEALTH FORM' : 'VIEW HEALTH FORM'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <span style={{ ...S, color: b.status === 'COMPLETED' ? '#FF2D78' : '#555', fontSize: '11px', fontWeight: 700, flexShrink: 0, background: b.status === 'COMPLETED' ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${b.status === 'COMPLETED' ? 'rgba(255,45,120,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '6px', padding: '3px 8px' }}>
                                                    {b.status}
                                                </span>
                                            </div>
                                            {b.healthIntake && expandedBookingId === b.id && (() => {
                                                const hi = b.healthIntake as any;
                                                const LEGACY_MAP: Record<string, string> = {
                                                    pregnant: 'Pregnant or breastfeeding?',
                                                    accutane: 'Used Accutane / isotretinoin in the past 12 months?',
                                                    retinoids: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?',
                                                    botox: 'Had Botox, fillers, or injections in the past 2 weeks?',
                                                    surgery: 'Had surgery or medical procedures in the past 6 months?',
                                                    infections: 'Any active skin infections, open wounds, or cold sores?',
                                                    autoimmune: 'Any autoimmune conditions, diabetes, or circulatory issues?',
                                                    hsv: 'History of cold sores (HSV)?',
                                                    pacemaker: 'Pacemaker or implanted medical device?',
                                                };
                                                return (
                                                    <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                                                        {/* Skin Types */}
                                                        {hi.skinTypes?.length > 0 && (
                                                            <div style={{ marginBottom: '10px' }}>
                                                                <p style={{ ...S, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', fontWeight: 600 }}>Skin Type / Concerns</p>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                    {hi.skinTypes.map((t: string) => (
                                                                        <span key={t} style={{ ...S, fontSize: '11px', color: '#ddd', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', padding: '2px 8px' }}>{t}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Health Questions */}
                                                        {(() => {
                                                            const hq = hi.healthQuestions;
                                                            const legacyQ = hi.healthQ;
                                                            if (hq && hq.length > 0) {
                                                                return (
                                                                    <div style={{ marginBottom: '10px' }}>
                                                                        <p style={{ ...S, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', fontWeight: 600 }}>Health Questions</p>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                            {hq.map((q: any) => (
                                                                                <div key={q.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: '6px', background: q.answer === 'yes' ? 'rgba(255,80,80,0.07)' : 'rgba(255,255,255,0.02)', border: `1px solid ${q.answer === 'yes' ? 'rgba(255,80,80,0.18)' : 'rgba(255,255,255,0.04)'}` }}>
                                                                                    <span style={{ ...S, fontSize: '11px', color: '#bbb', flex: 1, marginRight: '8px' }}>{q.question}</span>
                                                                                    <span style={{ ...S, fontSize: '10px', fontWeight: 700, color: q.answer === 'yes' ? '#ff8888' : '#00D478', textTransform: 'uppercase', flexShrink: 0 }}>{q.answer}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            if (legacyQ && typeof legacyQ === 'object' && Object.keys(legacyQ).length > 0) {
                                                                return (
                                                                    <div style={{ marginBottom: '10px' }}>
                                                                        <p style={{ ...S, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', fontWeight: 600 }}>Health Questions</p>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                            {Object.entries(legacyQ).map(([key, val]) => (
                                                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: '6px', background: val === 'yes' ? 'rgba(255,80,80,0.07)' : 'rgba(255,255,255,0.02)', border: `1px solid ${val === 'yes' ? 'rgba(255,80,80,0.18)' : 'rgba(255,255,255,0.04)'}` }}>
                                                                                    <span style={{ ...S, fontSize: '11px', color: '#bbb', flex: 1, marginRight: '8px' }}>{LEGACY_MAP[key] || key}</span>
                                                                                    <span style={{ ...S, fontSize: '10px', fontWeight: 700, color: val === 'yes' ? '#ff8888' : '#00D478', textTransform: 'uppercase', flexShrink: 0 }}>{val as string}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}

                                                        {/* Allergies */}
                                                        {hi.allergies?.length > 0 && (
                                                            <div style={{ marginBottom: '10px' }}>
                                                                <p style={{ ...S, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', fontWeight: 600 }}>Allergies / Reactions</p>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                    {hi.allergies.map((a: string) => (
                                                                        <span key={a} style={{ ...S, fontSize: '11px', color: '#ffaa88', background: 'rgba(255,100,50,0.1)', border: '1px solid rgba(255,100,50,0.2)', borderRadius: '50px', padding: '2px 8px' }}>{a}</span>
                                                                    ))}
                                                                </div>
                                                                {hi.allergyNotes && (
                                                                    <p style={{ ...S, fontSize: '11px', color: '#bbb', fontStyle: 'italic', marginTop: '5px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>{hi.allergyNotes}</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Medications */}
                                                        {hi.medications && (
                                                            <div style={{ marginBottom: '10px' }}>
                                                                <p style={{ ...S, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Current Medications</p>
                                                                <p style={{ ...S, fontSize: '11px', color: '#ddd', fontStyle: 'italic', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>{hi.medications}</p>
                                                            </div>
                                                        )}

                                                        {/* Emergency Contact */}
                                                        {hi.emergencyName && (
                                                            <div style={{ marginBottom: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                                <p style={{ ...S, fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Emergency Contact</p>
                                                                <p style={{ ...S, fontSize: '12px', color: '#fff', fontWeight: 600 }}>{hi.emergencyName}{hi.emergencyRelation && <span style={{ color: '#aaa', fontWeight: 400 }}> — {hi.emergencyRelation}</span>}</p>
                                                                {hi.emergencyPhone && <p style={{ ...S, fontSize: '11px', color: '#FF2D78' }}>{hi.emergencyPhone}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                            <p style={{ ...S, color: '#333', fontSize: '13px' }}>No bookings yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: HEALTH FORM ── */}
                            {activeTab === 'health' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {loadingHealth ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading health form...</div>
                                    ) : (
                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                                            <p style={{ ...S, fontSize: '12px', color: '#aaa', marginBottom: '16px', lineHeight: 1.5 }}>
                                                Make edits to the client's health form below. All changes are logged for auditing purposes.
                                            </p>
                                            
                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="label" style={{ ...S, display: 'block', marginBottom: '6px' }}>Skin Types</label>
                                                <input type="text" className="input" placeholder="Oily, Dry, Sensitive..." 
                                                    value={healthForm?.data?.skinTypes?.join(', ') || ''} 
                                                    onChange={e => {
                                                        const parts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                        setHealthForm({ ...healthForm, data: { ...healthForm.data, skinTypes: parts } });
                                                    }}
                                                    style={{ ...S, width: '100%', marginBottom: '12px' }} />
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="label" style={{ ...S, display: 'block', marginBottom: '6px' }}>Medications</label>
                                                <input type="text" className="input" 
                                                    value={healthForm?.data?.medications || ''} 
                                                    onChange={e => setHealthForm({ ...healthForm, data: { ...healthForm.data, medications: e.target.value } })}
                                                    style={{ ...S, width: '100%', marginBottom: '12px' }} />
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="label" style={{ ...S, display: 'block', marginBottom: '6px' }}>Allergies</label>
                                                <input type="text" className="input" placeholder="Latex, Wax..." 
                                                    value={healthForm?.data?.allergies?.join(', ') || ''} 
                                                    onChange={e => {
                                                        const parts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                        setHealthForm({ ...healthForm, data: { ...healthForm.data, allergies: parts } });
                                                    }}
                                                    style={{ ...S, width: '100%', marginBottom: '12px' }} />
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <label className="label" style={{ ...S, display: 'block', marginBottom: '6px' }}>Allergy Notes</label>
                                                <input type="text" className="input" 
                                                    value={healthForm?.data?.allergyNotes || ''} 
                                                    onChange={e => setHealthForm({ ...healthForm, data: { ...healthForm.data, allergyNotes: e.target.value } })}
                                                    style={{ ...S, width: '100%', marginBottom: '12px' }} />
                                            </div>

                                            <button 
                                                className="btn-primary" 
                                                disabled={savingHealth}
                                                onClick={async () => {
                                                    setSavingHealth(true);
                                                    const res = await fetch('/api/admin/customers/health', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: selected.id, data: healthForm.data })
                                                    });
                                                    const d = await res.json();
                                                    if (d.success) setHealthForm(d.healthForm);
                                                    setSavingHealth(false);
                                                }}
                                                style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                                            >
                                                {savingHealth ? 'Saving...' : 'Save Health Form'}
                                            </button>

                                            {healthForm?.logs?.length > 0 && (
                                                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                                                    <h3 style={{ ...S, fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Version History</h3>
                                                    <div style={{ display: 'grid', gap: '8px' }}>
                                                        {healthForm.logs.map((log: any, idx: number) => {
                                                            const isExpanded = expandedLogId === log.id;
                                                            return (
                                                                <div key={log.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', fontSize: '11px', color: '#aaa', ...S }}>
                                                                    <div 
                                                                        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                                                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                                    >
                                                                        <div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                                                <strong style={{ color: log.updatedBy === 'Admin' ? '#FF2D78' : '#00D478' }}>V{healthForm.logs.length - idx} - Edited by {log.updatedBy}</strong>
                                                                            </div>
                                                                            <div>{new Date(log.createdAt).toLocaleString()}</div>
                                                                            <div style={{ marginTop: '2px', opacity: 0.6 }}>IP: {log.ipAddress} | {log.userAgent?.substring(0, 30)}...</div>
                                                                        </div>
                                                                        <div>
                                                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                        </div>
                                                                    </div>

                                                                    {isExpanded && log.diff && (
                                                                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#ccc', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                                                                            <div><strong style={{ color: '#fff' }}>Skin Types:</strong> {log.diff.skinTypes?.length ? log.diff.skinTypes.join(', ') : 'None'}</div>
                                                                            <div><strong style={{ color: '#fff' }}>Medications:</strong> {log.diff.medications || 'None'}</div>
                                                                            <div><strong style={{ color: '#fff' }}>Allergies:</strong> {log.diff.allergies?.length ? log.diff.allergies.join(', ') : 'None'}</div>
                                                                            {log.diff.allergyNotes && <div><strong style={{ color: '#fff' }}>Allergy Notes:</strong> {log.diff.allergyNotes}</div>}
                                                                            
                                                                            <div style={{ marginTop: '4px' }}><strong style={{ color: '#fff' }}>Health Questions:</strong></div>
                                                                            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'circle' }}>
                                                                                {Object.entries(log.diff.healthQ || {}).map(([k, v]) => (
                                                                                    <li key={k} style={{ marginBottom: '2px' }}>{k}: <span style={{ color: v === 'yes' ? '#FF2D78' : '#888' }}>{v as string}</span></li>
                                                                                ))}
                                                                            </ul>
                                                                            
                                                                            <div style={{ marginTop: '4px' }}><strong style={{ color: '#fff' }}>Emergency Contact:</strong></div>
                                                                            <div>Name: {log.diff.emergencyName || 'N/A'}</div>
                                                                            <div>Phone: {log.diff.emergencyPhone || 'N/A'}</div>
                                                                            <div>Relation: {log.diff.emergencyRelation || 'N/A'}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: CONSENTS ── */}
                            {activeTab === 'consents' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Legal notice */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px' }}>
                                        <ShieldCheck size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '1px' }} />
                                        <p style={{ ...S, fontSize: '12px', color: '#aaa', lineHeight: 1.5, margin: 0 }}>
                                            Immutable consent records captured at booking time. Each record includes the client&apos;s IP address, browser, and exact timestamp for legal reference.
                                        </p>
                                    </div>

                                    {(() => {
                                        const bookingsWithConsents = selected.bookings.filter(b => b.consents && b.consents.length > 0);
                                        if (bookingsWithConsents.length === 0) {
                                            return (
                                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                                    <ShieldCheck size={30} color="#2a2a2a" />
                                                    <p style={{ ...S, color: '#333', fontSize: '13px', marginTop: '8px' }}>No consent records yet</p>
                                                    <p style={{ ...S, color: '#2a2a2a', fontSize: '11px', marginTop: '4px' }}>Consents are captured on new bookings going forward</p>
                                                </div>
                                            );
                                        }
                                        return bookingsWithConsents.map(b => (
                                            <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
                                                {/* Booking header */}
                                                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <p style={{ ...S, fontSize: '12px', fontWeight: 600, color: '#ddd' }}>{b.service.name}</p>
                                                        <p style={{ ...S, fontSize: '10px', color: '#555', marginTop: '2px' }}>{b.preferredDate}</p>
                                                    </div>
                                                    <span style={{ ...S, fontSize: '9px', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px', padding: '3px 8px' }}>
                                                        {b.consents!.length} CONSENT{b.consents!.length !== 1 ? 'S' : ''}
                                                    </span>
                                                </div>
                                                {/* Consent rows */}
                                                <div style={{ padding: '8px 14px 10px' }}>
                                                    {b.consents!.map(c => (
                                                        <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                            {/* Status dot */}
                                                            <div style={{
                                                                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                                                                background: c.granted ? '#00D478' : '#ff4d4d',
                                                                boxShadow: c.granted ? '0 0 6px rgba(0,212,120,0.4)' : '0 0 6px rgba(255,77,77,0.4)',
                                                            }} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                                                    <p style={{ ...S, fontSize: '12px', fontWeight: 600, color: c.granted ? '#ddd' : '#ff6b6b' }}>{c.label}</p>
                                                                    <span style={{
                                                                        ...S, fontSize: '9px', fontWeight: 700, flexShrink: 0, borderRadius: '4px', padding: '2px 6px',
                                                                        background: c.granted ? 'rgba(0,212,120,0.1)' : 'rgba(255,77,77,0.1)',
                                                                        border: `1px solid ${c.granted ? 'rgba(0,212,120,0.25)' : 'rgba(255,77,77,0.25)'}`,
                                                                        color: c.granted ? '#00D478' : '#ff4d4d',
                                                                    }}>
                                                                        {c.granted ? 'GRANTED' : 'DECLINED'}
                                                                    </span>
                                                                </div>
                                                                <p style={{ ...S, fontSize: '10px', color: '#444', marginTop: '3px' }}>
                                                                    {new Date(c.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                </p>
                                                                {c.ip && (
                                                                    <p style={{ ...S, fontSize: '9px', color: '#333', marginTop: '2px', fontFamily: 'monospace' }}>
                                                                        IP: {c.ip}{c.userAgent ? ` · ${c.userAgent.substring(0, 50)}${c.userAgent.length > 50 ? '…' : ''}` : ''}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </AdminModal>
            )}

            {/* Image Lightbox */}
            {lightboxImg && (
                <AdminLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />
            )}
        </div>
    );
}
