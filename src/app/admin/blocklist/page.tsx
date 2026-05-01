'use client';
import { useState, useEffect, useCallback } from 'react';
import { ShieldBan, X, Search } from 'lucide-react';
import BlockCard from './BlockCard';
import { ClientBlock, FilterTab, S, isActive } from './types';

type Client = { id: string; name: string; email: string; phone?: string | null };

const TIMEOUT_OPTIONS = [
    { label: 'Permanent', days: 0 },
    { label: '7 days', days: 7 },
    { label: '14 days', days: 14 },
    { label: '30 days', days: 30 },
    { label: '60 days', days: 60 },
    { label: '90 days', days: 90 },
    { label: 'Custom', days: -1 },
];

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,45,120,0.2)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 18, margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}><X size={14} /></button>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ ...S, fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>{label}</label>
            {children}
        </div>
    );
}

const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 13, padding: '10px 12px', outline: 'none', boxSizing: 'border-box' };
const btn: React.CSSProperties = { background: 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 10, padding: '11px', width: '100%', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 6 };
const btnOut: React.CSSProperties = { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', width: '100%', color: '#888', fontFamily: 'Poppins,sans-serif', fontSize: 13, cursor: 'pointer' };

export default function BlocklistPage() {
    const [blocks, setBlocks] = useState<ClientBlock[]>([]);
    const [activeCount, setActiveCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>('active');
    const [search, setSearch] = useState('');

    // Modals
    const [showAdd, setShowAdd] = useState(false);
    const [liftTarget, setLiftTarget] = useState<ClientBlock | null>(null);
    const [editTarget, setEditTarget] = useState<ClientBlock | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ClientBlock | null>(null);

    // Add form
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [addReason, setAddReason] = useState('');
    const [addTimeout, setAddTimeout] = useState(0);
    const [addCustomDays, setAddCustomDays] = useState('');
    const [addNote, setAddNote] = useState('');
    const [saving, setSaving] = useState(false);

    // Lift form
    const [liftReason, setLiftReason] = useState('');

    // Edit form
    const [editReason, setEditReason] = useState('');
    const [editTimeout, setEditTimeout] = useState(0);
    const [editCustomDays, setEditCustomDays] = useState('');
    const [editNote, setEditNote] = useState('');

    const fetchBlocks = useCallback(() => {
        setLoading(true);
        fetch(`/api/admin/blocklist?filter=${filter}&q=${encodeURIComponent(search)}`)
            .then(r => r.json())
            .then(d => {
                setBlocks(d.blocks || []);
                setActiveCount(d.activeCount ?? 0);
                setLoading(false);
            });
    }, [filter, search]);

    useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

    useEffect(() => {
        if (!showAdd) return;
        fetch(`/api/admin/customers?q=${encodeURIComponent(clientSearch)}`)
            .then(r => r.json())
            .then(d => setClients((d.customers || []).slice(0, 30)));
    }, [showAdd, clientSearch]);

    function openAdd() {
        setSelectedClient(null); setAddReason(''); setAddTimeout(0);
        setAddCustomDays(''); setAddNote(''); setClientSearch('');
        setShowAdd(true);
    }

    async function submitAdd() {
        if (!selectedClient || !addReason.trim()) return;
        const days = addTimeout === -1 ? parseInt(addCustomDays) || 0 : addTimeout;
        setSaving(true);
        await fetch('/api/admin/blocklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: selectedClient.id, reason: addReason, timeoutDays: days, adminNote: addNote }),
        });
        setSaving(false);
        setShowAdd(false);
        fetchBlocks();
    }

    async function submitLift() {
        if (!liftTarget || !liftReason.trim()) return;
        setSaving(true);
        await fetch('/api/admin/blocklist', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockId: liftTarget.id, action: 'lift', liftReason }),
        });
        setSaving(false);
        setLiftTarget(null); setLiftReason('');
        fetchBlocks();
    }

    async function submitEdit() {
        if (!editTarget || !editReason.trim()) return;
        const days = editTimeout === -1 ? parseInt(editCustomDays) || 0 : editTimeout;
        setSaving(true);
        await fetch('/api/admin/blocklist', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockId: editTarget.id, action: 'edit', reason: editReason, timeoutDays: days, adminNote: editNote }),
        });
        setSaving(false);
        setEditTarget(null);
        fetchBlocks();
    }

    async function submitDelete() {
        if (!deleteTarget) return;
        setSaving(true);
        await fetch(`/api/admin/blocklist?id=${deleteTarget.id}`, { method: 'DELETE' });
        setSaving(false);
        setDeleteTarget(null);
        fetchBlocks();
    }

    function openEdit(b: ClientBlock) {
        setEditTarget(b); setEditReason(b.reason);
        setEditTimeout(b.timeoutDays); setEditCustomDays(''); setEditNote('');
    }

    const filteredBySearch = search
        ? blocks.filter(b =>
            b.user.name.toLowerCase().includes(search.toLowerCase()) ||
            b.user.email?.toLowerCase().includes(search.toLowerCase()) ||
            b.user.phone?.toLowerCase().includes(search.toLowerCase()) ||
            b.reason.toLowerCase().includes(search.toLowerCase()))
        : blocks;

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'active', label: 'Active' },
        { key: 'lifted', label: 'Lifted' },
        { key: 'all', label: 'All' },
    ];

    return (
        <div style={{ maxWidth: 860 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 22, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldBan size={22} color="#FF2D78" /> Blocklist
                    </h1>
                    <p style={{ ...S, color: '#555', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {blocks.length} records
                        {activeCount > 0 && <span style={{ background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.35)', borderRadius: 50, padding: '1px 10px', fontSize: 11, color: '#FF2D78', fontWeight: 700 }}>{activeCount} currently blocked</span>}
                    </p>
                </div>
                <button onClick={openAdd} style={{ ...btn, width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 7, marginTop: 0, fontSize: 13 }}>
                    + Add to Blocklist
                </button>
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search size={14} color="#555" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email, or reason…"
                        style={{ ...inp, paddingLeft: 34 }} />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, gap: 4 }}>
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setFilter(t.key)} style={{ ...S, padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === t.key ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'transparent', color: filter === t.key ? '#fff' : '#555', transition: 'all 0.2s' }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)
                    : filteredBySearch.length === 0
                        ? <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <ShieldBan size={40} color="#2a2a2a" />
                            <p style={{ ...S, color: '#333', fontSize: 14, marginTop: 10 }}>No entries{filter === 'active' ? ' — no one is currently blocked' : ''}</p>
                          </div>
                        : filteredBySearch.map(b => (
                            <BlockCard key={b.id} block={b}
                                onLift={b => setLiftTarget(b)}
                                onEdit={openEdit}
                                onDelete={b => setDeleteTarget(b)}
                            />
                        ))
                }
            </div>

            {/* ── Add Modal ── */}
            {showAdd && (
                <Modal onClose={() => setShowAdd(false)}>
                    <ModalHeader title="Add to Blocklist" onClose={() => setShowAdd(false)} />
                    <Field label="Search Client">
                        <input value={clientSearch} onChange={e => { setClientSearch(e.target.value); setSelectedClient(null); }}
                            placeholder="Type name, email, or phone…" style={inp} />
                        {!selectedClient && clients.length > 0 && (
                            <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, marginTop: 4, maxHeight: 180, overflowY: 'auto' }}>
                                {clients.map(c => (
                                    <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(c.name); }}
                                        style={{ width: '100%', background: 'none', border: 'none', padding: '10px 14px', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ ...S, color: '#fff', fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                                        <span style={{ ...S, color: '#555', fontSize: 11, marginLeft: 8 }}>{c.email}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedClient && (
                            <div style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: 10, padding: '8px 12px', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ ...S, color: '#FF2D78', fontSize: 12, fontWeight: 600 }}>✓ {selectedClient.name} — {selectedClient.email}</span>
                                <button onClick={() => { setSelectedClient(null); setClientSearch(''); }} style={{ background: 'none', border: 'none', color: '#FF2D78', cursor: 'pointer', fontSize: 16 }}>×</button>
                            </div>
                        )}
                    </Field>
                    <Field label="Reason (required)">
                        <textarea value={addReason} onChange={e => setAddReason(e.target.value)} rows={3}
                            placeholder="e.g. 2 no-shows, chargeback dispute…"
                            style={{ ...inp, resize: 'vertical' }} />
                    </Field>
                    <Field label="Timeout Duration">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {TIMEOUT_OPTIONS.map(o => (
                                <button key={o.days} onClick={() => setAddTimeout(o.days)}
                                    style={{ ...S, padding: '6px 14px', borderRadius: 8, border: `1px solid ${addTimeout === o.days ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`, background: addTimeout === o.days ? 'rgba(255,45,120,0.15)' : 'transparent', color: addTimeout === o.days ? '#FF2D78' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                        {addTimeout === -1 && (
                            <input type="number" value={addCustomDays} onChange={e => setAddCustomDays(e.target.value)}
                                placeholder="Number of days" style={{ ...inp, marginTop: 8 }} />
                        )}
                    </Field>
                    <Field label="Admin Note (optional)">
                        <input value={addNote} onChange={e => setAddNote(e.target.value)} placeholder="Internal note…" style={inp} />
                    </Field>
                    <button onClick={submitAdd} disabled={!selectedClient || !addReason.trim() || saving} style={{ ...btn, opacity: !selectedClient || !addReason.trim() ? 0.4 : 1 }}>
                        {saving ? 'Saving…' : '🔒 Block Client'}
                    </button>
                </Modal>
            )}

            {/* ── Lift Modal ── */}
            {liftTarget && (
                <Modal onClose={() => setLiftTarget(null)}>
                    <ModalHeader title="Lift Block" onClose={() => setLiftTarget(null)} />
                    <div style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
                        <p style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 14 }}>{liftTarget.user.name}</p>
                        <p style={{ ...S, color: '#FF2D78', fontSize: 12, marginTop: 4 }}>Blocked for: {liftTarget.reason}</p>
                    </div>
                    <Field label="Reason for lifting (required)">
                        <textarea value={liftReason} onChange={e => setLiftReason(e.target.value)} rows={3}
                            placeholder="e.g. Client apologised and made payment…"
                            style={{ ...inp, resize: 'vertical' }} />
                    </Field>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setLiftTarget(null)} style={btnOut}>Cancel</button>
                        <button onClick={submitLift} disabled={!liftReason.trim() || saving}
                            style={{ ...btn, flex: 2, marginTop: 0, opacity: !liftReason.trim() ? 0.4 : 1, background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                            {saving ? '…' : '🔓 Lift Block'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Edit Modal ── */}
            {editTarget && (
                <Modal onClose={() => setEditTarget(null)}>
                    <ModalHeader title="Edit Block" onClose={() => setEditTarget(null)} />
                    <Field label="Reason">
                        <textarea value={editReason} onChange={e => setEditReason(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
                    </Field>
                    <Field label="Timeout Duration">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {TIMEOUT_OPTIONS.map(o => (
                                <button key={o.days} onClick={() => setEditTimeout(o.days)}
                                    style={{ ...S, padding: '6px 14px', borderRadius: 8, border: `1px solid ${editTimeout === o.days ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`, background: editTimeout === o.days ? 'rgba(255,45,120,0.15)' : 'transparent', color: editTimeout === o.days ? '#FF2D78' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                        {editTimeout === -1 && (
                            <input type="number" value={editCustomDays} onChange={e => setEditCustomDays(e.target.value)}
                                placeholder="Number of days" style={{ ...inp, marginTop: 8 }} />
                        )}
                    </Field>
                    <Field label="Admin Note (optional)">
                        <input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Internal note…" style={inp} />
                    </Field>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setEditTarget(null)} style={btnOut}>Cancel</button>
                        <button onClick={submitEdit} disabled={!editReason.trim() || saving}
                            style={{ ...btn, flex: 2, marginTop: 0, opacity: !editReason.trim() ? 0.4 : 1 }}>
                            {saving ? '…' : '✏️ Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <Modal onClose={() => setDeleteTarget(null)}>
                    <ModalHeader title="Delete Block Record" onClose={() => setDeleteTarget(null)} />
                    <p style={{ ...S, color: '#ccc', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
                        Permanently delete the block record for <strong style={{ color: '#fff' }}>{deleteTarget.user.name}</strong>?
                    </p>
                    <p style={{ ...S, color: '#ff6b6b', fontSize: 12, marginBottom: 20 }}>
                        ⚠️ This also deletes the full audit log for this block. This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setDeleteTarget(null)} style={btnOut}>Cancel</button>
                        <button onClick={submitDelete} disabled={saving}
                            style={{ ...btn, flex: 2, marginTop: 0, background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
                            {saving ? '…' : '🗑 Delete Record'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
