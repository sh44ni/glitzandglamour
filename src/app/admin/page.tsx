'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, TrendingUp, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import AnalyticsSection from '@/components/admin/AnalyticsSection';

type Booking = {
    id: string; guestName?: string; preferredDate: string; preferredTime: string;
    status: string; createdAt: string;
    user?: { name: string; email: string; };
    service: { name: string; };
};

function StatCard({ label, value, Icon, highlight }: { label: string; value: number; Icon: React.ElementType; highlight?: boolean }) {
    return (
        <div style={{
            background: highlight ? 'rgba(255,45,120,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${highlight ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '16px', padding: '16px 14px',
            display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
        }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: highlight ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={16} color={highlight ? '#FF2D78' : '#555'} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: highlight ? '#FF2D78' : '#fff', lineHeight: 1.1 }}>{value}</p>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '11px', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/bookings').then(r => r.json()).then(d => { setBookings(d.bookings || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const todaysBookings = bookings.filter(b => b.preferredDate === today);
    const pending = bookings.filter(b => b.status === 'PENDING');

    return (
        <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            {/* Page header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Dashboard</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '13px' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                <StatCard label="Today" value={todaysBookings.length} Icon={Calendar} />
                <StatCard label="Needs Action" value={pending.length} Icon={AlertCircle} highlight={pending.length > 0} />
                <StatCard label="Confirmed" value={bookings.filter(b => b.status === 'CONFIRMED').length} Icon={CheckCircle} />
                <StatCard label="Completed" value={bookings.filter(b => b.status === 'COMPLETED').length} Icon={TrendingUp} />
            </div>

            {/* Pending */}
            {pending.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#FF2D78', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={15} color="#FF2D78" /> Needs Your Attention ({pending.length})
                        </h2>
                        <Link href="/admin/bookings" style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            All bookings <ChevronRight size={12} />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {pending.slice(0, 5).map(b => (
                            <div key={b.id} style={{ background: 'rgba(255,183,0,0.04)', border: '1px solid rgba(255,183,0,0.12)', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <div style={{ minWidth: '200px', flex: 1 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#e0e0e0', fontSize: '14px', marginBottom: '4px' }}>
                                        {b.user?.name || b.guestName || 'Guest'}
                                        <span style={{ color: '#555', fontWeight: 400 }}> — {b.service.name}</span>
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={11} color="#444" /> {b.preferredDate} at {b.preferredTime}
                                    </p>
                                </div>
                                <Link href="/admin/bookings" className="btn-primary" style={{ padding: '7px 14px', fontSize: '12px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    Review <ChevronRight size={12} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's schedule */}
            {todaysBookings.length > 0 && (
                <div>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#555" /> Today&apos;s Schedule
                    </h2>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {todaysBookings.map(b => (
                            <div key={b.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <div style={{ minWidth: '150px', flex: 1 }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#ccc', fontSize: '14px', marginBottom: '2px' }}>
                                        {b.preferredTime} · {b.service.name}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px' }}>{b.user?.name || b.guestName || 'Guest'}</p>
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: b.status === 'CONFIRMED' ? '#00D478' : '#888', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{b.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && bookings.length === 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px' }}>No bookings yet. Share the site to get your first clients!</p>
                </div>
            )}

            {/* Analytics Section */}
            {!loading && <AnalyticsSection />}
        </div>
    );
}
