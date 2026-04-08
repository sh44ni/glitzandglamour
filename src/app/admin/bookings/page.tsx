'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, Mail, Smartphone, X, Edit2, Plus, ChevronDown, Check, Copy, Eye } from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';

type Service = { id: string; name: string; category: string; priceLabel: string; };

type Booking = {
    id: string; guestName?: string; guestEmail?: string; guestPhone?: string;
    preferredDate: string; preferredTime: string; status: string; notes?: string; createdAt: string;
    userId?: string | null;
    user?: { name: string; email: string; phone?: string; image?: string | null; };
    service: { name: string; priceLabel: string; };
    additionalServiceIds?: string | null;
    inspoImageUrls?: string[];
    isPromoBooking?: boolean;
    promoPrice?: number | null;
    bookingIp?: string | null;
    bookingUserAgent?: string | null;
    bookingCountry?: string | null;
    bookingRegion?: string | null;
    bookingCity?: string | null;
    bookingLatitude?: string | null;
    bookingLongitude?: string | null;
    healthIntake?: {
        skinTypes?: string[];
        healthQ?: Record<string, 'yes' | 'no'>;
        medications?: string;
        allergies?: string[];
        allergyNotes?: string;
        emergencyName?: string;
        emergencyPhone?: string;
        emergencyRelation?: string;
    } | null;
};

