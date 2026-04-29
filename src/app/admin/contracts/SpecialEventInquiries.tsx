'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Mail, MessageSquare, ChevronDown, RefreshCw } from 'lucide-react';

type Inquiry = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    eventType: string;
    eventDate: string;
    startTime: string | null;
    guestCount: string;
    location: string;
    services: string; // JSON string
    onLocation: string;
    inspiration: string | null;
    budget: string | null;
    referral: string | null;
    notes: string | null;
    status: string;
    createdAt: string;
};

const STATUS_OPTS = ['new', 'contacted', 'converted', 'closed'];

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    new:       { color: '#FF2D78', bg: 'rgba(255,45,120,0.1)',    border: 'rgba(255,45,120,0.3)' },
    contacted: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',    border: 'rgba(245,158,11,0.3)' },
    converted: { color: '#00D478', bg: 'rgba(0,212,120,0.1)',     border: 'rgba(0,212,120,0.3)' },
    closed:    { color: '#666',    bg: 'rgba(255,255,255,0.04)',  border: 'rgba(255,255,255,0.1)' },
};

function StatusPill({ status }: { status: string }) {
    const c = STATUS_COLORS[status] || STATUS_COLORS.new;
    return (
        <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            color: c.color, background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: '50px', padding: '3px 10px',
        }}>
            {status}
        </span>
    );
}

function InquiryCard({ inquiry, onStatusChange }: { inquiry: Inquiry; onStatusChange: (id: string, status: string) => void }) {
    const [open, setOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const services = (() => { try { return JSON.parse(inquiry.services); } catch { return [inquiry.services]; } })();

    async function changeStatus(status: string) {
        setUpdating(true);
        try {
            await fetch('/api/special-events-inquiry', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: inquiry.id, status }),
            });
            onStatusChange(inquiry.id, status);
        } finally {
            setUpdating(false);
        }
    }

    const date = new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = new Date(inquiry.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s',
        }}>
            {/* Header row */}
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px',
                    cursor: 'pointer', userSelect: 'none',
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                            {inquiry.firstName} {inquiry.lastName}
                        </span>
                        <StatusPill status={inquiry.status} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} /> {inquiry.eventType}
                        </span>
                        <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {inquiry.eventDate}
                        </span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{date} at {time}</span>
                    </div>
                </div>
                <ChevronDown size={16} style={{ color: '#666', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
            </div>

            {/* Expanded details */}
            {open && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                        <Detail icon={<Phone size={13} />} label="Phone" value={inquiry.phone} />
                        <Detail icon={<Mail size={13} />} label="Email" value={inquiry.email} />
                        <Detail icon={<Users size={13} />} label="Guests" value={inquiry.guestCount} />
                        <Detail icon={<MapPin size={13} />} label="Location" value={inquiry.location} />
                        {inquiry.startTime && <Detail icon={<Clock size={13} />} label="Start Time" value={inquiry.startTime} />}
                        {inquiry.budget && <Detail icon={null} label="Budget" value={inquiry.budget} />}
                        {inquiry.referral && <Detail icon={null} label="Found Us Via" value={inquiry.referral} />}
                        <Detail icon={null} label="On-Location?" value={inquiry.onLocation} />
                        {inquiry.inspiration && <Detail icon={null} label="Inspiration" value={inquiry.inspiration} />}
                    </div>

                    {/* Services */}
                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Services</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {services.map((s: string) => (
                                <span key={s} style={{ fontSize: '11px', background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', color: '#FF6BA8', borderRadius: '50px', padding: '3px 10px' }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {inquiry.notes && (
                        <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MessageSquare size={11} /> Notes
                            </span>
                            <p style={{ color: '#ccc', fontSize: '13px', marginTop: '6px', lineHeight: 1.6 }}>{inquiry.notes}</p>
                        </div>
                    )}

                    {/* Status actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#666', fontFamily: 'Poppins, sans-serif' }}>Update status:</span>
                        {STATUS_OPTS.map(s => (
                            <button
                                key={s}
                                disabled={updating || inquiry.status === s}
                                onClick={() => changeStatus(s)}
                                style={{
                                    fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                                    padding: '5px 12px', borderRadius: '50px', cursor: inquiry.status === s ? 'default' : 'pointer',
                                    border: `1px solid ${(STATUS_COLORS[s] || STATUS_COLORS.new).border}`,
                                    color: inquiry.status === s ? (STATUS_COLORS[s] || STATUS_COLORS.new).color : '#888',
                                    background: inquiry.status === s ? (STATUS_COLORS[s] || STATUS_COLORS.new).bg : 'transparent',
                                    opacity: updating ? 0.5 : 1, transition: 'all 0.2s',
                                    fontFamily: 'Poppins, sans-serif',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                        <a href={`tel:${inquiry.phone}`} style={{ marginLeft: 'auto', fontSize: '12px', color: '#FF2D78', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} /> Call
                        </a>
                        <a href={`mailto:${inquiry.email}`} style={{ fontSize: '12px', color: '#FF2D78', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> Email
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: '13px', color: '#ddd', fontFamily: 'Poppins, sans-serif' }}>{value}</div>
        </div>
    );
}

export default function SpecialEventInquiries() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/special-events-inquiry');
            if (res.ok) {
                const d = await res.json();
                setInquiries(d.inquiries || []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    function handleStatusChange(id: string, status: string) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    }

    const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);
    const counts = STATUS_OPTS.reduce((acc, s) => ({ ...acc, [s]: inquiries.filter(i => i.status === s).length }), {} as Record<string, number>);

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Summary bar */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                {[['all', inquiries.length], ...STATUS_OPTS.map(s => [s, counts[s]])].map(([s, count]) => (
                    <button
                        key={s as string}
                        onClick={() => setFilter(s as string)}
                        style={{
                            fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '50px', cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            background: filter === s ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${filter === s ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: filter === s ? '#FF2D78' : '#888',
                        }}
                    >
                        {String(s).charAt(0).toUpperCase() + String(s).slice(1)} <span style={{ opacity: 0.7 }}>({count})</span>
                    </button>
                ))}
                <button onClick={load} disabled={loading} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '6px 12px', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                </button>
            </div>

            {loading ? (
                <p style={{ color: '#666' }}>Loading inquiries…</p>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌸</div>
                    <p>No inquiries yet{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map(inq => (
                        <InquiryCard key={inq.id} inquiry={inq} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
