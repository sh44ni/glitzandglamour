'use client';

import { useEffect, useState, useCallback } from 'react';
import { Award, Star, Sparkles, Trash2 } from 'lucide-react';

type Customer = {
    id: string; name: string; email: string; phone?: string; createdAt: string; image?: string | null;
    loyaltyCard?: {
        currentStamps: number; lifetimeStamps: number; spinAvailable: boolean; spinsRedeemed: number;
        stamps: { id: string; earnedAt: string; note?: string; }[];
    };
    bookings: { id: string; preferredDate: string; service: { name: string; }; status: string; }[];
    _count: { bookings: number; };
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Customer | null>(null);
    const [acting, setActing] = useState(false);
    const [stampNote, setStampNote] = useState('');
    const [showStampNote, setShowStampNote] = useState(false);

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
        await fetchCustomers();
        // Refresh selected
        const updated = customers.find(c => c.id === customerId);
        if (updated) {
            const fresh = await fetch('/api/admin/customers').then(r => r.json());
            const refreshed = (fresh.customers || []).find((c: Customer) => c.id === customerId);
            setSelected(refreshed || null);
        }
        setActing(false);
        setShowStampNote(false);
        setStampNote('');
    }

    async function deleteCustomer(customerId: string) {
        if (!window.confirm('⚠️ Are you sure you want to delete this customer?\n\nThis will permanently delete ALL data related to them, including bookings, reviews, and loyalty stamps. This action CANNOT be undone.')) {
            return;
        }

        setActing(true);
        try {
            const res = await fetch(`/api/admin/customers?id=${customerId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setSelected(null);
                await fetchCustomers();
            } else {
                alert(data.error || 'Failed to delete customer');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while deleting the customer.');
        } finally {
            setActing(false);
        }
    }

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Customers</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>{customers.length} registered accounts</p>
            </div>

            <input
                className="input"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '16px' }}
            />

            <div style={{ display: 'grid', gap: '10px' }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '14px' }} />)
                ) : filtered.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555' }}>No customers found</p>
                    </div>
                ) : (
                    filtered.map(c => (
                        <button key={c.id} onClick={() => setSelected(c)}
                            style={{
                                background: selected?.id === c.id ? 'rgba(255,45,120,0.08)' : 'rgba(255,255,255,0.03)',
                                border: selected?.id === c.id ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                            }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '140px', flex: 1 }}>
                                    {c.image ? (
                                        <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                            background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px',
                                        }}>{c.name.charAt(0)}</div>
                                    )}
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px' }}>{c._count.bookings} visits</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px', fontWeight: 600 }}>
                                        <Star size={12} fill="#FF2D78" /> {c.loyaltyCard?.currentStamps ?? 0}/10
                                    </span>
                                    {c.loyaltyCard?.spinAvailable && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.4)', color: '#FF2D78', borderRadius: '50px', padding: '2px 8px', fontSize: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                                            <Sparkles size={10} /> SPIN READY
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Customer Detail Panel */}
            {selected && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    padding: '0',
                }} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
                    <div className="glass" style={{
                        maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
                        borderRadius: '24px 24px 0 0', padding: '32px 24px',
                        borderColor: 'rgba(255,45,120,0.25)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                {selected.image ? (
                                    <img src={selected.image} alt={selected.name} style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '20px',
                                    }}>{selected.name.charAt(0)}</div>
                                )}
                                <div>
                                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px', lineHeight: 1.2 }}>{selected.name}</h2>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px', marginTop: '2px' }}>Customer since {new Date(selected.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => deleteCustomer(selected.id)} disabled={acting} style={{ background: 'rgba(255,45,60,0.1)', border: '1px solid rgba(255,45,60,0.3)', color: '#ff4d4d', cursor: acting ? 'not-allowed' : 'pointer', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, transition: 'all 0.2s' }}>
                                    <Trash2 size={13} strokeWidth={2.5} /> Delete
                                </button>
                                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '22px', padding: '4px' }}>✕</button>
                            </div>
                        </div>

                        {/* Customer info */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: 'Email', val: selected.email, icon: null },
                                { label: 'Phone', val: selected.phone || '—', icon: null },
                                { label: 'Total Visits', val: String(selected._count.bookings), icon: null },
                                { label: 'Lifetime Stamps', val: String(selected.loyaltyCard?.lifetimeStamps ?? 0), icon: null },
                                { label: 'Spin Badges', val: String(selected.loyaltyCard?.spinsRedeemed ?? 0), icon: <Award size={13} color="#FF2D78" /> },
                                { label: 'Current Stamps', val: `${selected.loyaltyCard?.currentStamps ?? 0}/10`, icon: <Star size={13} color="#FF2D78" /> },
                            ].map(({ label, val, icon }) => (
                                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 14px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {icon} {val}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Spin Redeem Banner */}
                        {selected.loyaltyCard?.spinAvailable && (
                            <div style={{
                                background: 'rgba(255,45,120,0.1)', border: '1.5px solid rgba(255,45,120,0.4)',
                                borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', textAlign: 'center',
                            }}>
                                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FF2D78', fontSize: '15px', marginBottom: '4px' }}>
                                    <Sparkles size={16} /> Free Spin Pending!
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                                    {selected.name} has earned a free spin. Mark as redeemed after they spin the wheel.
                                </p>
                                <button className="btn-primary" disabled={acting} onClick={() => doAction(selected.id, 'redeem-spin')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    {acting ? 'Processing...' : <><Award size={14} /> Mark Spin Redeemed</>}
                                </button>
                            </div>
                        )}

                        {/* Manual stamp */}
                        <div style={{ marginBottom: '20px' }}>
                            {!showStampNote ? (
                                <button className="btn-outline" style={{ width: '100%', fontSize: '13px', padding: '10px' }} onClick={() => setShowStampNote(true)}>
                                    + Add Stamp Manually
                                </button>
                            ) : (
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px' }}>
                                    <label className="label">Reason (required)</label>
                                    <input type="text" className="input" placeholder="e.g. System error, goodwill gesture..."
                                        value={stampNote} onChange={e => setStampNote(e.target.value)} style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '10px' }} />
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button className="btn-outline" style={{ flex: 1, minWidth: '100px', fontSize: '13px', padding: '8px' }} onClick={() => { setShowStampNote(false); setStampNote(''); }}>Cancel</button>
                                        <button className="btn-primary" style={{ flex: 2, minWidth: '140px', fontSize: '13px', padding: '8px' }}
                                            disabled={!stampNote || acting}
                                            onClick={() => doAction(selected.id, 'add-stamp', stampNote)}>
                                            {acting ? '...' : 'Add Stamp'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Visit history */}
                        {selected.bookings.length > 0 && (
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '10px' }}>Recent Bookings</p>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {selected.bookings.map(b => (
                                        <div key={b.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px' }}>{b.service.name}</p>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px' }}>{b.preferredDate}</p>
                                            </div>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: b.status === 'COMPLETED' ? '#FF2D78' : '#666', fontSize: '11px', fontWeight: 600, alignSelf: 'center' }}>
                                                {b.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