type ClientNote = {
    id: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;
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
            {/* Promo alert */}
            {booking.isPromoBooking && booking.promoPrice && (
                <div style={{
                    background: 'linear-gradient(135deg,rgba(255,45,120,0.12),rgba(255,45,120,0.06))',
                    border: '1px solid rgba(255,45,120,0.35)',
                    borderRadius: '12px', padding: '12px 16px',
                    marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>🌸</span>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
                            April Special Booking — Fixed ${booking.promoPrice}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px' }}>
                            This client booked via the April promotion. They expect a fixed price of <strong style={{ color: '#fff' }}>${booking.promoPrice}</strong> upon confirmation.
                        </p>
                    </div>
                </div>
            )}
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
// ─── Booking View Modal ──────────────────────────────────────────────────
function format12h(time24: string) {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
}

function BookingViewModal({ booking, onClose }: { booking: Booking; onClose: () => void; }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const customerName = booking.user?.name || booking.guestName || 'Guest';
    const customerEmail = booking.user?.email || booking.guestEmail || '—';
    const customerPhone = booking.user?.phone || booking.guestPhone || '—';

    const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
    const [loadingClientNotes, setLoadingClientNotes] = useState(false);
    const [clientNoteText, setClientNoteText] = useState('');
    const [savingClientNote, setSavingClientNote] = useState(false);
    const [deletingClientNoteId, setDeletingClientNoteId] = useState<string | null>(null);

    const canAttachClientNote = !!booking.userId;

    const [bookingNotesDraft, setBookingNotesDraft] = useState(booking.notes || '');
    const [savingBookingNotes, setSavingBookingNotes] = useState(false);

    const fetchClientNotes = useCallback(async () => {
        if (!booking.userId) return;
        setLoadingClientNotes(true);
        try {
            const r = await fetch(`/api/admin/customers/${booking.userId}/notes`);
            const d = await r.json();
            setClientNotes(d.notes || []);
        } finally {
            setLoadingClientNotes(false);
        }
    }, [booking.userId]);

    useEffect(() => {
        fetchClientNotes();
    }, [fetchClientNotes]);

    async function copyToClipboard(text: string) {
        if (!text || text === '—') return;
        try {
            await navigator.clipboard.writeText(text);
        } catch { }
    }

    async function addClientNote() {
        if (!booking.userId || !clientNoteText.trim()) return;
        setSavingClientNote(true);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: booking.userId, action: 'add-note', noteText: clientNoteText.trim() }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(d.error || 'Failed to save client note');
                return;
            }
            setClientNoteText('');
            await fetchClientNotes();
        } finally {
            setSavingClientNote(false);
        }
    }

    async function deleteClientNote(noteId: string) {
        if (!booking.userId) return;
        setDeletingClientNoteId(noteId);
        try {
            await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: booking.userId, action: 'delete-note', noteId }),
            });
            await fetchClientNotes();
        } finally {
            setDeletingClientNoteId(null);
        }
    }

    async function saveBookingNotes() {
        setSavingBookingNotes(true);
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, notes: bookingNotesDraft }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(d.error || 'Failed to save booking notes');
            }
        } finally {
            setSavingBookingNotes(false);
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                background: '#161616', border: '1px solid rgba(255,45,120,0.2)',
                borderRadius: '24px', width: '100%', maxWidth: '500px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '20px', margin: 0 }}>
                        Booking Details
                    </h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '8px', display: 'flex', transition: 'background 0.2s' }}>
                        <X size={18} color="#aaa" />
                    </button>
                </div>

                {/* Body scroll */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Name</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600 }}>{customerName}</p>
                            </div>
                            <button onClick={() => copyToClipboard(customerName)} title="Copy" style={{ background: 'none', border: 'none', color: '#FF2D78', cursor: 'pointer', padding: '8px' }}><Copy size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Phone</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 500 }}>{customerPhone}</p>
                            </div>
                            <button onClick={() => copyToClipboard(customerPhone)} title="Copy" style={{ background: 'none', border: 'none', color: '#FF2D78', cursor: 'pointer', padding: '8px' }}><Copy size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Email</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 500 }}>{customerEmail}</p>
                            </div>
                            <button onClick={() => copyToClipboard(customerEmail)} title="Copy" style={{ background: 'none', border: 'none', color: '#FF2D78', cursor: 'pointer', padding: '8px' }}><Copy size={16} /></button>
                        </div>
                    </div>

                    {/* Appointment Info */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Service Details</h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#FF2D78', marginBottom: '8px', fontWeight: 500 }}>{booking.service.name}</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="#888" /> {booking.preferredDate} at {format12h(booking.preferredTime)}</p>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                            Booking Notes <span style={{ fontSize: '11px', color: '#555', fontWeight: 400 }}>— per appointment</span>
                        </h3>

                        <textarea
                            value={bookingNotesDraft}
                            onChange={e => setBookingNotesDraft(e.target.value)}
                            placeholder="Add booking-specific notes (e.g. no-show, cancellation reason, follow-ups)…"
                            rows={3}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                padding: '12px 14px',
                                outline: 'none',
                                resize: 'vertical',
                                marginBottom: '10px',
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={saveBookingNotes}
                                disabled={savingBookingNotes}
                                style={{
                                    background: 'linear-gradient(135deg,#FF2D78,#7928CA)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '9px 14px',
                                    cursor: savingBookingNotes ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    opacity: savingBookingNotes ? 0.7 : 1,
                                }}
                            >
                                {savingBookingNotes ? 'Saving…' : 'Save Booking Notes'}
                            </button>
                        </div>
                    </div>

                    {/* Client Notes (Account-level) */}
                    {canAttachClientNote && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                Client Notes <span style={{ fontSize: '11px', color: '#555', fontWeight: 400 }}>— client profile (across bookings)</span>
                            </h3>

                            <>
                                {/* Quick tags */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    {['NO-SHOW', 'NO RESPONSE', 'CANCELLED BY US', 'MULTIPLE CANCELLATIONS', 'REQUIRE PREPAY', 'BLACKLIST CANDIDATE'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setClientNoteText(t => (t ? `${t}\n${tag}: ` : `${tag}: `))}
                                            style={{
                                                background: 'rgba(255,45,120,0.08)',
                                                border: '1px solid rgba(255,45,120,0.18)',
                                                color: '#FF2D78',
                                                borderRadius: '999px',
                                                padding: '4px 10px',
                                                cursor: 'pointer',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>

                                {/* Add note */}
                                <textarea
                                    value={clientNoteText}
                                    onChange={e => setClientNoteText(e.target.value)}
                                    placeholder="Add a note about this client (no-show, repeated cancellations, payment requirements, etc.)…"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '13px',
                                        padding: '12px 14px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        marginBottom: '10px',
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                                    <button
                                        onClick={addClientNote}
                                        disabled={!clientNoteText.trim() || savingClientNote}
                                        style={{
                                            background: clientNoteText.trim() ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.06)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '9px 14px',
                                            cursor: !clientNoteText.trim() || savingClientNote ? 'not-allowed' : 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: clientNoteText.trim() ? '#fff' : '#444',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {savingClientNote ? 'Saving…' : 'Save Client Note'}
                                    </button>
                                </div>

                                {/* Existing notes */}
                                {loadingClientNotes ? (
                                    <div style={{ padding: '10px 0', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#555' }}>Loading notes…</div>
                                ) : clientNotes.length === 0 ? (
                                    <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#777' }}>No client notes yet.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {clientNotes.map(n => (
                                            <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{n.text}</p>
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#444', marginTop: '6px' }}>
                                                            {new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteClientNote(n.id)}
                                                        disabled={deletingClientNoteId === n.id}
                                                        style={{
                                                            background: 'rgba(255,45,60,0.07)',
                                                            border: '1px solid rgba(255,45,60,0.18)',
                                                            borderRadius: '7px',
                                                            padding: '6px 8px',
                                                            cursor: 'pointer',
                                                            color: '#ff6b6b',
                                                            flexShrink: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                        title="Delete client note"
                                                    >
                                                        {deletingClientNoteId === n.id ? '…' : '🗑'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        </div>
                    )}

                    {/* Booking Origin (IP + Geo) */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                            Booking Origin <span style={{ fontSize: '11px', color: '#555', fontWeight: 400 }}>— where the booking was made from</span>
                        </h3>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Location</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd' }}>
                                    {[booking.bookingCity, booking.bookingRegion, booking.bookingCountry].filter(Boolean).join(', ') || '—'}
                                </p>
                                {(booking.bookingLatitude || booking.bookingLongitude) && (
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', marginTop: '6px' }}>
                                        {booking.bookingLatitude || '—'}, {booking.bookingLongitude || '—'}
                                    </p>
                                )}
                            </div>
                            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>IP Address</p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', wordBreak: 'break-all' }}>{booking.bookingIp || '—'}</p>
                                </div>
                                {booking.bookingIp && booking.bookingIp !== '—' && (
                                    <button onClick={() => copyToClipboard(booking.bookingIp!)} title="Copy"
                                        style={{ background: 'none', border: 'none', color: '#FF2D78', cursor: 'pointer', padding: '8px', flexShrink: 0 }}>
                                        <Copy size={16} />
                                    </button>
                                )}
                            </div>
                            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>User Agent</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb', wordBreak: 'break-word' }}>
                                    {booking.bookingUserAgent || '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Health Intake Form Data */}
                    {booking.healthIntake && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#FF2D78', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,45,120,0.2)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🩺 Health Intake Form
                            </h3>

                            {/* Skin Types */}
                            {booking.healthIntake.skinTypes && booking.healthIntake.skinTypes.length > 0 && (
                                <div style={{ marginBottom: '14px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Skin Type / Concerns</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {booking.healthIntake.skinTypes.map(t => (
                                            <span key={t} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ddd', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', padding: '3px 10px' }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Health Questions */}
                            {booking.healthIntake.healthQ && Object.keys(booking.healthIntake.healthQ).length > 0 && (
                                <div style={{ marginBottom: '14px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Health Questions</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {({
                                            pregnant: 'Pregnant or breastfeeding',
                                            accutane: 'Used Accutane / isotretinoin (12 mo)',
                                            retinoids: 'Using retinoids / exfoliating acids',
                                            botox: 'Botox / fillers / injections (2 wk)',
                                            surgery: 'Surgery / medical procedures (6 mo)',
                                            infections: 'Active skin infections / cold sores',
                                            autoimmune: 'Autoimmune / diabetes / circulatory',
                                            hsv: 'History of cold sores (HSV)',
                                            pacemaker: 'Pacemaker / implanted device',
                                        } as Record<string, string>).entries !== undefined &&
                                            Object.entries({
                                                pregnant: 'Pregnant or breastfeeding',
                                                accutane: 'Used Accutane / isotretinoin (12 mo)',
                                                retinoids: 'Using retinoids / exfoliating acids',
                                                botox: 'Botox / fillers / injections (2 wk)',
                                                surgery: 'Surgery / medical procedures (6 mo)',
                                                infections: 'Active skin infections / cold sores',
                                                autoimmune: 'Autoimmune / diabetes / circulatory',
                                                hsv: 'History of cold sores (HSV)',
                                                pacemaker: 'Pacemaker / implanted device',
                                            }).map(([key, label]) => {
                                                const val = booking.healthIntake!.healthQ![key];
                                                if (!val) return null;
                                                return (
                                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderRadius: '8px', background: val === 'yes' ? 'rgba(255,80,80,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${val === 'yes' ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ccc' }}>{label}</span>
                                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 700, color: val === 'yes' ? '#ff8888' : '#00D478', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{val}</span>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            )}

                            {/* Medications */}
                            {booking.healthIntake.medications && (
                                <div style={{ marginBottom: '14px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Current Medications</p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', fontStyle: 'italic', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>{booking.healthIntake.medications}</p>
                                </div>
                            )}

                            {/* Allergies */}
                            {booking.healthIntake.allergies && booking.healthIntake.allergies.length > 0 && (
                                <div style={{ marginBottom: '14px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Allergies / Reactions</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: booking.healthIntake.allergyNotes ? '8px' : '0' }}>
                                        {booking.healthIntake.allergies.map(a => (
                                            <span key={a} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ffaa88', background: 'rgba(255,100,50,0.1)', border: '1px solid rgba(255,100,50,0.25)', borderRadius: '50px', padding: '3px 10px' }}>{a}</span>
                                        ))}
                                    </div>
                                    {booking.healthIntake.allergyNotes && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb', fontStyle: 'italic', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>{booking.healthIntake.allergyNotes}</p>
                                    )}
                                </div>
                            )}

                            {/* Emergency Contact */}
                            {booking.healthIntake.emergencyName && (
                                <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Emergency Contact</p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '2px' }}>{booking.healthIntake.emergencyName}{booking.healthIntake.emergencyRelation && <span style={{ color: '#aaa', fontWeight: 400 }}> — {booking.healthIntake.emergencyRelation}</span>}</p>
                                    {booking.healthIntake.emergencyPhone && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF2D78' }}>{booking.healthIntake.emergencyPhone}</p>}
                                </div>
                            )}

                            {/* Consent badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)', borderRadius: '50px', padding: '5px 12px' }}>
                                <span style={{ color: '#00D478', fontSize: '13px' }}>✓</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#00D478', fontWeight: 600 }}>Consent Signed</span>
                            </div>
                        </div>
                    )}

                    {/* Images Gallery */}
                    {booking.inspoImageUrls && booking.inspoImageUrls.length > 0 && (
                        <div>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                Inspiration Gallery ({booking.inspoImageUrls.length}) <span style={{ fontSize: '11px', color: '#555', fontWeight: 400 }}>— tap to view</span>
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                                {booking.inspoImageUrls.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        style={{ display: 'block', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', background: '#000', cursor: 'zoom-in', padding: 0, width: '100%' }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt={`Inspo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                                            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                                            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                                        />
                                    </button>
                                ))}
                            </div>
                            {lightboxIndex !== null && (
                                <ImageLightbox
                                    images={booking.inspoImageUrls}
                                    startIndex={lightboxIndex}
                                    onClose={() => setLightboxIndex(null)}
                                />
                            )}
                        </div>
                    )}
                </div>
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
    const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

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
                                        {b.isPromoBooking && b.promoPrice && (
                                            <span style={{
                                                background: 'linear-gradient(135deg,#FF2D78,#CC1E5A)',
                                                color: '#fff', borderRadius: '50px', padding: '2px 10px',
                                                fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 700,
                                                letterSpacing: '0.3px',
                                            }}>🌸 PROMO ${b.promoPrice}</span>
                                        )}
                                        {(b as any).healthIntake && (
                                            <span style={{
                                                background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.25)',
                                                color: '#00D478', borderRadius: '50px', padding: '2px 9px',
                                                fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600,
                                            }}>🩺 Health Form</span>
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
                                        <Calendar size={13} /> {b.preferredDate} at {format12h(b.preferredTime)}
                                    </p>
                                    <div style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {customerEmail}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={12} /> {customerPhone}</span>
                                    </div>
                                    {b.notes && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>Notes: {b.notes}</p>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                    <button
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 500 }}
                                        onClick={() => setViewingBooking(b)}>
                                        <Eye size={13} color="#FF2D78" /> View Details
                                    </button>
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
            {viewingBooking && (
                <BookingViewModal booking={viewingBooking} onClose={() => setViewingBooking(null)} />
            )}
        </div>
    );
}
