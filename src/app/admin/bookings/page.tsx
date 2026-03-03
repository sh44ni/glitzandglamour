'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, Mail, Smartphone, X, Edit2, Plus, ChevronDown, Check } from 'lucide-react';

type Service = { id: string; name: string; category: string; priceLabel: string; };

type Booking = {
    id: string; guestName?: string; guestEmail?: string; guestPhone?: string;
    preferredDate: string; preferredTime: string; status: string; notes?: string; createdAt: string;
    userId?: string | null;
    user?: { name: string; email: string; phone?: string; image?: string | null; };
    service: { name: string; priceLabel: string; };
    additionalServiceIds?: string | null;
};


const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
type Filter = typeof FILTERS[number];

const statusColor: Record<string, string> = {
    PENDING: '#FFB700', CONFIRMED: '#00D478', COMPLETED: '#FF2D78', CANCELLED: '#555',
};

const labelStyle: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif', color: '#999', fontSize: '11px',
    fontWeight: 600, display: 'block', marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
};

// ─── Service Dropdown ──────────────────────────────────────────────────────
function ServiceDropdown({ services, value, onChange }: {
    services: Service[];
    value: string;
    onChange: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = services.find(s => s.id === value);
    const byCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {});

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', padding: '11px 14px', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                    color: selected ? '#fff' : '#555', transition: 'border-color 0.2s',
                }}
            >
                <span>{selected ? `${selected.name} (${selected.priceLabel})` : '— Select a service —'}</span>
                <ChevronDown size={15} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                    background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px', overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                    maxHeight: '260px', overflowY: 'auto',
                }}>
                    {services.length === 0 && (
                        <div style={{ padding: '16px 14px', fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>
                            Loading services…
                        </div>
                    )}
                    {Object.entries(byCategory).map(([cat, svcs]) => (
                        <div key={cat}>
                            <div style={{
                                padding: '8px 14px 5px',
                                fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 700,
                                color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1px',
                                background: 'rgba(255,45,120,0.04)',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                {cat}
                            </div>
                            {svcs.map(s => {
                                const isSelected = value === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => { onChange(s.id); setOpen(false); }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            background: isSelected ? 'rgba(255,45,120,0.1)' : 'transparent',
                                            border: 'none', cursor: 'pointer', textAlign: 'left',
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        }}
                                        onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                                        onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                    >
                                        <div>
                                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500, color: isSelected ? '#FF2D78' : '#ddd' }}>
                                                {s.name}
                                            </div>
                                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555' }}>
                                                {s.priceLabel}
                                            </div>
                                        </div>
                                        {isSelected && <Check size={14} color="#FF2D78" />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Add Appointment Modal ─────────────────────────────────────────────────
function AddAppointmentModal({ services, onClose, onSaved }: {
    services: Service[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        customerName: '', serviceId: '', preferredDate: '', preferredTime: '',
        email: '', phone: '', notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.customerName.trim() || !form.serviceId || !form.preferredDate || !form.preferredTime) {
            setError('Name, service, date and time are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: form.customerName.trim(),
                    serviceId: form.serviceId,
                    preferredDate: form.preferredDate,
                    preferredTime: form.preferredTime,
                    email: form.email.trim() || undefined,
                    phone: form.phone.trim() || undefined,
                    notes: form.notes.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || 'Failed to create appointment.');
            } else {
                onSaved();
                onClose();
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                background: '#161616', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '460px',
                maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px', marginBottom: '2px' }}>
                            Add Appointment
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px' }}>
                            Create a booking on behalf of a customer.
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', padding: '6px', display: 'flex' }}>
                        <X size={16} color="#aaa" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Customer Name */}
                    <div>
                        <label style={labelStyle}>Customer Name <span style={{ color: '#FF2D78' }}>*</span></label>
                        <input className="input" type="text" placeholder="e.g. Maria Lopez"
                            value={form.customerName} onChange={e => set('customerName', e.target.value)}
                            style={{ width: '100%', fontSize: '14px' }} />
                    </div>

                    {/* Service */}
                    <div>
                        <label style={labelStyle}>Service <span style={{ color: '#FF2D78' }}>*</span></label>
                        <ServiceDropdown services={services} value={form.serviceId} onChange={id => set('serviceId', id)} />
                    </div>

                    {/* Date + Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Date <span style={{ color: '#FF2D78' }}>*</span></label>
                            <input className="input" type="date" value={form.preferredDate}
                                onChange={e => set('preferredDate', e.target.value)} style={{ width: '100%', fontSize: '14px' }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Time <span style={{ color: '#FF2D78' }}>*</span></label>
                            <input className="input" type="time" value={form.preferredTime}
                                onChange={e => set('preferredTime', e.target.value)} style={{ width: '100%', fontSize: '14px' }} />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Email <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <input className="input" type="email" placeholder="customer@email.com"
                            value={form.email} onChange={e => set('email', e.target.value)} style={{ width: '100%', fontSize: '14px' }} />
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '11px', marginTop: '4px' }}>
                            If this matches an existing account, the appointment auto-links to them.
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={labelStyle}>Phone <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <input className="input" type="tel" placeholder="+1 (760) 000-0000"
                            value={form.phone} onChange={e => set('phone', e.target.value)} style={{ width: '100%', fontSize: '14px' }} />
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={labelStyle}>Notes <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <textarea className="input" placeholder="Any special requests…"
                            value={form.notes} onChange={e => set('notes', e.target.value)}
                            style={{ width: '100%', fontSize: '14px', minHeight: '68px', resize: 'vertical' }} />
                    </div>

                    {error && (
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '13px', background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '8px', padding: '10px 14px' }}>
                            {error}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: saving ? 0.7 : 1 }} disabled={saving}>
                            {saving ? 'Saving…' : 'Add Appointment'}
                        </button>
                        <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Inline Confirm Panel ─────────────────────────────────────────────────
function ConfirmPanel({ booking, onDone, onCancel }: { booking: Booking; onDone: () => void; onCancel: () => void; }) {
    const [date, setDate] = useState(booking.preferredDate);
    const [time, setTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    async function confirm() {
        setSaving(true);
        await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id, status: 'CONFIRMED', newDate: date, newTime: time }),
        });
        setSaving(false);
        onDone();
    }

    return (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>
                Confirm appointment — optionally adjust date &amp; time first.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ ...labelStyle, fontSize: '10px' }}>Date</label>
                    <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', fontSize: '13px', padding: '8px 10px' }} />
                </div>
                <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ ...labelStyle, fontSize: '10px' }}>Time</label>
                    <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', fontSize: '13px', padding: '8px 10px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={confirm} disabled={saving} style={{ fontSize: '12px', padding: '8px 16px', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Confirming…' : 'Confirm Appointment ✅'}
                </button>
                <button className="btn-outline" onClick={onCancel} style={{ fontSize: '12px', padding: '8px 14px' }}>Back</button>
            </div>
        </div>
    );
}

// ─── Inline Edit Panel ────────────────────────────────────────────────────
function EditPanel({ booking, onDone, onCancel }: { booking: Booking; onDone: () => void; onCancel: () => void; }) {
    const [date, setDate] = useState(booking.preferredDate);
    const [time, setTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id, status: booking.status, newDate: date, newTime: time }),
        });
        setSaving(false);
        onDone();
    }

    return (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>
                Edit date &amp; time. Customer will be notified if they have an email on file.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ ...labelStyle, fontSize: '10px' }}>Date</label>
                    <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', fontSize: '13px', padding: '8px 10px' }} />
                </div>
                <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ ...labelStyle, fontSize: '10px' }}>Time</label>
                    <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', fontSize: '13px', padding: '8px 10px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={save} disabled={saving} style={{ fontSize: '12px', padding: '8px 16px', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn-outline" onClick={onCancel} style={{ fontSize: '12px', padding: '8px 14px' }}>Cancel</button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filter, setFilter] = useState<Filter>('ALL');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchBookings = useCallback(() => {
        const url = filter === 'ALL' ? '/api/admin/bookings' : `/api/admin/bookings?status=${filter}`;
        return fetch(url).then(r => r.json()).then(d => {
            setBookings(d.bookings || []);
            setLoading(false);
        });
    }, [filter]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []));
    }, []);

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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Bookings</h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>{filtered.length} {filter === 'ALL' ? 'total' : filter.toLowerCase()} bookings</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '10px 18px' }}
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={15} /> Add Appointment
                </button>
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
                ) : filtered.map(b => {
                    const customerName = b.user?.name || b.guestName || 'Guest';
                    const customerEmail = b.user?.email || b.guestEmail || '—';
                    const customerPhone = b.user?.phone || b.guestPhone || '—';
                    const isGuest = !b.userId && !b.user;
                    const isConfirming = confirmingId === b.id;
                    const isEditing = editingId === b.id;
                    const canEdit = b.status === 'PENDING' || b.status === 'CONFIRMED';

                    const additionalIds = b.additionalServiceIds ? b.additionalServiceIds.split(',') : [];
                    const extraServices = additionalIds.map(id => services.find(s => s.id === id)).filter(Boolean) as Service[];
                    const allServiceNames = [b.service.name, ...extraServices.map(s => s.name)].join(', ');

                    return (
                        <div key={b.id} className="glass-card" style={{ padding: '18px 20px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                        {b.user?.image && <img src={b.user.image} alt={customerName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />}
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '15px' }}>{customerName}</p>
                                        {isGuest && (
                                            <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#666', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>Guest</span>
                                        )}
                                        <span style={{
                                            background: `${statusColor[b.status]}22`, border: `1px solid ${statusColor[b.status]}44`,
                                            color: statusColor[b.status], borderRadius: '50px', padding: '3px 9px',
                                            fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                                        }}>{b.status}</span>
                                    </div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                                        {allServiceNames} — {b.service.priceLabel}{extraServices.length > 0 ? '+' : ''}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={13} /> {b.preferredDate} at {b.preferredTime}
                                    </p>
                                    <div style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {customerEmail}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={12} /> {customerPhone}</span>
                                    </div>
                                    {b.notes && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>Notes: {b.notes}</p>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                    {b.status === 'PENDING' && !isConfirming && !isEditing && (
                                        <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}
                                            onClick={() => { setConfirmingId(b.id); setEditingId(null); }}>
                                            Confirm ✅
                                        </button>
                                    )}
                                    {b.status === 'CONFIRMED' && !isEditing && !isConfirming && (
                                        <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 14px', opacity: updating === b.id ? 0.7 : 1 }}
                                            disabled={updating === b.id} onClick={() => updateStatus(b.id, 'COMPLETED')}>
                                            {updating === b.id ? '…' : 'Mark Complete 🎉'}
                                        </button>
                                    )}
                                    {canEdit && !isConfirming && !isEditing && (
                                        <button
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            onClick={() => { setEditingId(b.id); setConfirmingId(null); }}>
                                            <Edit2 size={11} /> Edit
                                        </button>
                                    )}
                                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isConfirming && !isEditing && (
                                        <button className="btn-outline" style={{ fontSize: '11px', padding: '6px 12px', color: '#555', borderColor: 'rgba(255,255,255,0.1)' }}
                                            onClick={() => updateStatus(b.id, 'CANCELLED')}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isConfirming && (
                                <ConfirmPanel booking={b}
                                    onDone={async () => { setConfirmingId(null); await fetchBookings(); }}
                                    onCancel={() => setConfirmingId(null)} />
                            )}
                            {isEditing && (
                                <EditPanel booking={b}
                                    onDone={async () => { setEditingId(null); await fetchBookings(); }}
                                    onCancel={() => setEditingId(null)} />
                            )}
                        </div>
                    );
                })}
            </div>

            {showAddModal && (
                <AddAppointmentModal services={services} onClose={() => setShowAddModal(false)} onSaved={fetchBookings} />
            )}
        </div>
    );
}
